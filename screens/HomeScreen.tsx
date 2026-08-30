import{ View,Text,TouchableOpacity,StyleSheet,ScrollView} from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
    <View style={styles.searchBox}>
    <Text style={styles.title}>Where do you want to go?</Text>
    <TouchableOpacity style={styles.locationBox}>
    <Ionicons name="location-outline" size={24} color="#555" />
    <Text style={styles.locationText}>current location</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.locationBox}>
      <Ionicons name="location" size={24} color="#555" />
      <Text style={styles.locationText}>search destination</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.findButton}>
      <Text style={styles.findButtonText}>Find Route</Text>
      </TouchableOpacity>
     </View>


     <View style={styles.menuRow}>
      <TouchableOpacity  style={styles.menuButton}>
        <Ionicons name ="menu" size={24} color="#555" />
        <Text style={styles.menuButtonText}>Find BUs</Text>
      </TouchableOpacity>
     
    <TouchableOpacity style={styles.menuButton}>
          <View style={styles.iconCircle}>
            <Ionicons name="location-outline" size={24} color="#0B3D66" />
          </View>
         <Text style={styles.menuText}> NearbyStops</Text>
         </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton}>
        <View style={styles.iconCircle}>
          <Ionicons name="git-branch-outline" size={24} color="#0B3D66" />
         <Text style={styles.menuText}> Plan a Trip</Text>
        </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.iconCircle}>
            <Ionicons name="ticket-outline" size={24} color="#0B3D66" />
          </View>

          <Text style={styles.menuText}> My Tickets</Text>
        </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Trip </Text>
      </View>

      <View style={styles.tripCard}>
      <View style={styles.routeBox}>
      <Text style={styles.routeText}>Route</Text>
      <Text style={styles.routeNumber}> 101</Text>
      </View>
      <View style={styles.tripInfo}>

          <Text style={styles.destinationText}> To Nyabugogo</Text>

          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={16} color="#555" />
         <Text style={styles.timeText}> 08:30 AM</Text>
        </View>
        </View>
        <View style={styles.arrivalSection}>

          <View style={styles.arrivingBox}>
            <Text style={styles.arrivingText}>Arriving</Text>
          </View>
          <Text style={styles.minutesText}>in 5 mins</Text>
          </View>
          </View>

         <View style={styles.nearbyHeader}>

        <Text style={styles.sectionTitle}> Nearby Stops</Text>
          <TouchableOpacity>
          <Text style={styles.viewMap}>View map</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stopCard}>

        <View style={styles.stopNameRow}>
        <Ionicons name="qr-code-outline"size={22}color="#0B3D66"/>
        <Text style={styles.stopName}> Downtown Kigali</Text>
        </View>
        <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
        <Ionicons name="resize-outline"size={15} color="#555" />
       <Text style={styles.detailText}>500m</Text>
          </View>
        <View style={styles.detailItem}>
        <Ionicons name="walk-outline" size={16} color="#555"/>
        <Text style={styles.detailText}> 6 min</Text>
        </View>
        </View>
        <Text style={styles.availableText}> Available Buses:</Text>
        <View style={styles.busRow}>
        <View style={styles.busNumber}>
        <Text style={styles.busText}>101</Text>
          </View>
        <View style={styles.busNumber}>
        <Text style={styles.busText}> 102 </Text>
          </View>
        <View style={styles.busNumber}>
        <Text style={styles.busText}>  105 </Text>
        </View>
       </View>
      </View>
      </ScrollView>
  )
}
const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  searchBox: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B3D66',
    marginBottom: 15,
  },
  locationBox: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#F8F9FD',
  },
  locationText: {
    marginLeft: 14,
    fontSize: 14,
    color: '#333',
  },
  placeholderText: {
    marginLeft: 14,
    fontSize: 14,
    color: '#999',
  },
  findButton: {
    height: 48,
    backgroundColor: '#0B3D66',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  findButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  menuButton: {
    width: '23%',
    height: 96,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText:{},
 iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  menuText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  sectionHeader: {},

 sectionTitle:{
   marginBottom: 10,
 },
 tripCard:{
   backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,

 },
 routeBox:{
   width: 45,
    height: 48,
    backgroundColor: '#0B3D66',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
 },
 routeText:{
  color: '#fff',
    fontSize: 10,
 },
 routeNumber:{
  color: '#fff',
    fontSize: 18,
    fontWeight: '700',
 },
 tripInfo:{
   flex: 1,
    marginLeft: 12,
 },
 destinationText:{
   fontSize: 14,
    color: '#333',
    marginBottom: 5,
 },
 timeRow:{
  flexDirection: 'row',
    alignItems: 'center',
 },
 timeText:{
  marginLeft: 5,
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
 },
 arrivalSection:{
      alignItems: 'flex-end',

 },
 arrivingBox:{
  backgroundColor: '#E8FFF0',
    borderWidth: 1,
    borderColor: '#43D17B',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 7,

 },
 arrivingText:{
  color: '#168844',
    fontSize: 12,
    fontWeight: '600',
 },
 minutesText:{
  marginTop: 7,
    fontSize: 12,
    color: '#444',
 },
 nearbyHeader:{
  flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
 },
 viewMap:{
  fontSize: 12,
    color: '#0B3D66',
    fontWeight: '600',
 },
 stopCard:{
  backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
 },
 stopNameRow:{
   flexDirection: 'row',
    alignItems: 'center',
 },
 stopName:{
   marginLeft: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#1D2B3C',
 },
detailsRow:{
   flexDirection: 'row',
    marginTop: 8,
    marginLeft: 27,
},
detailItem:{
  flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
},
detailText:{
   marginLeft: 4,
    fontSize: 12,
    color: '#555',
},
availableText:{
   fontSize: 12,
    color: '#444',
    marginTop: 18,
    marginBottom: 8,
},
busRow:{
      flexDirection: 'row',

},
busNumber:{
  backgroundColor: '#DCE8FA',
    borderWidth: 1,
    borderColor: '#b0b2ad',
    paddingHorizontal: 14,
    borderRadius: 15,
    marginRight: 7,

},
busText:{
  fontSize: 12,
color: '#26313F',
},

})
