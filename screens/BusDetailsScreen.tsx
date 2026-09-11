import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { getBusDetails, RecommendedBus } from '../services/busService';

export default function BusDetailsScreen() {
  const params = useLocalSearchParams<{ busId?: string; userLat?: string; userLng?: string }>();
  const [bus, setBus] = useState<RecommendedBus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBus = useCallback(async () => {
    if (!params.busId || !params.userLat || !params.userLng) {
      setError('Bus location is unavailable');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const details = await getBusDetails(Number(params.userLat), Number(params.userLng), params.busId);
      setBus(details);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load bus details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.busId, params.userLat, params.userLng]);

  useEffect(() => { loadBus(); }, [loadBus]);
  const refresh = useCallback(() => { setRefreshing(true); loadBus(); }, [loadBus]);

  if (loading) {
    return <View style={styles.container}><Header title="Bus Details" showBack onBack={() => router.back()} /><View style={styles.centerState}><ActivityIndicator size="large" color="#04325E" /><Text style={styles.stateText}>Loading live bus details...</Text></View></View>;
  }

  if (error || !bus) {
    return <View style={styles.container}><Header title="Bus Details" showBack onBack={() => router.back()} /><View style={styles.centerState}><Ionicons name="cloud-offline-outline" size={44} color="#64748B" /><Text style={styles.errorText}>{error || 'Bus details are unavailable'}</Text><TouchableOpacity style={styles.retryButton} onPress={loadBus}><Text style={styles.retryText}>Try Again</Text></TouchableOpacity></View></View>;
  }

  const status = bus.status || (bus.isMoving ? 'MOVING' : 'PARKED');
  return (
    <View style={styles.container}>
      <Header title="Bus Details" showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <View style={styles.titleRow}><View><Text style={styles.busNumber}>BUS {bus.busNumber}</Text><Text style={styles.routeText}>{bus.routeName || bus.routeNumber}</Text></View><View style={styles.statusBadge}><View style={styles.statusDot} /><Text style={styles.statusText}>{status}</Text></View></View>
        <View style={styles.card}><Text style={styles.label}>DRIVER</Text><Text style={styles.value}>{bus.driverName || 'Unavailable'}</Text>{bus.rating != null && <Text style={styles.secondary}>Rating {bus.rating}</Text>}</View>
        <View style={styles.card}><Text style={styles.label}>CURRENT STATUS</Text><View style={styles.row}><Ionicons name="navigate-outline" size={24} color="#04325E" /><Text style={styles.value}>{bus.currentStop || 'In transit'}</Text></View><View style={styles.divider} /><View style={styles.nextRow}><Text style={styles.secondary}>Next stop: {bus.nextStop || 'Unavailable'}</Text><Text style={styles.secondary}>{bus.etaMinutes} min</Text></View></View>
        <View style={styles.card}><View style={styles.nextRow}><Text style={styles.label}>LIVE INFORMATION</Text><Text style={styles.secondary}>{bus.speed} km/h</Text></View><Text style={styles.secondary}>Distance: {bus.distanceKm} km</Text>{bus.capacity != null && <Text style={styles.secondary}>Capacity: {bus.capacity}</Text>}{bus.seatsRemaining != null && <Text style={styles.secondary}>Seats remaining: {bus.seatsRemaining}</Text>}</View>
        {bus.tripStops && bus.tripStops.length > 0 && <View style={styles.card}><Text style={styles.label}>TRIP PROGRESS</Text>{bus.tripStops.map((stop, index) => <View style={styles.stopRow} key={`${stop.name}-${index}`}><View style={[styles.stopDot, stop.status === 'CURRENT' && styles.currentDot]} /><View><Text style={styles.value}>{stop.name}</Text><Text style={styles.secondary}>{stop.status || 'UPCOMING'}{stop.etaMinutes != null ? ` - ${stop.etaMinutes} min` : ''}</Text></View></View>)}</View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FC' },
  content: { padding: 18, paddingBottom: 32 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  stateText: { color: '#64748B', marginTop: 12 },
  errorText: { color: '#334155', textAlign: 'center', marginTop: 12 },
  retryButton: { backgroundColor: '#04325E', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 8, marginTop: 18 },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  busNumber: { color: '#08294D', fontSize: 26, fontWeight: '800' },
  routeText: { color: '#64748B', fontSize: 15, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A', marginRight: 6 },
  statusText: { color: '#166534', fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, marginBottom: 14, shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  label: { color: '#64748B', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 9 },
  value: { color: '#12213D', fontSize: 17, fontWeight: '700' },
  secondary: { color: '#64748B', fontSize: 14, marginTop: 5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 14 },
  nextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stopRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  stopDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#CBD5E1', marginRight: 12 },
  currentDot: { backgroundColor: '#10B981' },
});
