import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Ionicons name={icon as any} size={18} color="#0B3D66" />
      </View>
      <View style={styles.valueWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

export default function PersonalInfoScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Header title="Personal Information" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Your account details</Text>
        <View style={styles.card}>
          <InfoRow icon="person-outline" label="Full name" value={user?.name || 'Not provided'} />
          <InfoRow icon="mail-outline" label="Email address" value={user?.email || 'Not provided'} />
          <InfoRow icon="call-outline" label="Phone number" value={user?.phone || 'Not provided'} />
          <InfoRow icon="shield-checkmark-outline" label="Account type" value={user?.role || 'Passenger'} />
        </View>
        <Text style={styles.note}>To change your profile picture, use the edit button on your profile.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FC' },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#D4D9E1',
    backgroundColor: '#FFF',
  },
  backButton: { width: 36 },
  headerSpacer: { width: 36 },
  title: { fontSize: 17, fontWeight: '700', color: '#14283F' },
  content: { padding: 20 },
  intro: { fontSize: 15, fontWeight: '700', color: '#0B2F55', marginBottom: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF1F4',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9F0FE',
    marginRight: 12,
  },
  valueWrap: { flex: 1 },
  label: { fontSize: 12, color: '#7B8491', marginBottom: 3 },
  value: { fontSize: 15, color: '#26384A', fontWeight: '600' },
  note: { color: '#7B8491', fontSize: 13, lineHeight: 19, marginTop: 16 },
});