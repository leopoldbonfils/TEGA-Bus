import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl, ActivityIndicator,} from 'react-native';
import Header from '../components/Header';
import { getAllTrips, getActiveTrips, Trip } from '../services/tripService';

export default function TripsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed'>('upcoming');
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [completedTrips, setCompletedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [upcoming, active, completed] = await Promise.all([
        getAllTrips('SCHEDULED'),
        getActiveTrips(),
        getAllTrips('COMPLETED'),
      ]);
      setUpcomingTrips(upcoming);
      setActiveTrips(active);
      setCompletedTrips(completed);
    } catch {
      // Handled gracefully with fallback trips in tripService
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const navigateToDetails = (tripId: string) => {
    router.push({
      pathname: '/trip-details',
      params: { tripId },
    });
  };

  return (
    <View style={styles.container}>
      <Header title="TEGA Bus Rwanda" showBack={false} />

      <ScrollView style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTrips(true)}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        <Text style={styles.title}>My Trips</Text>

        
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]} onPress={() => setActiveTab('upcoming')}>
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]} onPress={() => setActiveTab('active')}>
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}> Active </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, activeTab === 'completed' && styles.tabButtonActive]} onPress={() => setActiveTab('completed')}>
            <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading trips...</Text>
          </View>
        ) : (
          <>
            
            {activeTab === 'upcoming' && (
              <>
                <Text style={styles.sectionTitle}>UPCOMING TRIPS</Text>

                {upcomingTrips.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="calendar-outline" size={42} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>No Upcoming Trips</Text>
                    <Text style={styles.emptySub}>
                      When you book or schedule a trip, it will appear here.
                    </Text>
                  </View>
                ) : (
                  upcomingTrips.map((trip) => (
                    <View key={trip.id} style={styles.upcomingCard}>
                      <View style={styles.upcomingTopRow}>
                        <View style={styles.upcomingDateRow}>
                          <View style={styles.calendarIconWrap}>
                            <Ionicons name="calendar-outline" size={16} color="#2563EB" />
                          </View>
                          <Text style={styles.upcomingDateText}>
                            {trip.formattedTime || 'Scheduled'}
                          </Text>
                        </View>

                        <View style={styles.scheduledPill}>
                          <Text style={styles.scheduledText}>Scheduled</Text>
                        </View>
                      </View>

                      <View style={styles.upcomingBusRow}>
                        <Text style={styles.busText}>
                          Bus {trip.bus?.busNumber || 'Bus'} • {trip.route?.name || 'Route'}
                        </Text>
                        <View style={styles.countdownRow}>
                          <Ionicons name="time-outline" size={14} color="#596575" />
                          <Text style={styles.countdownText}>
                            {trip.etaMinutes ? `${trip.etaMinutes}m` : '30m'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.upcomingPointsRow}>
                        <View style={styles.upcomingPointsCol}>
                          <View style={styles.upcomingPointRow}>
                            <View style={styles.upcomingOriginDot} />
                            <Text style={styles.upcomingPointName}>
                              {trip.route?.startLocation || 'Origin'}
                            </Text>
                          </View>
                          <View style={styles.dashedLine} />
                          <View style={styles.upcomingPointRow}>
                            <Ionicons name="location" size={14} color="#0B2F55" />
                            <Text style={styles.upcomingPointName}>
                              {trip.route?.destination || 'Destination'}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity style={styles.viewDetailsButton}
                          activeOpacity={0.85}
                          onPress={() => navigateToDetails(trip.id)}
                        >
                          <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}

          
            {activeTab === 'active' && (
              <>
                <Text style={styles.sectionTitle}>ACTIVE TRIPS</Text>

                {activeTrips.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="bus-outline" size={42} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>No Active Trips</Text>
                    <Text style={styles.emptySub}>
                      There are currently no active buses on your route.
                    </Text>
                  </View>
                ) : (
                  activeTrips.map((trip) => (
                    <TouchableOpacity
                      key={trip.id}
                      style={styles.journeyCard}
                      activeOpacity={0.85}
                      onPress={() => navigateToDetails(trip.id)}
                    >
                      <View style={styles.greenBar} />

                      <View style={styles.journeyContent}>
                        <View style={styles.journeyHeader}>
                          <View style={styles.busRow}>
                            <Ionicons name="bus" size={18} color="#0B2F55" />
                            <Text style={styles.busText}>
                              Bus {trip.bus?.busNumber || 'Bus'} • {trip.route?.name || 'Route'}
                            </Text>
                          </View>
                          <View style={styles.statusPill}>
                            <Text style={styles.statusText}>In Transit</Text>
                          </View>
                        </View>

                        <View style={styles.journeyMainRow}>
                          <View style={styles.timelineCol}>
                            <View style={styles.pointRow}>
                              <View style={styles.originDot} />
                              <View>
                                <Text style={styles.pointLabel}>Origin</Text>
                                <Text style={styles.pointName}>
                                  {trip.route?.startLocation || 'Origin'}
                                </Text>
                                <Text style={styles.pointTime}>
                                  {trip.formattedTime || 'Departed'}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.timelineLine} />

                            <View style={styles.pointRow}>
                              <View style={styles.destinationDot} />
                              <View>
                                <Text style={styles.pointLabel}>Destination</Text>
                                <Text style={styles.pointName}>
                                  {trip.route?.destination || 'Destination'}
                                </Text>
                                <Text style={styles.pointTime}>
                                  Est. in {trip.etaMinutes || 15} min
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View style={styles.statsCol}>
                            <View style={styles.statsBox}>
                              <View style={styles.statRow}>
                                <View style={styles.statLeft}>
                                  <Ionicons name="speedometer-outline" size={16} color="#15803D" />
                                  <Text style={styles.statValue}>
                                    {trip.speed || 30} km/h
                                  </Text>
                                </View>
                                <Text style={styles.statLabel}>Speed</Text>
                              </View>

                              <View style={styles.statRow}>
                                <View style={styles.statLeft}>
                                  <Ionicons name="location-outline" size={16} color="#15803D" />
                                  <Text style={styles.statValue}>
                                    {trip.distanceKm || 1.2} km
                                  </Text>
                                </View>
                                <Text style={styles.statLabel}>Away</Text>
                              </View>

                              <View style={styles.statRow}>
                                <View style={styles.statLeft}>
                                  <Ionicons name="time-outline" size={16} color="#15803D" />
                                  <Text style={styles.statValue}>
                                    {trip.etaMinutes || 15} min
                                  </Text>
                                </View>
                                <Text style={styles.statLabel}>ETA</Text>
                              </View>
                            </View>

                            <TouchableOpacity
                              style={styles.trackBusButton}
                              activeOpacity={0.85}
                              onPress={() => router.push('/map')}
                            >
                              <Text style={styles.trackBusText}>Track Bus</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}

      
            {activeTab === 'completed' && (
              <>
                <Text style={styles.sectionTitle}>COMPLETED TRIPS</Text>

                {completedTrips.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="checkmark-done-circle-outline" size={42} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>No Completed Trips</Text>
                    <Text style={styles.emptySub}>
                      Your past journeys and tickets will be archived here.
                    </Text>
                  </View>
                ) : (
                  completedTrips.map((trip) => (
                    <TouchableOpacity
                      key={trip.id}
                      style={styles.historyCard}
                      activeOpacity={0.85}
                      onPress={() => navigateToDetails(trip.id)}
                    >
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyDate}>
                          {trip.formattedTime || 'Completed'}
                        </Text>
                        <View style={styles.completedPill}>
                          <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                          <Text style={styles.completedText}>Completed</Text>
                        </View>
                      </View>
                      <View style={styles.historyBody}>
                        <View>
                          <Text style={styles.routeText}>
                            {trip.route?.startLocation} → {trip.route?.destination}
                          </Text>
                          <View style={styles.paymentRow}>
                            <Ionicons name="card-outline" size={14} color="#596575" />
                            <Text style={styles.paymentText}>Wallet Payment</Text>
                          </View>
                        </View>
                        <Text style={styles.priceText}>
                          RWF {trip.route?.fare || 500}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}
          </>
        )}
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
    padding: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0B2F55',
    marginBottom: 18,
    marginTop: 6,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E4EAF6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#596575',
    letterSpacing: 1,
    marginBottom: 14,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#596575',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2F55',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  journeyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D9E0',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  greenBar: {
    width: 4,
    backgroundColor: '#22C55E',
  },
  journeyContent: {
    flex: 1,
    padding: 16,
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  journeyMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timelineCol: {
    flex: 1,
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
    fontSize: 11,
    color: '#596575',
    textTransform: 'uppercase',
  },
  pointName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2F55',
    marginTop: 2,
  },
  pointTime: {
    fontSize: 12,
    color: '#596575',
    marginTop: 2,
  },
  statsCol: {
    width: 130,
  },
  statsBox: {
    backgroundColor: '#EEFBF3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B2F55',
  },
  statLabel: {
    fontSize: 11,
    color: '#596575',
  },
  trackBusButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  trackBusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
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
    backgroundColor: '#D8F5E4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
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
    fontWeight: '700',
    color: '#0B2F55',
  },
  upcomingCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D9E0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  upcomingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  upcomingDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EAF0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  scheduledPill: {
    backgroundColor: '#EAF0FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  scheduledText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  upcomingBusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countdownText: {
    fontSize: 13,
    color: '#596575',
  },
  upcomingPointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  upcomingPointsCol: {
    flex: 1,
  },
  upcomingPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  upcomingOriginDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0B2F55',
  },
  upcomingPointName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2F55',
  },
  dashedLine: {
    width: 1,
    height: 16,
    marginLeft: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#D5D9E0',
    borderStyle: 'dashed',
  },
  viewDetailsButton: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
});
