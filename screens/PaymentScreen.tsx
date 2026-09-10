import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getPaymentMethods, PaymentMethod } from '../services/profileService';

export default function PaymentScreen() {
  const { token } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMethods = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      setError(null);
      const result = await getPaymentMethods(token);
      setMethods(result);
      setSelectedMethod(result[0]?.id || '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load payment methods');
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadMethods(); }, [loadMethods]);

  return (
    <View style={styles.container}>
      <Header title="Payment" showBack onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tripCard}>
          <View style={styles.priceRow}><Text style={styles.price}>RWF 500</Text><View style={styles.secureBadge}><Ionicons name="shield-checkmark-outline" size={17} color="#32D875" /><Text style={styles.secureText}>Secure</Text></View></View>
          <View style={styles.divider} />
          <Text style={styles.locationLabel}>From</Text><Text style={styles.locationName}>Kigali City</Text>
          <Text style={styles.locationLabel}>To</Text><Text style={styles.locationName}>Nyabugogo</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        {loading && <ActivityIndicator color="#06467F" />}
        {error && <Text style={styles.emptyText}>{error}</Text>}
        {!loading && !error && methods.length === 0 && <Text style={styles.emptyText}>No payment methods found.</Text>}
        {methods.map((method) => <TouchableOpacity key={method.id} style={[styles.paymentOption, selectedMethod === method.id && styles.selectedOption]} onPress={() => setSelectedMethod(method.id)}>
          <View style={[styles.radio, selectedMethod === method.id && styles.radioSelected]}>{selectedMethod === method.id && <View style={styles.radioDot} />}</View>
          <View style={styles.methodIcon}><Ionicons name={method.type.toLowerCase().includes('card') ? 'card-outline' : 'phone-portrait-outline'} size={27} color="#06467F" /></View>
          <View><Text style={styles.methodTitle}>{method.label}</Text><Text style={styles.methodSubtitle}>{method.details || method.type}</Text></View>
        </TouchableOpacity>)}
        <View style={styles.summaryCard}>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>

         <Text style={styles.summaryValue}>  RWF 480</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>

        <Text style={styles.summaryValue}>  RWF 20</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>

            <Text style={styles.totalValue}>RWF 500</Text>
          </View>

        </View>

      </ScrollView>
      <View style={styles.bottomContainer}>

        <TouchableOpacity style={styles.payButton} onPress={() => router.replace('/trip-details')}>

          <Text style={styles.payButtonText}>
            Pay & Continue
          </Text>

          <Ionicons
            name="arrow-forward"
            size={25}
            color="#FFFFFF"
          />

        </TouchableOpacity>

        <View style={styles.encrypted}>

          <Ionicons
            name="lock-closed-outline"
            size={16}
            color="#59616C"
          />

          <Text style={styles.encryptedText}>
            Payments are secure and encrypted
          </Text>

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 16,
  },
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#D6DAE2',
    gap: 25,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0B2745',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7CCD6',
    borderRadius: 10,
    padding: 26,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10243B',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DDFCE9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  secureText: {
    color: '#32D875',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#DDE1E7',
    marginVertical: 20,
  },
  locationContainer: {
    flexDirection: 'row',
  },

  locationIcons: {
    width: 25,
    alignItems: 'center',
    paddingTop: 5,
    marginRight: 12,
  },

  startCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#06467F',
    backgroundColor: '#FFFFFF',
  },

  locationLine: {
    width: 2,
    height: 40,
    backgroundColor: '#C9D0D9',
  },

  endCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#42DB79',
  },

  locations: {
    flex: 1,
  },

  locationLabel: {
    fontSize: 15,
    color: '#555D68',
    marginBottom: 3,
  },

  locationName: {
    fontSize: 14,
    color: '#12263E',
    marginBottom: 23,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10243B',
    marginTop: 32,
    marginBottom: 14,
  },

  paymentOption: {
    minHeight: 110,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7CCD6',
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedOption: {
    borderWidth: 2,
    borderColor: '#06467F',
    backgroundColor: '#EFF5FF',
  },

  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#C1C8D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },

  radioSelected: {
    backgroundColor: '#06467F',
    borderColor: '#06467F',
  },

  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  methodIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D9E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },

  methodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#14283F',
    marginBottom: 4,
  },

  methodSubtitle: {
    fontSize: 14,
    color: '#59616C',
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7CCD6',
    borderRadius: 10,
    padding: 26,
    marginTop: 8,
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  summaryLabel: {
    fontSize: 14,
    color: '#555D68',
  },

  summaryValue: {
    fontSize: 14,
    color: '#555D68',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#DDE1E7',
    marginBottom: 22,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10243B',
  },

  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10243B',
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D6DAE2',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },

  payButton: {
    height: 72,
    backgroundColor: '#06467F',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  payButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  encrypted: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },

  encryptedText: {
    fontSize: 15,
    color: '#59616C',
    letterSpacing: 0.5,
  },
});
