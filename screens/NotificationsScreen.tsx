import {View, Text, StyleSheet,TouchableOpacity, ScrollView, ActivityIndicator,} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getAlerts, Alert, AlertType } from '../services/alertService';


function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHrs < 24) return `${diffHrs} hr ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/** Map an alert type to the appropriate icon name and style variant */
function getAlertStyle(type: AlertType): {
  icon: keyof typeof Ionicons.glyphMap;
  circleStyle: 'iconCircle' | 'warningCircle' | 'successCircle';
  titleStyle: 'alertTitle' | 'serviceTitle';
  timeStyle: 'time' | 'serviceTime';
  cardStyle: 'alertCard' | 'serviceCard';
  iconColor: string;
} {
  switch (type) {
    case 'SERVICE_ALERT':
      return {
        icon: 'warning',
        circleStyle: 'warningCircle',
        titleStyle: 'serviceTitle',
        timeStyle: 'serviceTime',
        cardStyle: 'serviceCard',
        iconColor: '#B42318',
      };
    case 'BUS_APPROACHING':
      return {
        icon: 'bus-outline',
        circleStyle: 'iconCircle',
        titleStyle: 'alertTitle',
        timeStyle: 'time',
        cardStyle: 'alertCard',
        iconColor: '#0B3D66',
      };
    case 'DELAY':
      return {
        icon: 'time-outline',
        circleStyle: 'warningCircle',
        titleStyle: 'serviceTitle',
        timeStyle: 'serviceTime',
        cardStyle: 'serviceCard',
        iconColor: '#B42318',
      };
    case 'ROUTE_UPDATE':
      return {
        icon: 'location-outline',
        circleStyle: 'iconCircle',
        titleStyle: 'alertTitle',
        timeStyle: 'time',
        cardStyle: 'alertCard',
        iconColor: '#0B3D66',
      };
    case 'GENERAL':
    default:
      return {
        icon: 'notifications-outline',
        circleStyle: 'iconCircle',
        titleStyle: 'alertTitle',
        timeStyle: 'time',
        cardStyle: 'alertCard',
        iconColor: '#0B3D66',
      };
  }
}

export default function NotificationsScreen() {
  const { token } = useAuth();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError('Please log in to view alerts');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getAlerts(token);
      setAlerts(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load alerts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const todayAlerts = alerts.filter((a) => isToday(a.createdAt));
  const earlierAlerts = alerts.filter((a) => !isToday(a.createdAt));

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Notifications</Text>

        {loading && (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#0B3D66" />
            <Text style={styles.stateText}>Loading alerts...</Text>
          </View>
        )}

        {/*  Error state  */}
        {!loading && error && (
          <View style={styles.centeredState}>
            <Ionicons name="cloud-offline-outline" size={40} color="#596575" />
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAlerts}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/*  Empty state  */}
        {!loading && !error && alerts.length === 0 && (
          <View style={styles.centeredState}>
            <Ionicons name="notifications-off-outline" size={40} color="#596575" />
            <Text style={styles.stateText}>No alerts yet</Text>
            <Text style={styles.stateSubText}>You'll be notified when TEGA Bus sends service updates.</Text>
          </View>
        )}

        {/*  Today alerts  */}
        {!loading && !error && todayAlerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayAlerts.map((alert) => {
              const style = getAlertStyle(alert.type);
              return (
                <View key={alert.id} style={styles[style.cardStyle]}>
                  <View style={styles[style.circleStyle]}>
                    <Ionicons name={style.icon} size={style.circleStyle === 'warningCircle' ? 32 : 30} color={style.iconColor} />
                  </View>
                  <View style={styles.alertInfo}>
                    <View style={styles.alertHeader}>
                      <Text style={styles[style.titleStyle]}>{alert.title}</Text>
                      <Text style={styles[style.timeStyle]}>{formatTime(alert.createdAt)}</Text>
                    </View>
                    <Text style={styles.alertDescription}>{alert.message}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/*  Earlier alerts  */}
        {!loading && !error && earlierAlerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {earlierAlerts.map((alert) => {
              const style = getAlertStyle(alert.type);
              return (
                <View key={alert.id} style={styles[style.cardStyle]}>
                  <View style={styles[style.circleStyle]}>
                    <Ionicons name={style.icon} size={style.circleStyle === 'warningCircle' ? 32 : 30} color={style.iconColor} />
                  </View>
                  <View style={styles.alertInfo}>
                    <View style={styles.alertHeader}>
                      <Text style={styles[style.titleStyle]}>{alert.title}</Text>
                      <Text style={styles[style.timeStyle]}>{formatTime(alert.createdAt)}</Text>
                    </View>
                    <Text style={styles.alertDescription}>{alert.message}</Text>
                  </View>
                </View>
              );
            })}
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
    paddingTop: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2F55',
    marginBottom: 35,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3148',
    marginBottom: 20,
  },

  alertCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D9E0',
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 14,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8EEF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },

  alertInfo: {
    flex: 1,
  },

  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#26384C',
    flex: 1,
  },

  time: {
    fontSize: 15,
    color: '#596575',
    marginLeft: 10,
  },

  alertDescription: {
    fontSize: 15,
    color: '#596575',
    lineHeight: 26,
    marginTop: 8,
  },

  serviceCard: {
    backgroundColor: '#FFFDFD',
    borderWidth: 1,
    borderColor: '#C62828',
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 14,
  },

  warningCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },

  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B1E1E',
    flex: 1,
  },

  serviceTime: {
    fontSize: 15,
    color: '#8B1E1E',
    marginLeft: 10,
  },

  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DDF5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },

  rateButton: {
    borderWidth: 1,
    borderColor: '#315979',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignSelf: 'flex-start',
    marginTop: 16,
  },

  rateText: {
    fontSize: 15,
    color: '#315979',
    fontWeight: '500',
  },


  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },

  stateText: {
    fontSize: 15,
    color: '#596575',
    textAlign: 'center',
    marginTop: 4,
  },

  stateSubText: {
    fontSize: 13,
    color: '#8A97A8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  retryButton: {
    borderWidth: 1,
    borderColor: '#315979',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 8,
  },

  retryText: {
    fontSize: 14,
    color: '#315979',
    fontWeight: '500',
  },
});