import { View, Text, StyleSheet,Image, } from 'react-native'
import React from 'react'

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Image source={require('../assets/BusImage/logo.png')} style={styles.logoImage} />
            <View style={styles.textAccount}>
              <Text style={styles.textName}>Create Account</Text>
              <Text style={styles.shortText}>Join TEGA Bus Rwanda For Smarter, Better Travel</Text>

            </View>
        </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#fff',
    padding:50
  },
  header:{
    alignItems:'center',
    justifyContent:'center'

  },
  logoImage:{
    width:120,
    height:120,
    borderRadius:20

  },
  textAccount:{
    alignItems:'center'

  },
  textName:{
    fontSize:30,
    fontWeight:"bold"

  },
  shortText:{
    

  }
})

