import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import React from 'react';
const accountItems = [
  { icon: 'person-outline', label: 'Personal Info' },
  { icon: 'location-outline', label: 'Saved Locations' },
  { icon: 'wallet-outline', label: 'Payment Methods' },
  { icon: 'repeat-outline', label: 'Favorite Routes' },
  { icon: 'time-outline', label: 'Trip History' },
];

const settingsItems = [
  { icon: 'notifications-outline', label: 'Notification Settings' },
  { icon: 'shield-outline', label: 'Privacy' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
];

function ProfileRow({
  icon,
  label,
  danger,
  showChevron = true,
  onPress,
}: {
  icon: string;
  label: string;
  danger?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.rowIconBox, danger && styles.rowIconBoxDanger]}>
        <Ionicons name={icon as any} size={18} color={danger ? '#D64545' : '#0B3D66'} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {showChevron && <Ionicons name="chevron-forward" size={18} color="#CCC" />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
 return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={24} color="#0B3D66" />
        <Text style={styles.headerTitle}>TEGA Bus Rwanda</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar + name */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarWrap}>
            <Image source={require('../assets/BusImage/profile.png')} style={styles.avatar} />
            <TouchableOpacity style={styles.editBadge}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>Alex Murenzi</Text>
          <Text style={styles.email}>alex@example.com</Text>
        </View>

        {/* Account section */}
        <View style={styles.card}>
          {accountItems.map((item, index) => (
            <ProfileRow key={item.label} icon={item.icon} label={item.label} />
          ))}
        </View>
        <View style={styles.card}>
          {settingsItems.map((item) => (
            <ProfileRow key={item.label} icon={item.icon} label={item.label} />
          ))}
        </View>

        {/* Logout */}
        <View style={styles.card}>
          <ProfileRow icon="log-out-outline" label="Logout" danger showChevron={false} />
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  scrollContent: {
    padding: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0B3D66',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  email: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  rowIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#E9F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconBoxDanger: {
    backgroundColor: '#FCEAEA',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  rowLabelDanger: {
    color: '#D64545',
  },
});
