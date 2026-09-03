import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TripDetailsScreen() {
  return (
    <View style={styles.container}>

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.profileCircle}>
          <Ionicons name="person" size={18} color="#0B3158" />
        </View>

        <Text style={styles.appName}>SmartRide Rwanda</Text>

        <Ionicons
          name="notifications-outline"
          size={23}
          color="#4E5662"
        />
      </View>

      {/* Page Header */}
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={25}
            color="#14283F"
          />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Trip Details</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Trip Summary Card */}
        <View style={styles.tripCard}>

          <View style={styles.tripTopRow}>

            <View style={styles.todayBadge}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color="#3E4D60"
              />
              <Text style={styles.todayText}>Today</Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Not Started</Text>
            </View>

          </View>

          <View style={styles.tripMiddleRow}>

            <View>
              <Text style={styles.city}>Kigali City →</Text>
              <Text style={styles.city}>Nyabugogo</Text>

              <View style={styles.timeRow}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#59616C"
                />

                <Text style={styles.timeText}>
                  10:00 AM - 10:30 AM
                </Text>
              </View>
            </View>

            <View>
              <Text style={styles.priceCurrency}>RWF</Text>
              <Text style={styles.price}>500</Text>
            </View>

          </View>

        </View>

        {/* Route Map */}
        <View style={styles.routeCard}>

          <Text style={styles.routeTitle}>Route Map</Text>

          {/* Kigali City */}
          <View style={styles.stopRow}>

            <View style={styles.routeIconContainer}>
              <View style={styles.startOuter}>
                <View style={styles.startInner} />
              </View>

              <View style={styles.routeLine} />
            </View>

            <View style={styles.stopInfo}>
              <Text style={styles.stopName}>Kigali City</Text>
              <Text style={styles.stopType}>Departure</Text>
            </View>

            <Text style={styles.stopTime}>10:00 AM</Text>

          </View>

          <View style={styles.stopRow}>

            <View style={styles.routeIconContainer}>
              <View style={styles.stopCircle} />
              <View style={styles.routeLine} />
            </View>

            <View style={styles.stopInfo}>
              <Text style={styles.stopName}>Kimironko</Text>
              <Text style={styles.stopType}>Stop 1</Text>
            </View>

            <Text style={styles.stopTime}>10:10 AM</Text>

          </View>

          <View style={styles.stopRow}>

            <View style={styles.routeIconContainer}>
              <View style={styles.stopCircle} />
              <View style={styles.routeLine} />
            </View>

            <View style={styles.stopInfo}>
              <Text style={styles.stopName}>Remera</Text>
              <Text style={styles.stopType}>Stop 2</Text>
            </View>

            <Text style={styles.stopTime}>10:20 AM</Text>

          </View>

          {/* Nyabugogo */}
          <View style={styles.stopRow}>

            <View style={styles.routeIconContainer}>
              <View style={styles.destinationCircle}>
                <Ionicons
                  name="location-outline"
                  size={15}
                  color="#9DA7B5"
                />
              </View>
            </View>

            <View style={styles.stopInfo}>
              <Text style={styles.stopName}>Nyabugogo</Text>
              <Text style={styles.stopType}>Destination</Text>
            </View>

            <Text style={styles.stopTime}>10:30 AM</Text>

          </View>

        </View>

        {/* Start Trip Button */}
        <TouchableOpacity style={styles.startButton} onPress={() => router.push('/payment')}>

          <Ionicons
            name="bus-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.startButtonText}>
            Start Trip
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },

  /* Top header */
  topHeader: {
    height: 57,
    backgroundColor: '#F5F7FC',
    borderBottomWidth: 1,
    borderBottomColor: '#D4D9E1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  profileCircle: {
    width: 28,
    height: 28,
    borderRadius: 15,
    backgroundColor: '#DCEAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  appName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2745',
  },

  /* Page header */
  pageHeader: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    gap: 22,
  },

  pageTitle: {
    fontSize: 21,
    fontWeight: '600',
    color: '#14283F',
  },

  /* Scroll */
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 30,
  },

  /* Trip card */
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCD2DC',
    borderRadius: 8,
    padding: 17,
    marginBottom: 20,
  },

  tripTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCEAFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },

  todayText: {
    fontSize: 12,
    color: '#3E4D60',
  },

  statusBadge: {
    backgroundColor: '#DCEAFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 12,
    color: '#193B64',
  },

  tripMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  city: {
    fontSize: 18,
    fontWeight: '600',
    color: '#12263E',
    marginBottom: 2,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 3,
  },

  timeText: {
    fontSize: 12,
    color: '#59616C',
  },

  priceCurrency: {
    fontSize: 19,
    fontWeight: '700',
    color: '#10243B',
    textAlign: 'right',
  },

  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10243B',
    textAlign: 'right',
  },

  /* Route card */
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCD2DC',
    borderRadius: 8,
    padding: 17,
    marginBottom: 20,
  },

  routeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14283F',
    marginBottom: 18,
  },

  stopRow: {
    minHeight: 59,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  routeIconContainer: {
    width: 28,
    alignItems: 'center',
  },

  startOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#063F76',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  startInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#063F76',
  },

  stopCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C4CBD5',
    backgroundColor: '#FFFFFF',
  },

  destinationCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C4CBD5',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  routeLine: {
    width: 1,
    height: 40,
    backgroundColor: '#C4CBD5',
  },

  stopInfo: {
    flex: 1,
    marginLeft: 8,
  },

  stopName: {
    fontSize: 15,
    color: '#14283F',
    marginBottom: 3,
  },

  stopType: {
    fontSize: 12,
    color: '#59616C',
  },

  stopTime: {
    fontSize: 12,
    color: '#4D5560',
    marginTop: 8,
  },

  /* Start button */
  startButton: {
    height: 49,
    backgroundColor: '#032D55',
    borderRadius: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});