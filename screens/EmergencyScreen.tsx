import { View, Text, StyleSheet, Image, ScrollView } from 'react-native'
import React from 'react'
import FontAwesome6 from '@expo/vector-icons/build/FontAwesome6'
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import Entypo from '@expo/vector-icons/build/Entypo'

export default function EmergencyScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image source={require('../assets/BusImage/sos.jpg')}  style={styles.sosImage}/>
          <Text style={styles.emergencyText}>Press and hold to immediately alert emergency services and your trusted contacts.</Text>
        </View>

      <View style={styles.emergencyButton}>
        <Text style={styles.emergencyText2}>What is your Emergency?</Text>
        <View style={styles.emergencychoices}>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyMedical}>
              <View style={styles.emergencyIcon}>
                <FontAwesome6 name="square-plus" size={24} />
              </View>
              <Text style={styles.emergencyCardText}>Medical</Text>
            </View>

            <View style={styles.emergencySecurity}>
              <View style={styles.emergencyIcon}>
                <Entypo name="shield" size={24} />
                
              </View>
              <Text style={styles.emergencyCardText}>Security</Text>
            </View>

            <View style={styles.emergencyFire}>
              <View style={styles.emergencyIcon}>
                <MaterialIcons name="fire-truck" size={24} />
              </View>
              <Text style={styles.emergencyCardText}>Fire</Text>
            </View>

            <View style={styles.emergencyAccident}>
              <View style={styles.emergencyIcon}>
                <MaterialIcons name="car-crash" size={24} />
                
              </View>
              <Text style={styles.emergencyCardText}>Accident</Text>
            </View>
          </View>

        </View>

        <View style={styles.Dangerlocation}>
          <Image source={require('../assets/BusImage/MapLocation.png')}  style={styles.MapImage}/>  
          <View ></View>
        </View>
      </View>

      </ScrollView>
      
        

    </View>
      
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFDAD6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosImage: {
    width: 180,
    height: 180,
    marginTop: 20,
  },

  emergencyButton: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,


  },
  emergencyText: {
    padding: 10,
    margin:10,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    color:'#93000A'


  },
  emergencyText2: {
    padding: 10,
    margin:10,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
  },
  emergencychoices:{

  },
  emergencyCard: {},
  emergencyMedical: {},
  emergencySecurity: {},
  emergencyFire: {},
  emergencyAccident: {},
  emergencyIcon: {},
  emergencyCardText: {},
  Dangerlocation: {},
  MapImage: {}
})