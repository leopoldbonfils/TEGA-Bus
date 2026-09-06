import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';
import Header from '../components/Header';
import {
  getNearbyStops,
  getActiveBuses,
  getNearbyBusesForDestination,
  getUpcomingTrip,
  NearbyStop,
  ActiveBus,
  RecommendedBus,
  UpcomingTrip,
} from '../services/busService';
import { BACKEND_URL } from '../constants/config';

const FALLBACK_LAT = -1.9400;
const FALLBACK_LNG = 30.1200;
const FALLBACK_LOCATION_NAME = 'Kimironko';

function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HomeScreen() {
  const [locationName, setLocationName] = useState<string>(FALLBACK_LOCATION_NAME);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: FALLBACK_LAT,
    longitude: FALLBACK_LNG,
  });
  const [nearbyStop, setNearbyStop] = useState<NearbyStop | null>(null);
  const [activeBuses, setActiveBuses] = useState<ActiveBus[]>([]);
  const [upcomingTrip, setUpcomingTrip] = useState<UpcomingTrip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Smart Bus Discovery State
  const [destination, setDestination] = useState<string>('');
  const [searchedDestination, setSearchedDestination] = useState<string | null>(null);
  const [discoveredBuses, setDiscoveredBuses] = useState<RecommendedBus[]>([]);
  const [isSearchingBuses, setSearchingBuses] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const fetchTransportData = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const [stops, buses, upTrip, approachingBuses] = await Promise.all([
        getNearbyStops(lat, lng).catch(() => null),
        getActiveBuses().catch(() => null),
        getUpcomingTrip(lat, lng).catch(() => null),
        getNearbyBusesForDestination(lat, lng).catch(() => null),
      ]);

      if (stops && stops.length > 0) {
        setNearbyStop(stops[0]);
      }

      if (buses && buses.length > 0) {
        setActiveBuses(buses);
      }

      if (upTrip) {
        setUpcomingTrip(upTrip);
      }

      // Automatically populate approaching buses on initial load
      if (approachingBuses && approachingBuses.length > 0) {
        setDiscoveredBuses(approachingBuses);
        setSearchedDestination('Approaching Buses');
      }

      if (!stops && !buses && !upTrip) {
        setError('Unable to load live transport data.');
      }
    } catch {
      setError('Unable to load live transport data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const initLocationAndData = useCallback(async () => {
    let lat = FALLBACK_LAT;
    let lng = FALLBACK_LNG;
    let locName = FALLBACK_LOCATION_NAME;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
        ]);

        if (position && position.coords) {
          lat = position.coords.latitude;
          lng = position.coords.longitude;

          try {
            const reverse = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (reverse && reverse.length > 0) {
              const place = reverse[0];
              locName = place.district || place.subregion || place.city || place.name || FALLBACK_LOCATION_NAME;
            }
          } catch {
            locName = FALLBACK_LOCATION_NAME;
          }
        }
      }
    } catch {
      // Fallback location is safely preserved
    }

    setLocationName(locName);
    setCoords({ latitude: lat, longitude: lng });
    await fetchTransportData(lat, lng);
  }, [fetchTransportData]);

  useEffect(() => {
    initLocationAndData();
  }, [initLocationAndData]);

  // Connect Socket.IO for live bus location updates
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    const handleLocationUpdate = (data: any) => {
      if (!data || !data.busNumber) return;

      // 1. Update Discovered / Approaching Buses
      setDiscoveredBuses((prevBuses) => {
        if (!prevBuses || prevBuses.length === 0) return prevBuses;
        const busIndex = prevBuses.findIndex(
          (b) => b.busNumber === data.busNumber || b.id === data.busId,
        );
        if (busIndex === -1) return prevBuses;

        const updated = { ...prevBuses[busIndex] };
        if (data.latitude && data.longitude) {
          updated.latitude = data.latitude;
          updated.longitude = data.longitude;
          const dist = calcDistanceKm(
            data.latitude,
            data.longitude,
            coords.latitude,
            coords.longitude,
          );
          updated.distanceKm = Math.max(0.1, Math.round(dist * 10) / 10);
          updated.distanceMeters = Math.round(updated.distanceKm * 1000);
        }
        if (data.speed !== undefined) {
          updated.speed = Math.round(data.speed);
          updated.isMoving = updated.speed > 2;
          updated.motionStatus = updated.isMoving ? 'MOVING' : 'PARKED';
        }
        if (data.currentStop) updated.currentStop = data.currentStop;
        if (data.nextStop) updated.nextStop = data.nextStop;

        const speedForEta = updated.speed > 10 ? updated.speed : 25;
        updated.etaMinutes =
          updated.distanceKm <= 0.2
            ? 1
            : Math.max(1, Math.round((updated.distanceKm / speedForEta) * 60));

        const updatedList = [...prevBuses];
        updatedList[busIndex] = updated;
        return updatedList.sort((a, b) => a.etaMinutes - b.etaMinutes);
      });

      // 2. Real-time update for Upcoming Trip Card (Never Stuck)
      setUpcomingTrip((prevTrip) => {
        if (!prevTrip || prevTrip.busNumber !== data.busNumber) return prevTrip;

        const updated = { ...prevTrip };
        if (data.latitude && data.longitude) {
          const distKm = calcDistanceKm(
            data.latitude,
            data.longitude,
            coords.latitude,
            coords.longitude,
          );
          updated.distanceMeters = Math.round(distKm * 1000);
          const spd =
            data.speed !== undefined && data.speed > 10
              ? data.speed
              : prevTrip.speed > 10
              ? prevTrip.speed
              : 25;
          updated.speed = data.speed !== undefined ? Math.round(data.speed) : prevTrip.speed;
          updated.isMoving = updated.speed > 2;

          if (updated.distanceMeters <= 150) {
            updated.status = 'Boarding';
            updated.statusLabel = 'At Stop';
            updated.etaMinutes = 0;
          } else {
            updated.etaMinutes = Math.max(1, Math.round((distKm / spd) * 60));
            updated.status = 'Arriving';
            updated.statusLabel = `in ${updated.etaMinutes} mins`;
          }
        }
        if (data.currentStop) updated.currentStop = data.currentStop;
        if (data.nextStop) updated.nextStop = data.nextStop;
        return updated;
      });

      // 3. Real-time update for Nearby Stop Buses (Moving vs Parked)
      setNearbyStop((prevStop) => {
        if (!prevStop) return prevStop;
        let changed = false;

        const updatedBuses = prevStop.buses
          ? prevStop.buses.map((b) => {
              if (b.busNumber === data.busNumber) {
                changed = true;
                const spd = data.speed !== undefined ? Math.round(data.speed) : b.speed;
                const moving = spd > 2;
                return {
                  ...b,
                  speed: spd,
                  isMoving: moving,
                  motionStatus: (moving ? 'MOVING' : 'PARKED') as 'MOVING' | 'PARKED',
                };
              }
              return b;
            })
          : prevStop.buses;

        const updatedDirections = prevStop.directions
          ? prevStop.directions.map((dg) => ({
              ...dg,
              buses: dg.buses.map((b) => {
                if (b.busNumber === data.busNumber) {
                  changed = true;
                  const spd = data.speed !== undefined ? Math.round(data.speed) : b.speed;
                  const moving = spd > 2;
                  return {
                    ...b,
                    speed: spd,
                    isMoving: moving,
                    motionStatus: (moving ? 'MOVING' : 'PARKED') as 'MOVING' | 'PARKED',
                  };
                }
                return b;
              }),
            }))
          : prevStop.directions;

        if (!changed) return prevStop;
        return { ...prevStop, buses: updatedBuses, directions: updatedDirections };
      });
    };

    socket.on('bus:location', handleLocationUpdate);
    socket.on('bus:location:update', handleLocationUpdate);

    return () => {
      socket.disconnect();
    };
  }, [coords.latitude, coords.longitude]);

  // Smart Bus Discovery Trigger
  const handleFindBuses = async () => {
    if (!destination.trim()) {
      return;
    }

    setSearchingBuses(true);
    setSearchError(null);
    setSearchedDestination(destination.trim());

    try {
      const buses = await getNearbyBusesForDestination(
        coords.latitude,
        coords.longitude,
        destination.trim(),
      );
      setDiscoveredBuses(buses);
    } catch {
      setSearchError('Unable to find buses heading to destination. Please try again.');
      setDiscoveredBuses([]);
    } finally {
      setSearchingBuses(false);
    }
  };

  const handleClearSearch = async () => {
    setDestination('');
    setSearchError(null);
    setSearchingBuses(true);
    try {
      const buses = await getNearbyBusesForDestination(coords.latitude, coords.longitude);
      setDiscoveredBuses(buses);
      setSearchedDestination('Approaching Buses');
    } catch {
      setDiscoveredBuses([]);
      setSearchedDestination(null);
    } finally {
      setSearchingBuses(false);
    }
  };

  const formatDistance = (meters?: number) => {
    if (meters === undefined || meters === null) return '500m';
    if (meters === 0) return '500m';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatWalkTime = (meters?: number) => {
    const effectiveMeters = meters === undefined || meters === null || meters === 0 ? 500 : meters;
    const mins = Math.max(1, Math.round(effectiveMeters / 80));
    return `${mins} min`;
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
    
        <View style={styles.searchBox}>
          <Text style={styles.title}>Where do you want to go?</Text>

          <TouchableOpacity style={styles.locationBox} activeOpacity={0.7} onPress={initLocationAndData}>
            <MaterialIcons name="my-location" size={20} color="#64748B" />
            <Text style={styles.locationText}>{locationName || 'Current Location'}</Text>
          </TouchableOpacity>

          <View style={styles.locationBox}>
            <Ionicons name="location" size={20} color="#0F172A" />
            <TextInput
              style={styles.destinationInput}
              placeholder="Search destination (e.g. Kimironko)"
              placeholderTextColor="#94A3B8"
              value={destination}
              onChangeText={setDestination}
              onSubmitEditing={handleFindBuses}
              returnKeyType="search"
            />
            {destination.length > 0 ? (
              <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.findButton}
            activeOpacity={0.85}
            onPress={handleFindBuses}
          >
            {isSearchingBuses ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.findButtonText}>FIND ROUTE</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7} onPress={() => router.push('/(tabs)/explore')}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="bus" size={20} color="#04325E" />
            </View>
            <Text style={styles.menuText}>Find Bus</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7} onPress={() => router.push('/map')}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="pin-drop" size={22} color="#04325E" />
            </View>
            <Text style={styles.menuText}>Nearby{'\n'}Stops</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7} onPress={() => router.push('/(tabs)/explore')}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="route" size={22} color="#04325E" />
            </View>
            <Text style={styles.menuText}>Plan Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7} onPress={() => router.push('/(tabs)/trips')}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="ticket-confirmation-outline" size={22} color="#04325E" />
            </View>
            <Text style={styles.menuText}>My{'\n'}Tickets</Text>
          </TouchableOpacity>
        </View>

        {upcomingTrip ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Trip</Text>
            </View>

            <View style={styles.tripCard}>
              <View style={styles.routeBox}>
                <Text style={styles.routeText}>ROUTE</Text>
                <Text style={styles.routeNumber}>{upcomingTrip.routeNumber}</Text>
              </View>

              <View style={styles.tripInfo}>
                <Text style={styles.destinationText}>{upcomingTrip.destination}</Text>
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={15} color="#64748B" />
                  <Text style={styles.timeText}>{upcomingTrip.time}</Text>
                </View>
              </View>

              <View style={styles.arrivalSection}>
                <View
                  style={[
                    styles.arrivingBox,
                    upcomingTrip.status === 'Boarding' && { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' },
                    upcomingTrip.status === 'Scheduled' && { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' },
                  ]}
                >
                  <Text
                    style={[
                      styles.arrivingText,
                      upcomingTrip.status === 'Boarding' && { color: '#04325E' },
                      upcomingTrip.status === 'Scheduled' && { color: '#475569' },
                    ]}
                  >
                    {upcomingTrip.status}
                  </Text>
                </View>
                <Text style={styles.minutesText}>{upcomingTrip.statusLabel}</Text>
              </View>
            </View>
          </>
        ) : null}

        {/* Smart Nearby Bus Discovery Results (Approaching Buses) */}
        {searchedDestination ? (
          <View style={styles.discoverySection}>
            <View style={styles.discoveryHeaderRow}>
              <Text style={styles.sectionTitle}>
                Buses to {searchedDestination}
              </Text>
              <TouchableOpacity onPress={handleClearSearch}>
                <Text style={styles.clearSearchText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {isSearchingBuses ? (
              <View style={styles.searchLoadingBox}>
                <ActivityIndicator size="small" color="#04325E" />
                <Text style={styles.searchLoadingText}>Finding active buses heading your way...</Text>
              </View>
            ) : searchError ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>{searchError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleFindBuses}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : discoveredBuses.length > 0 ? (
              discoveredBuses.map((bus) => (
                <View key={bus.id || bus.busNumber} style={styles.recommendedBusCard}>
                  {/* Card Header: Bus Badge & Motion indicator & Live indicator */}
                  <View style={styles.busCardHeader}>
                    <View style={styles.busNumberBadge}>
                      <Text style={styles.busNumberBadgeText}>BUS {bus.busNumber}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {bus.motionStatus === 'PARKED' ? (
                        <View style={styles.parkedBadge}>
                          <View style={styles.parkedDot} />
                          <Text style={styles.parkedText}>PARKED</Text>
                        </View>
                      ) : (
                        <View style={styles.movingBadge}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>MOVING</Text>
                        </View>
                      )}
                      <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.busRouteTitle}>{bus.routeName}</Text>

                  {/* 3-Column Stats: ETA, Distance, Speed */}
                  <View style={styles.statsCard}>
                    <View style={styles.statCol}>
                      <Text style={styles.statValue}>{bus.etaMinutes} min</Text>
                      <Text style={styles.statLabel}>ETA TO YOU</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCol}>
                      <Text style={styles.statValue}>
                        {bus.distanceKm < 1 ? `${bus.distanceMeters} m` : `${bus.distanceKm} km`}
                      </Text>
                      <Text style={styles.statLabel}>DISTANCE</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCol}>
                      <Text style={styles.statValue}>{bus.speed} km/h</Text>
                      <Text style={styles.statLabel}>SPEED</Text>
                    </View>
                  </View>

                  {/* Current & Next Stop */}
                  <View style={styles.stopProgressBox}>
                    <View style={styles.stopProgressRow}>
                      <Ionicons name="radio-button-on" size={14} color="#04325E" />
                      <Text style={styles.stopProgressLabel}>Current stop: </Text>
                      <Text style={styles.stopProgressValue}>{bus.currentStop}</Text>
                    </View>
                    <View style={styles.stopProgressRow}>
                      <Ionicons name="arrow-forward-circle-outline" size={14} color="#64748B" />
                      <Text style={styles.stopProgressLabel}>Next stop: </Text>
                      <Text style={styles.stopProgressValue}>{bus.nextStop}</Text>
                    </View>
                  </View>

                  {/* Driver & Plate Number Footer */}
                  <View style={styles.busCardFooter}>
                    <View style={styles.footerItem}>
                      <Ionicons name="person-outline" size={13} color="#64748B" />
                      <Text style={styles.footerText}>Driver: {bus.driverName}</Text>
                    </View>
                    <View style={styles.footerItem}>
                      <Ionicons name="car-outline" size={13} color="#64748B" />
                      <Text style={styles.footerText}>Plate: {bus.plateNumber}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="bus-outline" size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>
                  No buses heading to {searchedDestination} nearby.
                </Text>
                <Text style={styles.emptySubtitle}>
                  Try another destination or check again in a few moments.
                </Text>
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.nearbyHeader}>
          <Text style={styles.sectionTitle}>Nearby Stop</Text>
          <TouchableOpacity onPress={() => router.push('/map')}>
            <Text style={styles.viewMap}>View map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stopCard}>
          <View style={styles.stopNameRow}>
            <MaterialIcons name="grid-view" size={22} color="#04325E" />
            <Text style={styles.stopName}>
              {nearbyStop ? nearbyStop.name : 'Finding closest stop...'}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="bus-outline" size={16} color="#64748B" />
              <Text style={styles.detailText}>
                {formatDistance(nearbyStop?.distanceMeters)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="directions-walk" size={18} color="#64748B" />
              <Text style={styles.detailText}>
                {formatWalkTime(nearbyStop?.distanceMeters)}
              </Text>
            </View>
          </View>

          {/* Direction-specific bus lists with clear Moving vs Parked status */}
          {nearbyStop?.directions && nearbyStop.directions.length > 0 ? (
            <View style={{ marginTop: 14 }}>
              {nearbyStop.directions.map((dirGroup) => (
                <View key={dirGroup.direction} style={{ marginBottom: 12 }}>
                  <Text style={styles.directionGroupTitle}>
                    {dirGroup.direction}
                  </Text>
                  <View style={styles.busRowWrap}>
                    {dirGroup.buses.map((b) => (
                      <View key={b.id || b.busNumber} style={styles.stopBusItem}>
                        <View style={styles.busNumber}>
                          <Text style={styles.busText}>{b.busNumber}</Text>
                        </View>
                        <View
                          style={[
                            styles.motionStatusPill,
                            b.isMoving ? styles.motionMovingPill : styles.motionParkedPill,
                          ]}
                        >
                          <View
                            style={[
                              styles.motionDot,
                              b.isMoving ? styles.movingDotColor : styles.parkedDotColor,
                            ]}
                          />
                          <Text
                            style={[
                              styles.motionStatusText,
                              b.isMoving ? styles.movingTextColor : styles.parkedTextColor,
                            ]}
                          >
                            {b.isMoving ? `${b.speed} km/h` : 'Parked'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : nearbyStop?.buses && nearbyStop.buses.length > 0 ? (
            <>
              <Text style={styles.availableText}>Available Buses:</Text>
              <View style={styles.busRowWrap}>
                {nearbyStop.buses.map((b) => (
                  <View key={b.id || b.busNumber} style={styles.stopBusItem}>
                    <View style={styles.busNumber}>
                      <Text style={styles.busText}>{b.busNumber}</Text>
                    </View>
                    <View
                      style={[
                        styles.motionStatusPill,
                        b.isMoving ? styles.motionMovingPill : styles.motionParkedPill,
                      ]}
                    >
                      <View
                        style={[
                          styles.motionDot,
                          b.isMoving ? styles.movingDotColor : styles.parkedDotColor,
                        ]}
                      />
                      <Text
                        style={[
                          styles.motionStatusText,
                          b.isMoving ? styles.movingTextColor : styles.parkedTextColor,
                        ]}
                      >
                        {b.isMoving ? `${b.speed} km/h` : 'Parked'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : activeBuses && activeBuses.length > 0 ? (
            <>
              <Text style={styles.availableText}>Available Buses:</Text>
              <View style={styles.busRow}>
                {activeBuses.slice(0, 5).map((bus) => (
                  <View key={bus.id || bus.busNumber} style={styles.busNumber}>
                    <Text style={styles.busText}>{bus.busNumber}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.availableText}>Available Buses:</Text>
              <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                No buses stationed at this stop.
              </Text>
            </>
          )}

          {error ? (
            <TouchableOpacity
              onPress={() => fetchTransportData(coords.latitude, coords.longitude)}
              activeOpacity={0.7}
              style={{ marginTop: 10 }}
            >
              <Text style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic' }}>
                {error} Tap to retry.
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },

  searchBox: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  locationBox: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  destinationPlaceholder: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '400',
  },
  findButton: {
    height: 48,
    backgroundColor: '#04325E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#04325E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },


  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  menuButton: {
    flex: 1,
    height: 98,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  menuText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 14,
  },


  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  routeBox: {
    width: 52,
    height: 52,
    backgroundColor: '#04325E',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  routeNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  tripInfo: {
    flex: 1,
    marginLeft: 14,
  },
  destinationText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  arrivalSection: {
    alignItems: 'flex-end',
  },
  arrivingBox: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  arrivingText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  minutesText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },

  
  nearbyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewMap: {
    fontSize: 13,
    color: '#04325E',
    fontWeight: '600',
  },
  stopCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  stopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 30,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  availableText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  busRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  busNumber: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
  },
  busText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#04325E',
  },

  /* Smart Bus Discovery Styles */
  destinationInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  discoverySection: {
    marginBottom: 20,
  },
  discoveryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearSearchText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  searchLoadingBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchLoadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  recommendedBusCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  busCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  busNumberBadge: {
    backgroundColor: '#04325E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  busNumberBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  busRouteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#04325E',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
  },
  stopProgressBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  stopProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stopProgressLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  stopProgressValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    flexShrink: 1,
  },
  busCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#04325E',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Motion & Direction Status Styles */
  parkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  parkedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748B',
  },
  parkedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.4,
  },
  movingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  directionGroupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  busRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stopBusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  motionStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  motionMovingPill: {
    backgroundColor: '#DCFCE7',
  },
  motionParkedPill: {
    backgroundColor: '#F1F5F9',
  },
  motionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  movingDotColor: {
    backgroundColor: '#16A34A',
  },
  parkedDotColor: {
    backgroundColor: '#94A3B8',
  },
  motionStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  movingTextColor: {
    color: '#15803D',
  },
  parkedTextColor: {
    color: '#64748B',
  },
});
