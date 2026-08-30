import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialIcons, Feather,} from '@expo/vector-icons';
import { router } from 'expo-router';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container}>
    
      <ImageBackground source={require('../assets/BusImage/kigali_real_map.jpg')}style={styles.map}resizeMode="cover">
       
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn}onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.gpsBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.gpsText}>Live GPS Active</Text>
          </View>
        </View>

        <View style={styles.markersOverlay}>
          <View style={[styles.markerContainer, { top: '15%', right: '22%' }]}>
            <View style={styles.destinationStop}>
              <View style={styles.navyDot} />
            </View>
            <View style={styles.stopPill}>
              <Text style={styles.stopPillText}>Nyabugogo</Text>
            </View>
            <View style={styles.routeTag}>
              <Text style={styles.routeTagText}>NR3</Text>
            </View>
          </View>

          <View style={[styles.landmarkContainer, { top: '22%', left: '16%' }]}>
            <View style={styles.landmarkIconCircle}>
              <Ionicons name="camera" size={13} color="#9333EA" />
            </View>
            <Text style={styles.landmarkPurpleText}>Camp & Explorer</Text>
          </View>

          <View style={[styles.liveBusContainer, { top: '38%', left: '42%' }]}>
            <View style={styles.busHalo}>
              <View style={styles.busCircle}>
                <FontAwesome5 name="bus" size={14} color="#FFFFFF" />
              </View>
            </View>
          </View>

          <View style={[styles.landmarkContainer, { top: '42%', left: '14%' }]}>
            <Text style={styles.landmarkPurpleText}>Kigali Genocide{'\n'}Memorial</Text>
            <View style={styles.landmarkIconCircle}>
              <Ionicons name="business" size={13} color="#9333EA" />
            </View>
          </View>

          <View style={[styles.kigaliLabel, { top: '48%', left: '38%' }]}>
            <Text style={styles.kigaliMainText}>Kigali</Text>
          </View>
          <View style={[styles.markerContainer, { bottom: '33%', left: '16%' }]}>
            <View style={styles.originCircle}>
              <Ionicons name="flag" size={13} color="#FFFFFF" />
            </View>
          </View>
        </View>

      
        <View style={styles.bottomCard}>
        
          <View style={styles.cardHeader}>
            <View>
              <View style={styles.busTitleRow}>
                <Text style={styles.busTitle}>Bus 101</Text>
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle-outline" size={13} color="#059669" />
                  <Text style={styles.statusBadgeText}>On Time</Text>
                </View>
              </View>
              <Text style={styles.busRouteText}>Kigali City → Nyabugogo</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <View style={styles.statLabelRow}>
                <Ionicons name="time-outline" size={14} color="#64748B" />
                <Text style={styles.statLabel}>ETA</Text>
              </View>
              <Text style={styles.statValue}>5 min</Text>
            </View>

            <View style={styles.statCol}>
              <View style={styles.statLabelRow}>
                <MaterialIcons name="alt-route" size={14} color="#64748B" />
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <Text style={styles.statValue}>1.2 km</Text>
            </View>

            <View style={styles.statCol}>
              <View style={styles.statLabelRow}>
                <Ionicons name="location-outline" size={14} color="#64748B" />
                <Text style={styles.statLabel}>Stops</Text>
              </View>
              <Text style={styles.statValue}>8 left</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.trackButton} activeOpacity={0.85}>
            <Feather name="crosshair" size={18} color="#FFFFFF" />
            <Text style={styles.trackButtonText}>Track Bus</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  gpsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  markersOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  destinationStop: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(4, 50, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#04325E',
  },
  stopPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  stopPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  routeTag: {
    backgroundColor: '#65A30D',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
  routeTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  liveBusContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  busHalo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(4, 50, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  busCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#04325E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  landmarkContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  landmarkIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D8B4FE',
  },
  landmarkPurpleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E22CE',
  },
  kigaliLabel: {
    position: 'absolute',
  },
  kigaliMainText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  originCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  bottomCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    marginBottom: 16,
  },
  busTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  busTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  busRouteText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },

  // 3 Stats Columns
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  trackButton: {
    backgroundColor: '#04325E',
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
