import { View,Text,StyleSheet,TouchableOpacity,ScrollView,} from 'react-native';
import { useState } from 'react';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
export default function TripsScreen() {
  const [activeTab, setActiveTab] = useState('completed');

  return (
    <View style={styles.container}>
    <Header/> 
    
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
        CURRENT JOURNEY
      </Text>

      <View style={styles.journeyCard}>

        <View style={styles.greenBar} />

        <View style={styles.journeyContent}>

          <View style={styles.journeyHeader}>

            <View style={styles.busRow}>
              <Ionicons name="bus" size={18} color="#0B2F55" />
              <Text style={styles.busText}>Bus 402 • Route 3</Text>
            </View>

            <View style={styles.statusPill}>
              <Text style={styles.statusText}>In Transit</Text>
            </View>

          </View>
          <View style={styles.pointRow}>
            <View style={styles.originDot} />
            <View>
              <Text style={styles.pointLabel}>Origin</Text>
              <Text style={styles.pointName}>Kimironko</Text>
              <Text style={styles.pointTime}>14:30 PM</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />
          <View style={styles.pointRow}>
            <View style={styles.destinationDot} />
            <View>
              <Text style={styles.pointLabel}>Destination</Text>
              <Text style={styles.pointName}>Downtown Terminal</Text>
              <Text style={styles.pointTime}>Est. 15:15 PM</Text>
            </View>
          </View>

        </View>

      </View>

      <Text style={styles.sectionTitle}>
        HISTORY
      </Text>
      <View style={styles.historyCard}>

        <View style={styles.historyHeader}>
          <Text style={styles.historyDate}>Today, 08:15 AM</Text>
          <View style={styles.completedPill}>
            <Ionicons name="checkmark-circle" size={14} color="#0B3D66" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        </View>

        <View style={styles.historyBody}>
          <View>
            <Text style={styles.routeText}>Kigali City → Nyabugogo</Text>
            <View style={styles.paymentRow}>
              <Ionicons name="card-outline" size={14} color="#596575" />
              <Text style={styles.paymentText}>Wallet Payment</Text>
            </View>
          </View>
          <Text style={styles.priceText}>RWF 500</Text>
        </View>

      </View>

      <View style={styles.historyCard}>

        <View style={styles.historyHeader}>
          <Text style={styles.historyDate}>Yesterday, 17:45 PM</Text>
          <View style={styles.completedPill}>
            <Ionicons name="checkmark-circle" size={14} color="#0B3D66" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        </View>

        <View style={styles.historyBody}>
          <View>
            <Text style={styles.routeText}>Remera → Downtown</Text>
            <View style={styles.paymentRow}>
              <Ionicons name="card-outline" size={14} color="#596575" />
              <Text style={styles.paymentText}>Wallet Payment</Text>
            </View>
          </View>
          <Text style={styles.priceText}>RWF 500</Text>
        </View>

      </View>

      <View style={styles.historyCard}>

        <View style={styles.historyHeader}>
          <Text style={styles.historyDate}>Oct 24, 09:00 AM</Text>
          <View style={styles.completedPill}>
            <Ionicons name="checkmark-circle" size={14} color="#0B3D66" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        </View>

        <View style={styles.historyBody}>
          <View>
            <Text style={styles.routeText}>Kacyiru → Kimironko</Text>
            <View style={styles.paymentRow}>
              <Ionicons name="card-outline" size={14} color="#596575" />
              <Text style={styles.paymentText}>Wallet Payment</Text>
            </View>
          </View>
          <Text style={styles.priceText}>RWF 450</Text>
        </View>

      </View>

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
