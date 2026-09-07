import React from 'react';
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BusDetailsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>

        <View style={styles.headerLeft}>
          <View style={styles.profileCircle}>
            <Ionicons
              name="person-outline"
              size={22}
              color="#12213D"
            />
          </View>

          <Text style={styles.headerTitle}>
            SmartRide Rwanda
          </Text>
        </View>

        <TouchableOpacity>
          <Ionicons
            name="notifications-outline"
            size={27}
            color="#4B4F58"
          />
        </TouchableOpacity>

      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}showsVerticalScrollIndicator={false}>
        <View style={styles.busHeader}>

          <View>
            <Text style={styles.busNumber}>
              BUS 101
            </Text>

            <View style={styles.routeRow}>
              <Ionicons
                name="git-compare-outline"
                size={20}
                color="#4B4F58"
              />

              <Text style={styles.routeText}>
                Kigali → Nyabugogo
              </Text>
            </View>
          </View>

          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />

            <Text style={styles.activeText}> Active</Text>
          </View>

        </View>

        {/* Driver Card */}
        <View style={styles.card}>

          <View style={styles.driverImage}>
            <Ionicons
              name="person"
              size={32}
              color="#6B7280"
            />
          </View>

          <View style={styles.driverInfo}>

            <Text style={styles.smallTitle}>
              DRIVER
            </Text>

            <Text style={styles.driverName}>
              Jean Pierre
            </Text>

            <View style={styles.ratingRow}>
              <Text style={styles.star}>
                ★
              </Text>

              <Text style={styles.rating}>
                4.8
              </Text>
            </View>

          </View>

        </View>
        <View style={styles.card}>

        <Text style={styles.smallTitle}>CURRENT STATUS</Text>
         <View style={styles.statusRow}>

            <Ionicons
              name="navigate-outline"
              size={25}
              color="#12213D"
            />

            <Text style={styles.statusText}>
              Approaching Kimironko
            </Text>

          </View>

          <View style={styles.line} />

          <View style={styles.nextStopRow}>

            <Text style={styles.nextStop}>
              Next Stop: <Text style={styles.stopName}>
                Remera Market
              </Text>
            </Text>

            <Text style={styles.minutes}>
              in 3 mins
            </Text>

          </View>

        </View>

        {/* Availability */}
        <View style={styles.card}>

          <View style={styles.availabilityHeader}>

            <Text style={styles.smallTitle}>
              AVAILABILITY
            </Text>

            <Text style={styles.fullText}>
              60% Full
            </Text>

          </View>

          <View style={styles.progressBackground}>
            <View style={styles.progress} />
          </View>

          <Text style={styles.seats}>
            Approx. 24 seats remaining
          </Text>

        </View>

        {/* Trip Progress */}
        <View style={styles.card}>

          <Text style={styles.tripProgressTitle}>
            Trip Progress
          </Text>

          {/* Kigali */}
          <View style={styles.progressItem}>

            <View style={styles.timeline}>

              <View style={styles.completedDot} />

              <View style={styles.timelineLine} />

            </View>

            <View style={styles.stopInfo}>

              <Text style={styles.stopTitle}>
                Kigali Downtown
              </Text>

              <Text style={styles.timeText}>Departed 10:15 AM </Text>
            </View>

          </View>
          <View style={styles.progressItem}>

            <View style={styles.timeline}>

              <View style={styles.currentCircle}>
                <View style={styles.currentDot} />
              </View>

              <View style={styles.timelineLine} />

            </View>

            <View style={styles.stopInfo}>

            <Text style={styles.currentStop}> Kimironko</Text>

            <Text style={styles.approachingText}> Approaching now</Text>

            </View>

          </View>

          {/* Remera */}
          <View style={styles.progressItem}>

            <View style={styles.timeline}>

              <View style={styles.futureDot} />

              <View style={styles.timelineLineLight} />

            </View>

            <View style={styles.stopInfo}>

              <Text style={styles.futureStop}>
                Remera Market
              </Text>

              <Text style={styles.timeText}>
                ETA: 3 mins
              </Text>

            </View>

          </View>

          {/* Nyabugogo */}
          <View style={styles.progressItem}>

            <View style={styles.timeline}>

              <View style={styles.futureDot} />

            </View>

            <View style={styles.stopInfo}>

              <Text style={styles.futureStop}>
                Nyabugogo Bus Park
              </Text>

              <Text style={styles.timeText}>
                ETA: 25 mins
              </Text>

            </View>

          </View>

        </View>

        {/* Track Live Button */}
        <TouchableOpacity style={styles.trackButton}>

          <Ionicons
            name="location-outline"
            size={27}
            color="#FFFFFF"
          />

          <Text style={styles.trackButtonText}>
            Track Live
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  /* Header */

  header: {
    height: 90,
    backgroundColor: '#F7F8FC',
    borderBottomWidth: 1,
    borderBottomColor: '#D8DCE5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileCircle: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#E1EAFB',
    borderWidth: 1,
    borderColor: '#B9C4D6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#08294D',
    marginLeft: 12,
  },

  /* Scroll */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  /* Bus */

  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  busNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: '#08294D',
  },

  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  routeText: {
    fontSize: 21,
    color: '#4B4F58',
    marginLeft: 7,
  },

  activeBadge: {
    backgroundColor: '#D7F7E7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#087D3F',
    marginRight: 6,
  },

  activeText: {
    color: '#087D3F',
    fontSize: 16,
    fontWeight: '500',
  },

  /* Cards */

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8CDD8',
    borderRadius: 12,
    padding: 27,
    marginBottom: 22,
  },

  /* Driver */

  driverImage: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#E8EBF0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },

  driverInfo: {
    flex: 1,
  },

  smallTitle: {
    fontSize: 16,
    color: '#4B4F58',
    letterSpacing: 0.5,
  },

  driverName: {
    fontSize: 27,
    fontWeight: '700',
    color: '#10243D',
    marginTop: 7,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  star: {
    fontSize: 20,
    color: '#E7AA00',
    marginRight: 6,
  },

  rating: {
    fontSize: 19,
    color: '#4B4F58',
  },

  /* Status */

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  statusText: {
    fontSize: 22,
    color: '#10243D',
    marginLeft: 10,
  },

  line: {
    height: 1,
    backgroundColor: '#E0E5EE',
    marginVertical: 15,
  },

  nextStopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  nextStop: {
    fontSize: 19,
    color: '#4B4F58',
  },

  stopName: {
    color: '#10243D',
  },

  minutes: {
    fontSize: 18,
    color: '#087D3F',
    fontWeight: '600',
  },

  /* Availability */

  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fullText: {
    fontSize: 31,
    fontWeight: '700',
    color: '#08294D',
  },

  progressBackground: {
    height: 16,
    backgroundColor: '#DCE8FA',
    borderRadius: 10,
    marginTop: 12,
    overflow: 'hidden',
  },

  progress: {
    width: '60%',
    height: '100%',
    backgroundColor: '#08294D',
    borderRadius: 10,
  },

  seats: {
    textAlign: 'center',
    fontSize: 17,
    color: '#4B4F58',
    marginTop: 10,
  },

  /* Trip Progress */

  tripProgressTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#10243D',
    marginBottom: 20,
  },

  progressItem: {
    flexDirection: 'row',
    minHeight: 80,
  },

  timeline: {
    width: 35,
    alignItems: 'center',
    position: 'relative',
  },

  completedDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#08294D',
  },

  currentCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: '#BCE9D0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  currentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0AA45C',
  },

  futureDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DCE8FA',
  },

  timelineLine: {
    position: 'absolute',
    top: 13,
    width: 3,
    height: 70,
    backgroundColor: '#DCE8FA',
  },

  timelineLineLight: {
    position: 'absolute',
    top: 13,
    width: 3,
    height: 70,
    backgroundColor: '#DCE8FA',
  },

  stopInfo: {
    flex: 1,
    marginLeft: 8,
  },

  stopTitle: {
    fontSize: 22,
    color: '#10243D',
    fontWeight: '500',
  },

  currentStop: {
    fontSize: 22,
    color: '#10243D',
    fontWeight: '700',
  },

  futureStop: {
    fontSize: 21,
    color: '#4B4F58',
  },

  timeText: {
    fontSize: 18,
    color: '#4B4F58',
    marginTop: 4,
  },

  approachingText: {
    fontSize: 18,
    color: '#087D3F',
    marginTop: 4,
  },

  /* Track Button */

  trackButton: {
    height: 76,
    backgroundColor: '#063B70',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '500',
    marginLeft: 10,
  },

});