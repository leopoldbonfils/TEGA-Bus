import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PaymentScreen() {
  const [selectedMethod, setSelectedMethod] = useState('mobile');

  return (
    <View style={styles.container}>

      {/* Payment Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#14283F" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tripCard}>

          <View style={styles.priceRow}>
            <Text style={styles.price}>RWF 500</Text>

            <View style={styles.secureBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color="#32D875"
              />
              <Text style={styles.secureText}>Secure</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.locationContainer}>
            <View style={styles.locationIcons}>
              <View style={styles.startCircle} />

              <View style={styles.locationLine} />

              <View style={styles.endCircle} />
            </View>

            <View style={styles.locations}>

              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.locationName}>Kigali City</Text>

              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.locationName}>Nyabugogo</Text>

            </View>

          </View>

        </View>

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>
          Payment Method
        </Text>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedMethod === 'mobile' && styles.selectedOption,
          ]}
          onPress={() => setSelectedMethod('mobile')}
        >

          <View
            style={[
              styles.radio,
              selectedMethod === 'mobile' && styles.radioSelected,
            ]}
          >
            {selectedMethod === 'mobile' && (
              <View style={styles.radioDot} />
            )}
          </View>

          <View style={styles.methodIcon}>
            <Ionicons
              name="phone-portrait-outline"
              size={27}
              color="#06467F"
            />
          </View>

          <View>
            <Text style={styles.methodTitle}>
              Mobile Money
            </Text>

            <Text style={styles.methodSubtitle}>
              MTN / Airtel
            </Text>
          </View>

        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedMethod === 'card' && styles.selectedOption,
          ]}
          onPress={() => setSelectedMethod('card')}
        >

          <View
            style={[
              styles.radio,
              selectedMethod === 'card' && styles.radioSelected,
            ]}
          >
            {selectedMethod === 'card' && (
              <View style={styles.radioDot} />
            )}
          </View>

          <View style={styles.methodIcon}>
            <Ionicons
              name="card-outline"
              size={27}
              color="#4D5968"
            />
          </View>

          <View>
            <Text style={styles.methodTitle}>
              Credit/Debit Card
            </Text>

            <Text style={styles.methodSubtitle}>
              Visa, Mastercard
            </Text>
          </View>

        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedMethod === 'wallet' && styles.selectedOption,
          ]}
          onPress={() => setSelectedMethod('wallet')}
        >

          <View
            style={[
              styles.radio,
              selectedMethod === 'wallet' && styles.radioSelected,
            ]}
          >
            {selectedMethod === 'wallet' && (
              <View style={styles.radioDot} />
            )}
          </View>

          <View style={styles.methodIcon}>
            <Ionicons
              name="wallet-outline"
              size={27}
              color="#4D5968"
            />
          </View>

          <View>
            <Text style={styles.methodTitle}>
              SmartRide Wallet
            </Text>

            <Text style={styles.methodSubtitle}>
              Balance: RWF 1,200
            </Text>
          </View>

        </TouchableOpacity>
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
