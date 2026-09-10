import Headers from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { getCurrentUser } from '../services/profileService';

const accountItems = [
  { icon: 'person-outline', label: 'Personal Info' },
  { icon: 'location-outline', label: 'Saved Locations' },
  { icon: 'wallet-outline', label: 'Payment Methods' },
  { icon: 'repeat-outline', label: 'Favorite Routes' },
  { icon: 'time-outline', label: 'Trip History' },
];

const settingsItems = [
  { icon: 'settings-outline', label: 'Settings' },
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
  const { user, token, updateUser, logout } = useAuth();

  useEffect(() => {
    if (!token) return;
    getCurrentUser(token).then(updateUser).catch(() => undefined);
  }, [token]);

  const handleChangePhoto = () => {
    Alert.alert('Profile photo', 'Choose how you want to update your photo.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove photo', style: 'destructive', onPress: () => updateUser({ avatarUri: null }) },
      { text: 'Choose from library', onPress: pickPhoto },
    ]);
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo access to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateUser({ avatarUri: result.assets[0].uri });
      Toast.show({ type: 'success', text1: 'Profile photo updated' });
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            Toast.show({
              type: 'success',
              text1: 'Logged Out',
              text2: 'You have been logged out successfully',
              position: 'top',
            });
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Headers />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar + name */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarWrap}>
            {user?.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={42} color="#94A3B8" />
              </View>
            )}
            <TouchableOpacity style={styles.editBadge} onPress={handleChangePhoto}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.name || 'User Profile'}</Text>
          <Text style={styles.email}>{user?.email || 'No email provided'}</Text>
        </View>

        {/* Account section */}
        <View style={styles.card}>
          {accountItems.map((item) => (
            <ProfileRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              onPress={
                  item.label === 'Personal Info'
                  ? () => router.push('/personal-info')
                  : item.label === 'Saved Locations'
                  ? () => router.push('/saved-locations')
                  : item.label === 'Payment Methods'
                    ? () => router.push('/payment')
                    : item.label === 'Favorite Routes'
                      ? () => router.push('/(tabs)/explore')
                      : item.label === 'Trip History'
                        ? () => router.push('/(tabs)/trips')
                    : undefined
              }
            />
          ))}
        </View>
        <View style={styles.card}>
          {settingsItems.map((item) => (
            <ProfileRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              onPress={item.label === 'Settings' || item.label === 'Notification Settings' ? () => router.push('/settings') : undefined}
            />
          ))}
        </View>

        {/* Logout */}
        <View style={styles.card}>
          <ProfileRow icon="log-out-outline" label="Logout" danger showChevron={false} onPress={handleLogout} />
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
  avatarPlaceholder: {
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
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
