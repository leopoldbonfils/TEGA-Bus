import React from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, ImageBackground} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome, FontAwesome6, AntDesign, MaterialIcons, MaterialCommunityIcons, FontAwesome5,} from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '../components/Header';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.searchField}>
          <View style={styles.searchIcon}>
            <Ionicons name="search-outline" size={20} color="#64748B" />
          </View>
          <View style={styles.textInput}>
            <TextInput placeholder="Where to?" placeholderTextColor="#94A3B8" style={styles.searchInput} />
          </View>
          <TouchableOpacity style={styles.filterIcon}>
            <Ionicons name="options-outline" size={20} color="#0A3866" />
          </TouchableOpacity>
        </View>
        <View style={styles.chipsRow}>
          <TouchableOpacity style={styles.chip}>
            <Ionicons name="home" size={15} color="#0A3866" />
            <Text style={styles.chipText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chip}>
            <Ionicons name="briefcase" size={15} color="#0A3866" />
            <Text style={styles.chipText}>Work</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.chip, styles.chipDashed]}>
            <Ionicons name="add" size={16} color="#64748B" />
            <Text style={styles.chipDashedText}>Add Saved</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionContainer}>
          <View style={styles.textWords}>
            <Text style={styles.NearTitle}>Nearby Bus Stops</Text>
            <TouchableOpacity onPress={() => router.push('/map')}>
              <Text style={styles.viewMap}>View Map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardBus}>
            <TouchableOpacity activeOpacity={0.8} style={styles.firstCard}>
              <View style={styles.busIconContainer}>
                <FontAwesome name="bus" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.PlaceName}>
                <Text style={styles.LocationName}>Kimironko Terminus</Text>
                <View style={styles.walkRow}>
                  <FontAwesome6 name="person-walking" size={14} color="#64748B" />
                  <Text style={styles.minuteLeft}>5 min away</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.firstCard}>
              <View style={[styles.busIconContainer, styles.busIconLight]}>
                <FontAwesome name="bus" size={18} color="#0A3866" />
              </View>
              <View style={styles.PlaceName}>
                <Text style={styles.LocationName}>Remera Park</Text>
                <View style={styles.walkRow}>
                  <FontAwesome6 name="person-walking" size={14} color="#64748B" />
                  <Text style={styles.minuteLeft}>12 min away</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.sectionContainer}>
          <View style={styles.PopularText}>
            <Text style={styles.RouterText}>Popular Routes</Text>
          </View>

          <View style={styles.routerDetails}>
            <View style={styles.busDetails}>
              <View style={styles.busTopRow}>
                <View style={styles.plateContainer}>
                  <Text style={styles.plateNumber}>101</Text>
                </View>

                <View style={styles.routeInfo}>
                  <Text style={styles.routeTitle}> Kigali <Text style={styles.arrow}>➔</Text>
                  </Text>
                  <Text style={styles.routeDestination}>Nyabugogo</Text>
                  <View style={styles.clockName}>
                    <AntDesign name="clock-circle" size={12} color="#10B981" />
                    <Text style={styles.frequencyText}>Every 15 mins</Text>
                  </View>
                </View>

                <View style={styles.rwf}>
                  <Text style={styles.sizeRwf}>RWF</Text>
                  <Text style={styles.fareAmount}>500</Text>
                  <Text style={styles.BaseFare}>Base Fare</Text>
                </View>
              </View>

              <View style={styles.busBottomRow}>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="route" size={16} color="#475569" />
                    <Text style={styles.routerStop}>8 Stops</Text>
                  </View>
                  <View style={styles.TimeClock}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#475569" />
                    <Text style={styles.timeText}>Est. 25 min</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.viewRouter}>
                  <Text style={styles.routeLocation}>View Route</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.busDetails}>
              <View style={styles.busTopRow}>
                <View style={styles.plateContainer}>
                  <Text style={styles.plateNumber}>102</Text>
                </View>

                <View style={styles.routeInfo}>
                  <Text style={styles.routeTitle}>Downtown <Text style={styles.arrow}>➔</Text></Text>
                  <Text style={styles.routeDestination}>Kicukiro</Text>
                  <View style={styles.clockName}>
                    <AntDesign name="clock-circle" size={12} color="#10B981" />
                    <Text style={styles.frequencyText}>Every 20 mins</Text>
                  </View>
                </View>

                <View style={styles.rwf}>
                  <Text style={styles.sizeRwf}>RWF</Text>
                  <Text style={styles.fareAmount}>500</Text>
                  <Text style={styles.BaseFare}>Base Fare</Text>
                </View>
              </View>

              <View style={styles.busBottomRow}>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="route" size={16} color="#475569" />
                    <Text style={styles.routerStop}>12 Stops</Text>
                  </View>
                  <View style={styles.TimeClock}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#475569" />
                    <Text style={styles.timeText}>Est. 40 min</Text>
                  </View>
                </View>

                <TouchableOpacity style={[styles.viewRouter, styles.viewRouterOutline]}>
                  <Text style={[styles.routeLocation, styles.routeLocationOutline]}>View Route</Text>
                </TouchableOpacity>
              </View>
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
    paddingTop: 16,
    paddingBottom: 32,
  },


  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
  },
  searchInput: {
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 0,
  },
  filterIcon: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginLeft: 6,
  },

  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 24,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  chipDashed: {
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  chipDashedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },

  sectionContainer: {
    marginBottom: 20,
  },
  textWords: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  NearTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewMap: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A3866',
  },

  cardBus: {
    gap: 12,
  },


  firstCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  busIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A3866',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  busIconLight: {
    backgroundColor: '#DBEAFE',
  },
  PlaceName: {
    flex: 1,
  },
  LocationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  walkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  minuteLeft: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '400',
  },


  PopularText: {
    marginBottom: 14,
  },
  RouterText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  routerDetails: {
    gap: 14,
  },


  busDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },


  busTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  plateContainer: {
    backgroundColor: '#0A3866',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  routeInfo: {
    flex: 1,
    marginHorizontal: 14,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  arrow: {
    fontSize: 13,
    color: '#64748B',
  },
  routeDestination: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  clockName: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 5,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },


  rwf: {
    alignItems: 'flex-end',
  },
  sizeRwf: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 16,
  },
  fareAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
  },
  BaseFare: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },


  busBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  routerStop: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  TimeClock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },


  viewRouter: {
    backgroundColor: '#0A3866',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewRouterOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0A3866',
  },
  routeLocation: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  routeLocationOutline: {
    color: '#0A3866',
  },


});
