import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons, } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { io, Socket } from 'socket.io-client';
import Header from '../components/Header';
import { BACKEND_URL } from '../constants/config';
import { ActiveBus, getActiveBuses, getNearbyBusesForDestination, getNearbyStops, NearbyStop, RecommendedBus } from '../services/busService';

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
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({latitude: FALLBACK_LAT, longitude: FALLBACK_LNG,});
  const [nearbyStop, setNearbyStop] = useState<NearbyStop | null>(null);
  const [nearbyBuses, setNearbyBuses] = useState<RecommendedBus[]>([]);
  const [activeBuses, setActiveBuses] = useState<ActiveBus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const [destination, setDestination] = useState<string>('');

  const socketRef = useRef<Socket | null>(null);

  const fetchTransportData = useCallback(async (lat: number, lng: number, searchDestination?: string) => {
    setLoading(true);
    setError(null);
    try {
      const destTerm = searchDestination !== undefined ? searchDestination.trim() : destination.trim();
      const [stops, busesList, activeList] = await Promise.all([
        getNearbyStops(lat, lng).catch(() => null),
        getNearbyBusesForDestination(lat, lng, destTerm || undefined).catch(() => null),
        getActiveBuses().catch(() => null),
      ]);

      if (stops && stops.length > 0) {
        setNearbyStop(stops[0]);
      }

      if (activeList && activeList.length > 0) {
        setActiveBuses(activeList);
      }

      
      const combinedMap = new Map<string, RecommendedBus>();

      if (busesList && Array.isArray(busesList)) {
        for (const b of busesList) {
          if (b && (b.id || b.busNumber)) {
            const key = b.busNumber || b.id;
            combinedMap.set(key, b);
          }
        }
      }

      //  Ensure all active buses from the DB exist in the list
      if (activeList && Array.isArray(activeList)) {
        for (const act of activeList) {
          const key = act.busNumber || act.id;
          if (!combinedMap.has(key)) {
            // Bus coordinate fallback: Nyabugogo terminal for Bus 303, or default coordinates
            const busLat =
              (act as any).location?.latitude ??
              (act as any).latitude ??
              (act.busNumber === '303' ? -1.9346 : lat);
            const busLng =
              (act as any).location?.longitude ??
              (act as any).longitude ??
              (act.busNumber === '303' ? 30.0540 : lng);

            const dist = calcDistanceKm(lat, lng, busLat, busLng);
            const distMeters = Math.round(dist * 1000);
            const etaMins = Math.max(1, Math.round((dist / 30) * 60));

            const rName =
              act.routeName ||
              (act as any).route?.name ||
              (act.busNumber === '303'
                ? 'Route 303 - Nyabugogo Nyacyonga'
                : `Route ${act.busNumber}`);
            const rNum = (act as any).routeNumber || act.busNumber || '100';

            combinedMap.set(key, {
              id: act.id,
              busNumber: act.busNumber,
              plateNumber: act.plateNumber || `RAD ${act.busNumber}A`,
              driverName: (act as any).driverName || 'Tega Driver',
              routeName: rName,
              routeNumber: rNum,
              destination:
                (act as any).destination ||
                (act.busNumber === '303' ? 'Nyacyonga' : 'Terminal'),
              latitude: busLat,
              longitude: busLng,
              speed: act.speed ?? 24,
              heading: (act as any).heading ?? 0,
              currentStop:
                (act as any).currentStop ||
                (act.busNumber === '303' ? 'Nyabugogo Terminal' : 'In transit'),
              nextStop:
                (act as any).nextStop ||
                (act.busNumber === '303' ? 'Gatsata' : 'Approaching'),
              distanceKm: Math.max(0.1, Math.round(dist * 10) / 10),
              distanceMeters: distMeters,
              etaMinutes: etaMins,
              status: act.status || 'ACTIVE',
              isApproaching: true,
              isMoving: (act.speed ?? 24) > 0,
              motionStatus: (act.speed ?? 24) > 0 ? 'MOVING' : 'PARKED',
            });
          }
        }
      }

      let allNearby = Array.from(combinedMap.values()).sort(
        (a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0),
      );

      // If a destination was searched, filter matching buses by destination, route name, or stops
      if (destTerm) {
        const lower = destTerm.toLowerCase();
        allNearby = allNearby.filter((b) => {
          const rName = (b.routeName || '').toLowerCase();
          const dName = (b.destination || '').toLowerCase();
          const rNum = (b.routeNumber || '').toLowerCase();
          const cStop = (b.currentStop || '').toLowerCase();
          const nStop = (b.nextStop || '').toLowerCase();
          return (
            rName.includes(lower) ||
            dName.includes(lower) ||
            rNum.includes(lower) ||
            cStop.includes(lower) ||
            nStop.includes(lower)
          );
        });
      }

      setNearbyBuses(allNearby);

      if (!stops && !busesList && !activeList) {
        setError('Unable to load nearby buses.');
      }
    } catch {
      setError('Unable to load nearby buses.');
    } finally {
      setLoading(false);
    }
  }, [destination]);

  const handleFindRoute = useCallback(async () => {
    const term = destination.trim();
    await fetchTransportData(coords.latitude, coords.longitude, term);
  }, [destination, coords.latitude, coords.longitude, fetchTransportData]);

  const handleClearDestination = useCallback(async () => {
    setDestination('');
    await fetchTransportData(coords.latitude, coords.longitude, '');
  }, [coords.latitude, coords.longitude, fetchTransportData]);

  const detectGpsLocation = useCallback(
    async (forceHighAccuracy = false) => {
      let lat = coords.latitude || FALLBACK_LAT;
      let lng = coords.longitude || FALLBACK_LNG;
      let locName = locationName || FALLBACK_LOCATION_NAME;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          
          
          
          // Immediately check last known position (fast, accurate cached fix)
          if (!forceHighAccuracy) {
            try {
              const lastKnown = await Location.getLastKnownPositionAsync();
              if (lastKnown && lastKnown.coords) {
                lat = lastKnown.coords.latitude;
                lng = lastKnown.coords.longitude;
              }
            } catch {
              //
            }
          }

          //  Query GPS with reasonable 10s timeout so devices have time to lock
          try {
            const positionPromise = Location.getCurrentPositionAsync({
              accuracy: forceHighAccuracy
                ? Location.Accuracy.High
                : Location.Accuracy.Balanced,
            });
            const timeoutPromise = new Promise<null>((resolve) =>
              setTimeout(() => resolve(null), 10000),
            );
            const position = await Promise.race([positionPromise, timeoutPromise]);

            if (position && position.coords) {
              lat = position.coords.latitude;
              lng = position.coords.longitude;
            }
          } catch {
            // Keep coordinates obtained so far
          }

          //  Reverse geocode place name
          try {
            const reverse = await Location.reverseGeocodeAsync({
              latitude: lat,
              longitude: lng,
            });
            if (reverse && reverse.length > 0) {
              const place = reverse[0];
              locName =
                place.district ||
                place.subregion ||
                place.city ||
                place.name ||
                locName;
            }
          } catch {
            // Keep fallback or existing name
          }
        }
      } catch {
        // Fallback location preserved safely
      }

      setLocationName(locName);
      setCoords({ latitude: lat, longitude: lng });
      await fetchTransportData(lat, lng);
    },
    [coords.latitude, coords.longitude, locationName, fetchTransportData],
  );

  const initLocationAndData = useCallback(async () => {
    await detectGpsLocation(false);
  }, [detectGpsLocation]);

  const handleSelectLocation = () => {
    Alert.alert(
      'Set Your Location',
      'Choose your current boarding area or re-detect using GPS:',
      [
        {
          text: ' Re-detect GPS (Accurate)',
          onPress: () => detectGpsLocation(true),
        },
        {
          text: 'Nyabugogo Terminal',
          onPress: () => {
            setLocationName('Nyabugogo Terminal');
            setCoords({ latitude: -1.9346, longitude: 30.0540 });
            fetchTransportData(-1.9346, 30.0540);
          },
        },
        {
          text: ' Downtown (City Center)',
          onPress: () => {
            setLocationName('Downtown Terminal');
            setCoords({ latitude: -1.9441, longitude: 30.0619 });
            fetchTransportData(-1.9441, 30.0619);
          },
        },
        {
          text: ' Kimironko Terminal',
          onPress: () => {
            setLocationName('Kimironko');
            setCoords({ latitude: -1.9400, longitude: 30.1200 });
            fetchTransportData(-1.9400, 30.1200);
          },
        },
        {
          text: ' Nyacyonga',
          onPress: () => {
            setLocationName('Nyacyonga');
            setCoords({ latitude: -1.8682, longitude: 30.0847 });
            fetchTransportData(-1.8682, 30.0847);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  useEffect(() => {
    initLocationAndData();
  }, [initLocationAndData]);

  // Use a ref so the socket handler always reads the latest coords
 
  const coordsRef = useRef(coords);
  useEffect(() => { coordsRef.current = coords; }, [coords]);

  // Connect Socket.IO for live bus updates (nearby buses and stop movement only).
 
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    const handleLocationUpdate = (data: any) => {
      if (!data || !data.busNumber) return;

      // Read latest coords from ref (avoids stale closure without re-subscribing)
      const { latitude: userLat, longitude: userLng } = coordsRef.current;

      // 1. Update Nearby Buses
      setNearbyBuses((prevBuses) => {
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
            userLat,
            userLng,
          );
          updated.distanceKm = Math.max(0.1, Math.round(dist * 10) / 10);
          updated.distanceMeters = Math.round(updated.distanceKm * 1000);
          // Recalculate ETA from live speed and distance
          if (data.speed && data.speed > 5) {
            updated.etaMinutes = Math.max(1, Math.round((updated.distanceKm / data.speed) * 60));
          }
        }
        if (data.speed !== undefined) {
          updated.speed = Math.round(data.speed);
          updated.isMoving = updated.speed > 2;
          updated.motionStatus = updated.isMoving ? 'MOVING' : 'PARKED';
        }
        if (data.etaMinutes != null) updated.etaMinutes = data.etaMinutes;
        if (data.currentStop) updated.currentStop = data.currentStop;
        if (data.nextStop) updated.nextStop = data.nextStop;

        const updatedList = [...prevBuses];
        updatedList[busIndex] = updated;
        return updatedList.sort(
          (a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0),
        );
      });

      //  Real-time update for Nearby Stop Buses (Moving or Parked)

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
  }, []); 
  
  // eslint-disable-line react-hooks/exhaustive-deps


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

          <TouchableOpacity style={styles.locationBox} activeOpacity={0.7} onPress={handleSelectLocation}>
            <MaterialIcons name="my-location" size={20} color="#04325E" />
            <Text style={[styles.locationText, { flex: 1 }]} numberOfLines={1}> {locationName || 'Current Location'} </Text>
            <Ionicons name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.locationBox}>
            <Ionicons name="location" size={20} color="#0F172A" />
            <TextInput style={styles.destinationInput} placeholder="Search destination (e.g. Kimironko)" placeholderTextColor="#94A3B8" value={destination} onChangeText={setDestination} returnKeyType="search" onSubmitEditing={handleFindRoute} />
            {destination.length > 0 ? (
              <TouchableOpacity onPress={handleClearDestination} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity style={styles.findButton} activeOpacity={0.85} onPress={handleFindRoute}>
            <Text style={styles.findButtonText}>FIND ROUTE</Text>
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

        
        <View style={styles.nearbyHeader}>
          <Text style={styles.sectionTitle}>
            {destination.trim() ? `Buses to "${destination.trim()}"` : 'Buses Near You'}
          </Text>
          {destination.trim() ? (
            <TouchableOpacity onPress={handleClearDestination}>
              <Text style={styles.viewMap}>Clear search</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.viewMap}>View all</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.searchLoadingBox}>
            <ActivityIndicator size="small" color="#04325E" />
            <Text style={styles.searchLoadingText}>
              {destination.trim()
                ? `Finding buses to ${destination.trim()}...`
                : 'Finding buses near you...'}
            </Text>
          </View>
        ) : error && nearbyBuses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Unable to load buses.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleFindRoute}>
              <Text style={styles.retryButtonText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        ) : nearbyBuses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {destination.trim()
                ? `No buses found heading to "${destination.trim()}".`
                : 'No nearby buses available.'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {destination.trim()
                ? 'Try searching for another destination or view all nearby buses.'
                : 'Please check back shortly or explore popular routes.'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleClearDestination}>
              <Text style={styles.retryButtonText}>
                {destination.trim() ? 'Show all nearby buses' : 'Tap to retry'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          nearbyBuses.map((bus) => (
            <View key={bus.id || bus.busNumber} style={styles.recommendedBusCard}>
              
              <View style={styles.busCardHeader}>
                <View style={styles.busNumberBadge}>
                  <Text style={styles.busNumberBadgeText}>BUS {bus.busNumber}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                </View>
              </View>

              <Text style={styles.busRouteTitle}>{bus.routeName}</Text>

            
              <View style={styles.statsCard}>
                <View style={styles.statCol}>
                  <Text style={styles.statValue}>
                    {bus.distanceKm < 1 ? `${bus.distanceMeters} m` : `${bus.distanceKm} km`}
                  </Text>
                  <Text style={styles.statLabel}>DISTANCE</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statValue}>
                    {bus.speed > 0 ? `${bus.speed} km/h` : '0 km/h'}
                  </Text>
                  <Text style={styles.statLabel}>SPEED</Text>
                </View>
              </View>

            
              <View style={styles.busCardBottomRow}>
                <View style={styles.stopInfoCol}>
                  <View style={styles.stopInfoRow}>
                    <Ionicons name="radio-button-on" size={14} color="#04325E" />
                    <Text style={styles.stopInfoText} numberOfLines={1}>
                      <Text style={styles.stopLabel}>Current stop: </Text>
                      <Text style={styles.stopValue}>{bus.currentStop || 'In transit'}</Text>
                    </Text>
                  </View>
                  <View style={styles.stopInfoRow}>
                    <Ionicons name="arrow-forward-circle-outline" size={14} color="#64748B" />
                    <Text style={styles.stopInfoText} numberOfLines={1}>
                      <Text style={styles.stopLabel}>Next stop: </Text>
                      <Text style={styles.stopValue}>{bus.nextStop || 'Approaching'}</Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.viewRouteBtn} activeOpacity={0.7} onPress={() =>
                  router.push({
                    pathname: '/bus-details',
                    params: {
                      busId: bus.id,
                      busNumber: bus.busNumber,
                      routeName: bus.routeName,
                      routeNumber: bus.routeNumber,
                      currentStop: bus.currentStop,
                      nextStop: bus.nextStop,
                      speed: (bus.speed ?? 0).toString(),
                      motionStatus: bus.motionStatus || (bus.isMoving ? 'MOVING' : 'PARKED'),
                      distanceKm: (bus.distanceKm ?? 1.2).toString(),
                      etaMinutes: (bus.etaMinutes ?? 3).toString(),
                      userLat: coords.latitude.toString(),
                      userLng: coords.longitude.toString(),
                    },
                  })
                  }
                >
                  <Text style={styles.viewRouteBtnText}>VIEW DETAILS </Text>
                  <Ionicons name="chevron-forward" size={12} color="#04325E" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}


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
                        <View style={[ styles.motionStatusPill,
                            b.isMoving ? styles.motionMovingPill : styles.motionParkedPill,
                          ]}
                        >
                          <View
                            style={[ styles.motionDot,
                              b.isMoving ? styles.movingDotColor : styles.parkedDotColor,
                            ]}
                          />
                          <Text
                            style={[ styles.motionStatusText,
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
                    <View style={[styles.motionStatusPill,
                        b.isMoving ? styles.motionMovingPill : styles.motionParkedPill,
                      ]}
                    >
                      <View
                        style={[ styles.motionDot,
                          b.isMoving ? styles.movingDotColor : styles.parkedDotColor,
                        ]}
                      />
                      <Text
                        style={[styles.motionStatusText,
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
  busCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  stopInfoCol: {
    flex: 1,
    gap: 6,
  },
  stopInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stopInfoText: {
    flexShrink: 1,
  },
  stopLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  stopValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  viewRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#04325E',
    backgroundColor: '#FFFFFF',
  },
  viewRouteBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#04325E',
    letterSpacing: 0.4,
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
