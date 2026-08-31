import {View,Text,StyleSheet,TouchableOpacity,ScrollView} from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {

  return (
  <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
  <Text style={styles.title}>Notifications</Text>
  <Text style={styles.sectionTitle}>Today</Text>
  <View style={styles.alertCard}>

  <View style={styles.iconCircle}>
  <Ionicons name="bus-outline" size={30}color="#0B3D66"/>
  </View>
  <View style={styles.alertInfo}>
  <View style={styles.alertHeader}>
  <Text style={styles.alertTitle}>Bus Arriving Soon</Text>
  <Text style={styles.time}> 2 min ago</Text>
  </View>
  <Text style={styles.alertDescription}>Your bus is arriving in 5 minutes at{'\n'} Kigali Heights station.</Text>
  </View>
  </View>
  <View style={styles.alertCard}>
  <View style={styles.iconCircle}>
  <Ionicons name="location-outline"size={30}color="#0B3D66" />
        </View>


        <View style={styles.alertInfo}>

          <View style={styles.alertHeader}>

            <Text style={styles.alertTitle}>
              Approaching Destination
            </Text>

            <Text style={styles.time}>
              15 min ago
            </Text>

          </View>


          <Text style={styles.alertDescription}>
            You are approaching your destination.{'\n'}
            Prepare to disembark.
          </Text>

        </View>

      </View>



      <View style={styles.serviceCard}>

        <View style={styles.warningCircle}>
          <Ionicons
            name="warning"
            size={32}
            color="#B42318"
          />
        </View>


        <View style={styles.alertInfo}>

          <View style={styles.alertHeader}>

            <Text style={styles.serviceTitle}>
              Service Alert
            </Text>

            <Text style={styles.serviceTime}>1 hr ago</Text>

          </View>


          <Text style={styles.alertDescription}>
            Route 101 has a delay due to traffic in{'\n'}
            the downtown area. Expected delay:{'\n'}
            15 mins.
          </Text>

        </View>

      </View>

      <Text style={styles.sectionTitle}>
        Earlier
      </Text>
      <View style={styles.alertCard}>

        <View style={styles.successCircle}>
          <Ionicons
            name="checkmark-circle-outline"
            size={32}
            color="#287A5A"
          />
        </View>


        <View style={styles.alertInfo}>

          <View style={styles.alertHeader}>

            <Text style={styles.alertTitle}>
              Trip Completed
            </Text>

            <Text style={styles.time}>
              Yesterday
            </Text>

          </View>


          <Text style={styles.alertDescription}>
            Your trip has been completed. Please{'\n'}
            take a moment to rate your driver.
          </Text>


          <TouchableOpacity style={styles.rateButton}>
            <Text style={styles.rateText}>
              Rate Trip
            </Text>
          </TouchableOpacity>

        </View>

      </View>

      <View style={styles.alertCard}>

        <View style={styles.iconCircle}>
          <Ionicons
            name="wallet-outline"
            size={30}
            color="#0B3D66"
          />
        </View>
        <View style={styles.alertInfo}>

          <View style={styles.alertHeader}>

            <Text style={styles.alertTitle}>
              Wallet Top-up
            </Text>

            <Text style={styles.time}>
              Yesterday
            </Text>

          </View>
          <Text style={styles.alertDescription}>
            Successfully added 5,000 RWF to{'\n'}
            your TEGA Bus wallet.
          </Text>

        </View>

      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
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
    marginTop: 49,
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
    marginBottom: 40,
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

});