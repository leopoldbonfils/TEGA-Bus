import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getTrips, Trip } from '../services/profileService';
export default function TripsScreen() {
  const [activeTab, setActiveTab] = useState('completed');
  const { token } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      setError(null);
      setTrips(await getTrips(token));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load trips');
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  const visibleTrips = trips.filter((trip) => {
    const status = trip.status.toLowerCase();
    return activeTab === 'completed' ? status === 'completed' : activeTab === 'active' ? status === 'active' || status === 'in transit' : status === 'upcoming' || status === 'scheduled';
  });

  return (
    <View style={styles.container}>
    <Header title="TEGA Bus Rwanda" showBack={false} />
    
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>My Trips</Text>

      <View style={styles.tabRow}>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'completed' && styles.tabButtonActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>

      </View>

      <Text style={styles.sectionTitle}>
        {activeTab === 'completed' ? 'HISTORY' : activeTab === 'active' ? 'CURRENT JOURNEY' : 'UPCOMING TRIPS'}
      </Text>
      {loading && <ActivityIndicator color="#0B3D66" />}
      {error && <Text style={styles.emptyText}>{error}</Text>}
      {!loading && !error && visibleTrips.length === 0 && <Text style={styles.emptyText}>No trips found.</Text>}
      {visibleTrips.map((trip) => <TouchableOpacity key={trip.id} style={styles.historyCard} activeOpacity={0.85} onPress={() => router.push({ pathname: '/trip-details', params: { tripId: trip.id } })}>
        <View style={styles.historyHeader}><Text style={styles.historyDate}>{trip.date}</Text><View style={styles.completedPill}><Ionicons name="checkmark-circle" size={14} color="#0B3D66" /><Text style={styles.completedText}>{trip.status}</Text></View></View>
        <View style={styles.historyBody}><View><Text style={styles.routeText}>{trip.origin} → {trip.destination}</Text><View style={styles.paymentRow}><Ionicons name="card-outline" size={14} color="#596575" /><Text style={styles.paymentText}>{trip.paymentMethod || 'Payment'}</Text></View></View><Text style={styles.priceText}>RWF {trip.fare}</Text></View>
      </TouchableOpacity>)}

  </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: '500',
    color: '#0B2F55',
    marginBottom: 20,
    marginTop:10,
  },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E4EAF6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 30,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  tabButtonActive: {
    backgroundColor: '#fff',
  },

  tabText: {
    fontSize: 14,
    color: '#596575',
    fontWeight: '500',
  },

  tabTextActive: {
    color: '#0B2F55',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#596575',
    letterSpacing: 1,
    marginBottom: 12,
  },
  journeyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D9E0',
    borderRadius: 14,
    marginBottom: 30,
    overflow: 'hidden',
  },

  greenBar: {
    width: 4,
    backgroundColor: '#22C55E',
  },

  journeyContent: {
    flex: 1,
    padding: 18,
  },

  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  busRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  busText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2F55',
  },

  statusPill: {
    backgroundColor: '#D8F5E4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },

  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0B2F55',
    marginTop: 4,
  },

  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    marginTop: 4,
  },

  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: '#D5D9E0',
    marginLeft: 5,
    marginVertical: 2,
  },

  pointLabel: {
    fontSize: 13,
    color: '#596575',
  },

  pointName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2F55',
    marginTop: 2,
  },

  pointTime: {
    fontSize: 13,
    color: '#596575',
    marginTop: 2,
  },

  historyCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D9E0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  historyDate: {
    fontSize: 13,
    color: '#596575',
  },

  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E4EAF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B3D66',
  },

  historyBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  routeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2F55',
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  paymentText: {
    fontSize: 13,
    color: '#596575',
  },

  priceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0B2F55',
  },

});
