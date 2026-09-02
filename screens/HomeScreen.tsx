import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {Ionicons,MaterialIcons,MaterialCommunityIcons,FontAwesome5,} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Header from '../components/Header';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
    
        <View style={styles.searchBox}>
          <Text style={styles.title}>Where do you want to go?</Text>

          <TouchableOpacity style={styles.locationBox} activeOpacity={0.7}>
            <MaterialIcons name="my-location" size={20} color="#64748B" />
            <Text style={styles.locationText}>Current Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.locationBox} activeOpacity={0.7}>
            <Ionicons name="location" size={20} color="#0F172A" />
            <Text style={styles.destinationPlaceholder}>Search destination</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.findButton} activeOpacity={0.85} onPress={() => router.push('/(tabs)/explore')}>
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

      
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Trip</Text>
        </View>

        <View style={styles.tripCard}>
          <View style={styles.routeBox}>
            <Text style={styles.routeText}>ROUTE</Text>
            <Text style={styles.routeNumber}>101</Text>
          </View>

          <View style={styles.tripInfo}>
            <Text style={styles.destinationText}>To Nyabugogo</Text>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={15} color="#64748B" />
              <Text style={styles.timeText}>08:30 AM</Text>
            </View>
          </View>

          <View style={styles.arrivalSection}>
            <View style={styles.arrivingBox}>
              <Text style={styles.arrivingText}>Arriving</Text>
            </View>
            <Text style={styles.minutesText}>in 5 mins</Text>
          </View>
        </View>

    
        <View style={styles.nearbyHeader}>
          <Text style={styles.sectionTitle}>Nearby Stop</Text>
          <TouchableOpacity onPress={() => router.push('/map')}>
            <Text style={styles.viewMap}>View map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stopCard}>
          <View style={styles.stopNameRow}>
            <MaterialIcons name="grid-view" size={22} color="#04325E" />
            <Text style={styles.stopName}>Downtown Kigali</Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="bus-outline" size={16} color="#64748B" />
              <Text style={styles.detailText}>500m</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="directions-walk" size={18} color="#64748B" />
              <Text style={styles.detailText}>6 min</Text>
            </View>
          </View>

          <Text style={styles.availableText}>Available Buses:</Text>
          <View style={styles.busRow}>
            <View style={styles.busNumber}>
              <Text style={styles.busText}>101</Text>
            </View>
            <View style={styles.busNumber}>
              <Text style={styles.busText}>102</Text>
            </View>
            <View style={styles.busNumber}>
              <Text style={styles.busText}>105</Text>
            </View>
          </View>
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
});
