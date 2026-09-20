import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert,} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '../components/Header';
import { useAuth } from '@/context/AuthContext';

export default function PaymentScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    tripId?: string;
    routeId?: string;
    from?: string;
    to?: string;
    fare?: string;
  }>();

  // Dynamic or fallback trip info
  const fromLocation = params.from || 'Kigali City';
  const toLocation = params.to || 'Nyabugogo';
  const totalAmount = params.fare ? parseInt(params.fare, 10) : 500;
  const serviceFee = 20;
  const subtotal = Math.max(0, totalAmount - serviceFee);

  // Auto-fill phone from logged-in user if available (stripping +250 if present)
  const initialPhone = (user?.phone || '')
    .replace(/^\+?250/, '')
    .replace(/\s+/g, '');

  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [isFocused, setIsFocused] = useState(false);

  // Format phone number with spaces (e.g. 0788 123 456)
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
  };

  const formattedDisplayNumber = () => {
    if (phoneNumber.length <= 4) return phoneNumber;
    if (phoneNumber.length <= 7)
      return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4)}`;
    return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`;
  };

  const isPhoneValid = () => {
    // Valid Rwanda mobile numbers are 9 or 10 digits (078/079/072/073 or 78/79/72/73)
    const cleaned = phoneNumber.replace(/\s+/g, '');
    return cleaned.length >= 9 && cleaned.length <= 10;
  };

  const handleProceed = () => {
    if (!isPhoneValid()) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid Rwandan mobile number (e.g. 0788 123 456).'
      );
      return;
    }

    // Proceed to next step / trip details
    router.replace('/trip-details');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Payment" showBack onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trip Summary Card */}
        <View style={styles.tripCard}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>RWF {totalAmount.toLocaleString()}</Text>

            <View style={styles.secureBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#16A34A"
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
              <Text style={styles.locationName}>{fromLocation}</Text>

              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.locationName}>{toLocation}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method - Mobile Money Only */}
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <View style={styles.momoCard}>
          {/* Header Row */}
          <View style={styles.momoHeaderRow}>
            <View style={styles.momoIconBadge}>
              <Ionicons name="phone-portrait" size={24} color="#06467F" />
            </View>
            <View style={styles.momoHeaderText}>
              <View style={styles.brandRow}>
                <Text style={styles.momoTitle}>Mobile Money</Text>
                <View style={styles.mtnTag}>
                  <Text style={styles.mtnTagText}>MTN MoMo</Text>
                </View>
              </View>
              <Text style={styles.momoSubtitle}>Direct payment via phone prompt</Text>
            </View>
            <View style={styles.radioSelected}>
              <View style={styles.radioDot} />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.cardInnerDivider} />

          {/* Phone Number Input Section */}
          <Text style={styles.inputLabel}>Enter MTN MoMo Phone Number</Text>
          <View
            style={[
              styles.phoneInputWrapper,
              isFocused && styles.phoneInputWrapperFocused,
            ]}
          >
            <View style={styles.countryCodeBadge}>
              <Text style={styles.flagEmoji}>🇷🇼</Text>
              <Text style={styles.countryCodeText}>+250</Text>
            </View>

            <TextInput
              style={styles.phoneInput}
              placeholder="078X XXX XXX"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={formattedDisplayNumber()}
              onChangeText={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={12}
            />

            {phoneNumber.length > 0 && (
              <TouchableOpacity
                onPress={() => setPhoneNumber('')}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Helper / Prompt Note */}
          <View style={styles.infoBanner}>
            <MaterialCommunityIcons
              name="cellphone-wireless"
              size={18}
              color="#0284C7"
            />
            <Text style={styles.infoBannerText}>
              You will receive an instant prompt on this phone to authorize payment by entering your MTN PIN.
            </Text>
          </View>
        </View>

        {/* Security Assurance */}
        <View style={styles.securityBox}>
          <Ionicons name="lock-closed" size={16} color="#16A34A" />
          <Text style={styles.securityBoxText}>
            Never share your PIN. You will enter your PIN only on your phone's official MTN prompt. TEGA never requests or stores your PIN.
          </Text>
        </View>

        {/* Price Breakdown */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>RWF {subtotal.toLocaleString()}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>RWF {serviceFee.toLocaleString()}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>RWF {totalAmount.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            !isPhoneValid() && styles.payButtonDisabled,
          ]}
          onPress={handleProceed}
          activeOpacity={0.85}
        >
          <Text style={styles.payButtonText}>
            Pay RWF {totalAmount.toLocaleString()} with MoMo
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.encrypted}>
          <Ionicons name="shield-checkmark" size={14} color="#64748B" />
          <Text style={styles.encryptedText}>
            Secured by MTN Mobile Money & Encrypted
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    padding: 18,
    paddingBottom: 28,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B2745',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  secureText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 16,
  },
  locationContainer: {
    flexDirection: 'row',
  },
  locationIcons: {
    width: 20,
    alignItems: 'center',
    paddingTop: 4,
    marginRight: 12,
  },
  startCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#06467F',
    backgroundColor: '#FFFFFF',
  },
  locationLine: {
    width: 2,
    height: 38,
    backgroundColor: '#CBD5E1',
  },
  endCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16A34A',
  },
  locations: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 12,
  },
  momoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#06467F',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  momoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  momoIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EBF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  momoHeaderText: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  momoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  mtnTag: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mtnTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#854D0E',
    letterSpacing: 0.2,
  },
  momoSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#06467F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  cardInnerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    overflow: 'hidden',
  },
  phoneInputWrapperFocused: {
    borderColor: '#06467F',
    backgroundColor: '#FFFFFF',
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  flagEmoji: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  infoBannerText: {
    fontSize: 11.5,
    color: '#0369A1',
    lineHeight: 16,
    flex: 1,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  securityBoxText: {
    fontSize: 11.5,
    color: '#15803D',
    lineHeight: 16,
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13.5,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#06467F',
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  payButton: {
    height: 54,
    backgroundColor: '#06467F',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#94A3B8',
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
    marginTop: 10,
  },
  encryptedText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
