import React, { useEffect, useState, useCallback } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { io } from 'socket.io-client';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getAlerts, Alert, AlertType } from '../services/alertService';
import { BACKEND_URL } from '../constants/config';

function formatTime(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs)) return '';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHrs < 24) return `${diffHrs} hr ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function isToday(iso: string): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/** Map an alert type or title keywords to icon and style variant */
function getAlertStyle(type: AlertType | string, title?: string): {
  icon: keyof typeof Ionicons.glyphMap;
  circleStyle: 'iconCircle' | 'warningCircle' | 'successCircle';
  titleStyle: 'alertTitle' | 'serviceTitle';
  timeStyle: 'time' | 'serviceTime';
  cardStyle: 'alertCard' | 'serviceCard';
  iconColor: string;
} {
  const lowerTitle = (title || '').toLowerCase();

  if (type === 'SERVICE_ALERT' || lowerTitle.includes('service alert')) {
    return {
      icon: 'warning',
      circleStyle: 'warningCircle',
      titleStyle: 'serviceTitle',
      timeStyle: 'serviceTime',
      cardStyle: 'serviceCard',
      iconColor: '#B42318',
    };
  }

  if (type === 'DELAY' || lowerTitle.includes('delay')) {
    return {
      icon: 'time-outline',
      circleStyle: 'warningCircle',
      titleStyle: 'serviceTitle',
      timeStyle: 'serviceTime',
      cardStyle: 'serviceCard',
      iconColor: '#B42318',
    };
  }

  if (
    type === 'BUS_APPROACHING' ||
    lowerTitle.includes('arriving') ||
    lowerTitle.includes('approaching')
  ) {
    return {
      icon: 'bus-outline',
      circleStyle: 'iconCircle',
      titleStyle: 'alertTitle',
      timeStyle: 'time',
      cardStyle: 'alertCard',
      iconColor: '#0B3D66',
    };
  }

  if (
    type === 'ROUTE_UPDATE' ||
    lowerTitle.includes('route') ||
    lowerTitle.includes('destination')
  ) {
    return {
      icon: 'location-outline',
      circleStyle: 'iconCircle',
      titleStyle: 'alertTitle',
      timeStyle: 'time',
      cardStyle: 'alertCard',
      iconColor: '#0B3D66',
    };
  }

  if (
    lowerTitle.includes('wallet') ||
    lowerTitle.includes('top-up') ||
    lowerTitle.includes('payment')
  ) {
    return {
      icon: 'wallet-outline',
      circleStyle: 'iconCircle',
      titleStyle: 'alertTitle',
      timeStyle: 'time',
      cardStyle: 'alertCard',
      iconColor: '#0B3D66',
    };
  }

  if (lowerTitle.includes('trip completed') || lowerTitle.includes('completed')) {
    return {
      icon: 'checkmark-circle-outline',
      circleStyle: 'successCircle',
      titleStyle: 'alertTitle',
      timeStyle: 'time',
      cardStyle: 'alertCard',
      iconColor: '#287A5A',
    };
  }

  return {
    icon: 'notifications-outline',
    circleStyle: 'iconCircle',
    titleStyle: 'alertTitle',
    timeStyle: 'time',
    cardStyle: 'alertCard',
    iconColor: '#0B3D66',
  };
}

export default function NotificationsScreen() {
  const { token } = useAuth();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(
    async (isPullToRefresh = false) => {
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        setError('Please log in to view notifications');
        return;
      }
      try {
        if (!isPullToRefresh) setLoading(true);
        setError(null);
        const data = await getAlerts(token);
        setAlerts(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load notifications';
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Real-time alerts via Socket.IO
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('new:alert', (newAlert: Alert) => {
      if (newAlert && newAlert.id) {
        setAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAlerts(true);
  }, [fetchAlerts]);

  const todayAlerts = alerts.filter((a) => isToday(a.createdAt));
  const earlierAlerts = alerts.filter((a) => !isToday(a.createdAt));

  const renderAlertCard = (alert: Alert) => {
    const style = getAlertStyle(alert.type, alert.title);
    const isTripAlert =
      alert.title.toLowerCase().includes('trip') ||
      alert.message.toLowerCase().includes('rate your driver');

    return (
      <View key={alert.id} style={styles[style.cardStyle]}>
        <View style={styles[style.circleStyle]}>
          <Ionicons name={style.icon} size={style.circleStyle === 'warningCircle' ? 30 : 28} color={style.iconColor}/>
        </View>
        <View style={styles.alertInfo}>
          <View style={styles.alertHeader}>
            <Text style={styles[style.titleStyle]}>{alert.title}</Text>
            <Text style={styles[style.timeStyle]}>{formatTime(alert.createdAt)}</Text>
          </View>

          <Text style={styles.alertDescription}>{alert.message}</Text>

          {alert.route?.name && (
            <View style={styles.routeBadge}>
              <Ionicons name="git-branch-outline" size={12} color="#0B3D66" />
              <Text style={styles.routeBadgeText}>{alert.route.name}</Text>
            </View>
          )}

          {isTripAlert && (
            <TouchableOpacity
              style={styles.rateButton}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/trips')}
            >
              <Text style={styles.rateText}>Rate Trip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="TEGA Bus Rwanda" showBack={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0B3D66']}
            tintColor="#0B3D66"
          />
        }
      >
        <Text style={styles.title}>Notifications</Text>

        {/* Loading state */}
        {loading && !refreshing && (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#0B3D66" />
            <Text style={styles.stateText}>Loading notifications...</Text>
          </View>
        )}

        {/* Error / Not logged in state */}
        {!loading && error && (
          <View style={styles.centeredState}>
            <Ionicons
              name={!token ? 'lock-closed-outline' : 'cloud-offline-outline'}
              size={42}
              color="#596575"
            />
            <Text style={styles.stateText}>{error}</Text>
            {!token ? (
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.actionButtonText}>Log In</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={() => fetchAlerts()}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty state */}
        {!loading && !error && alerts.length === 0 && (
          <View style={styles.centeredState}>
            <Ionicons name="notifications-off-outline" size={44} color="#8A97A8" />
            <Text style={styles.stateText}>No notifications yet</Text>
            <Text style={styles.stateSubText}>
              You will be notified when TEGA Bus sends service updates or trip alerts.
            </Text>
          </View>
        )}

        {/* Today alerts */}
        {!loading && !error && todayAlerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayAlerts.map(renderAlertCard)}
          </>
        )}

        {/* Earlier alerts */}
        {!loading && !error && earlierAlerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {earlierAlerts.map(renderAlertCard)}
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
    padding: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2F55',
    marginBottom: 24,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3148',
    marginBottom: 16,
    marginTop: 10,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceCard: {
    backgroundColor: '#FFFDFD',
    borderWidth: 1,
    borderColor: '#F8B4B4',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#C62828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E8EEF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  warningCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FDE8E8',
    borderWidth: 1,
    borderColor: '#F8B4B4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  successCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#DDF5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  alertInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B42318',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
  },
  serviceTime: {
    fontSize: 12,
    color: '#B42318',
    marginLeft: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginTop: 6,
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 4,
  },
  routeBadgeText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  rateButton: {
    borderWidth: 1,
    borderColor: '#0B3D66',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  rateText: {
    fontSize: 13,
    color: '#0B3D66',
    fontWeight: '600',
  },
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  stateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    marginTop: 4,
  },
  stateSubText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#0B3D66',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  retryButton: {
    borderWidth: 1,
    borderColor: '#0B3D66',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#0B3D66',
    fontWeight: '600',
  },
});