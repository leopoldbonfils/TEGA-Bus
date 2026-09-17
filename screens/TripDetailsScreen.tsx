import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import Header from '../components/Header';
import { getTripById, Trip, TripStop } from '../services/tripService';

export default function TripDetailsScreen() {
  const params = useLocalSearchParams<{ tripId?: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTrip = async () => {
      setLoading(true);
      try {
        const data = await getTripById(params.tripId || 'trip-act-1');
        if (isMounted) setTrip(data);
      } catch {
        // Handled with fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTrip();
    return () => {
      isMounted = false;
    };
  }, [params.tripId]);

  const stops: TripStop[] = React.useMemo(() => {
    if (trip?.route?.stops && trip.route.stops.length > 0) {
      return trip.route.stops;
    }
    // Fallback stops derived from route locations if stops list is not provided
    return [
      {
        id: 'stop-start',
        name: trip?.route?.startLocation || 'Departure Station',
        latitude: 0,
        longitude: 0,
        order: 1,
        time: 'Departure',
      },
      {
        id: 'stop-dest',
        name: trip?.route?.destination || 'Destination Terminal',
        latitude: 0,
        longitude: 0,
        order: 2,
        time: 'Arrival',
      },
    ];
  }, [trip]);

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return { text: 'In Transit', bg: '#D8F5E4', color: '#15803D' };
      case 'COMPLETED':
        return { text: 'Completed', bg: '#E2E8F0', color: '#334155' };
      case 'CANCELLED':
        return { text: 'Cancelled', bg: '#FEE2E2', color: '#B91C1C' };
      case 'SCHEDULED':
      default:
        return { text: 'Scheduled', bg: '#DCEAFF', color: '#193B64' };
    }
  };

  const statusInfo = getStatusDisplay(trip?.status);

  return (
    <View style={styles.container}>
      <Header title="Trip Details" showBack onBack={() => router.back()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#032D55" />
          <Text style={styles.loadingText}>Loading trip details...</Text>
        </View>
      ) : trip ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Trip Summary Card */}
          <View style={styles.tripCard}>
            <View style={styles.tripTopRow}>
              <View style={styles.todayBadge}>
                <Ionicons name="calendar-outline" size={13} color="#3E4D60" />
                <Text style={styles.todayText}>{trip.formattedTime || 'Today'}</Text>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.text}
                </Text>
              </View>
            </View>

            <View style={styles.tripMiddleRow}>
              <View style={styles.routeHeaderInfo}>
                <Text style={styles.city}>
                  {trip.route.startLocation} →
                </Text>
                <Text style={styles.city}>{trip.route.destination}</Text>

                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={14} color="#59616C" />
                  <Text style={styles.timeText}>
                    Duration: ~{trip.route.estimatedDuration || 30} mins
                  </Text>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.priceCurrency}>RWF</Text>
                <Text style={styles.price}>{trip.route.fare || 500}</Text>
              </View>
            </View>
          </View>

          {/* Bus & Driver Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.cardHeaderTitle}>Bus & Service Information</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoGridItem}>
                <Ionicons name="bus-outline" size={18} color="#063F76" />
                <View>
                  <Text style={styles.infoItemLabel}>Bus Number</Text>
                  <Text style={styles.infoItemValue}>
                    Bus {trip.bus.busNumber || 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoGridItem}>
                <Ionicons name="card-outline" size={18} color="#063F76" />
                <View>
                  <Text style={styles.infoItemLabel}>Plate Number</Text>
                  <Text style={styles.infoItemValue}>
                    {trip.bus.plateNumber || 'TGA 001'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoGridItem}>
                <Ionicons name="person-outline" size={18} color="#063F76" />
                <View>
                  <Text style={styles.infoItemLabel}>Driver</Text>
                  <Text style={styles.infoItemValue}>
                    {trip.driver?.user?.name || 'Assigned Driver'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoGridItem}>
                <Ionicons name="speedometer-outline" size={18} color="#063F76" />
                <View>
                  <Text style={styles.infoItemLabel}>Speed</Text>
                  <Text style={styles.infoItemValue}>
                    {trip.status === 'ACTIVE' ? `${trip.speed || 30} km/h` : 'Stopped'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Route Map & Stops */}
          <View style={styles.routeCard}>
            <Text style={styles.routeTitle}>Route Stops & Timeline</Text>

            {stops.map((stop, index) => {
              const isFirst = index === 0;
              const isLast = index === stops.length - 1;
              const stopType = isFirst
                ? 'Departure'
                : isLast
                ? 'Destination'
                : `Stop ${index}`;

              return (
                <View key={stop.id || index} style={styles.stopRow}>
                  <View style={styles.routeIconContainer}>
                    {isFirst ? (
                      <View style={styles.startOuter}>
                        <View style={styles.startInner} />
                      </View>
                    ) : isLast ? (
                      <View style={styles.destinationCircle}>
                        <Ionicons name="location" size={14} color="#063F76" />
                      </View>
                    ) : (
                      <View style={styles.stopCircle} />
                    )}

                    {!isLast && <View style={styles.routeLine} />}
                  </View>

                  <View style={styles.stopInfo}>
                    <Text style={styles.stopName}>{stop.name}</Text>
                    <Text style={styles.stopType}>{stopType}</Text>
                  </View>

                  <Text style={styles.stopTime}>
                    {stop.time || (isFirst ? '00:00' : `+${index * 10}m`)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Bottom Action Button */}
          {trip.status === 'ACTIVE' ? (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => router.push('/map')}
            >
              <Ionicons name="map-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Track Bus on Live Map</Text>
            </TouchableOpacity>
          ) : trip.status === 'COMPLETED' ? (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => router.push('/explore')}
            >
              <Ionicons name="repeat-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Book Another Ride</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => router.push('/payment')}
            >
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Proceed to Payment</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Trip not found.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#59616C',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCD2DC',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tripTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCEAFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3E4D60',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  routeHeaderInfo: {
    flex: 1,
  },
  city: {
    fontSize: 18,
    fontWeight: '700',
    color: '#12263E',
    marginBottom: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#59616C',
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  priceCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10243B',
    textAlign: 'right',
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10243B',
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCD2DC',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14283F',
    marginBottom: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoGridItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  infoItemLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  infoItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCD2DC',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14283F',
    marginBottom: 18,
  },
  stopRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeIconContainer: {
    width: 24,
    alignItems: 'center',
  },
  startOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#063F76',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  startInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#063F76',
  },
  stopCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
  },
  destinationCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#063F76',
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: '#CBD5E1',
    marginVertical: 2,
  },
  stopInfo: {
    flex: 1,
    marginLeft: 12,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14283F',
    marginBottom: 2,
  },
  stopType: {
    fontSize: 11,
    color: '#64748B',
  },
  stopTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actionButton: {
    height: 50,
    backgroundColor: '#032D55',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});