import React, { useState } from 'react';
import {View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Linking, StatusBar,} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {FontAwesome6, MaterialIcons, Entypo, Ionicons,} from '@expo/vector-icons';

type EmergencyType = 'medical' | 'security' | 'fire' | 'accident';

export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyType | null>(null);
  const [isLiveSharing, setIsLiveSharing] = useState(false);

  const handleCallEmergency = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    Alert.alert(
      'Emergency Call',
      'Are you sure you want to call 112 emergency services?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 112',
          style: 'destructive',
          onPress: () => {
            Linking.openURL('tel:112').catch(() => {
              Alert.alert('Error', 'Unable to initiate phone call on this device.');
            });
          },
        },
      ]
    );
  };

  const handleSOSLongPress = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}

    Alert.alert(
      'SOS Alert Sent!',
      'Emergency services and your trusted contacts have been alerted with your live location (KN 5 Rd, Kigali).',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleSOSPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    Alert.alert(
      'Hold to Activate SOS',
      'Please press and hold the SOS button for 2 seconds to immediately trigger an emergency alert.'
    );
  };

  const handleToggleLiveShare = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsLiveSharing((prev) => !prev);
    Alert.alert(
      isLiveSharing ? 'Live Sharing Paused' : 'Live Location Sharing Active',
      isLiveSharing
        ? 'Stopped sharing your real-time location with trusted contacts.'
        : 'Your real-time location is now being shared with Mom and Brother.'
    );
  };

  const emergencyOptions = [
    {
      id: 'medical' as EmergencyType,
      title: 'Medical',
      icon: <FontAwesome6 name="square-plus" size={24} color="#DC2626" />,
      bg: '#FEE2E2',
    },
    {
      id: 'security' as EmergencyType,
      title: 'Security',
      icon: <Entypo name="shield" size={24} color="#1D4ED8" />,
      bg: '#DBEAFE',
    },
    {
      id: 'fire' as EmergencyType,
      title: 'Fire',
      icon: <MaterialIcons name="fire-truck" size={26} color="#DC2626" />,
      bg: '#FEE2E2',
    },
    {
      id: 'accident' as EmergencyType,
      title: 'Accident',
      icon: <MaterialIcons name="car-crash" size={26} color="#1D4ED8" />,
      bg: '#DBEAFE',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFDAD6" />

      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        {router.canGoBack() && (
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#1E293B" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleSOSPress} onLongPress={handleSOSLongPress} delayLongPress={1500} style={styles.sosButtonContainer}>
            <Image source={require('../assets/BusImage/sos.jpg')} style={styles.sosImage} />
          </TouchableOpacity>

          <Text style={styles.emergencyText}>
            Press and hold to immediately alert emergency services and your trusted contacts.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>What is your emergency?</Text>

          <View style={styles.gridContainer}>
            {emergencyOptions.map((item) => {
              const isSelected = selectedEmergency === item.id;
              return (
                <TouchableOpacity key={item.id} style={[styles.gridItem, isSelected && styles.gridItemSelected,]} activeOpacity={0.7}
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setSelectedEmergency(isSelected ? null : item.id);
                  }}
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                    {item.icon}
                  </View>
                  <Text style={[styles.gridItemText, isSelected && styles.gridItemTextSelected]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCardWithoutPadding}>
          <View style={styles.mapContainer}>
            <Image source={require('../assets/BusImage/MapLocation.png')} style={styles.mapImage} />

            <View style={styles.locationBadge}>
              <View style={styles.locationPinCircle}>
                <MaterialIcons name="my-location" size={18} color="#16A34A" />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationBadgeLabel}>CURRENT LOCATION</Text>
                <Text style={styles.locationBadgeValue}>KN 5 Rd, Kigali</Text>
              </View>
            </View>
          </View>

          <View style={styles.contactsContent}>
            <View style={styles.contactsHeaderRow}>
              <Text style={styles.contactsTitle}>
                Share location with trusted contacts
              </Text>
              <TouchableOpacity style={styles.editRow} onPress={() => Alert.alert('Contacts', 'Navigate to trusted contacts manager.')} activeOpacity={0.7}>
                <MaterialIcons name="edit" size={14} color="#04325E" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.avatarsRow}>
              <View style={styles.avatarItem}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={20} color="#3B82F6" />
                  <View style={styles.onlineDot} />
                </View>
                <Text style={styles.avatarName}>Mom</Text>
              </View>

              <View style={styles.avatarItem}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={20} color="#3B82F6" />
                  <View style={styles.onlineDot} />
                </View>
                <Text style={styles.avatarName}>Brother</Text>
              </View>

              <TouchableOpacity style={styles.avatarItem} activeOpacity={0.7} onPress={() => Alert.alert('Add Contact', 'Add a trusted emergency contact.')} >
                <View style={styles.addCircle}>
                  <Ionicons name="add" size={24} color="#64748B" />
                </View>
                <Text style={styles.avatarName}>Add</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.liveStatusButton, isLiveSharing && styles.liveStatusButtonActive,]} onPress={handleToggleLiveShare} activeOpacity={0.85}>
              <MaterialIcons name={isLiveSharing ? 'radar' : 'cell-tower'} size={18} color="#FFFFFF" />
              <Text style={styles.liveStatusText}>
                {isLiveSharing ? 'Live Status Active (Tap to Stop)' : 'Share Live Status'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomFixedContainer, { paddingBottom: Math.max(insets.bottom, 16) },]}>
        <TouchableOpacity style={styles.callButton} activeOpacity={0.85} onPress={handleCallEmergency} >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.callButtonText}>Call 112 (Emergency)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFDAD6',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 28,
    marginTop: 4,
    marginBottom: 20,
  },
  sosButtonContainer: {
    width: 144,
    height: 144,
    borderRadius: 72,
    overflow: 'hidden',
    backgroundColor: '#BA1A1A',
    shadowColor: '#BA1A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosImage: {
    width: 144,
    height: 144,
    borderRadius: 72,
    resizeMode: 'cover',
  },
  emergencyText: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: '#8A151B',
    fontWeight: '500',
    maxWidth: 290,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionCardWithoutPadding: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FAFCFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  gridItemSelected: {
    borderColor: '#BA1A1A',
    backgroundColor: '#FFF5F5',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  gridItemTextSelected: {
    color: '#BA1A1A',
    fontWeight: '700',
  },
  mapContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  locationBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationPinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationBadgeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  locationBadgeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  contactsContent: {
    padding: 16,
  },
  contactsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  contactsTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  editText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#04325E',
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  avatarItem: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  addCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarName: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
    marginTop: 6,
  },
  liveStatusButton: {
    backgroundColor: '#042F5E',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  liveStatusButtonActive: {
    backgroundColor: '#0F766E',
  },
  liveStatusText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  bottomFixedContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 6,
  },
  callButton: {
    backgroundColor: '#B91C1C',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});