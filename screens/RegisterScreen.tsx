import { View, Text, StyleSheet,Image, TextInput, TouchableOpacity, } from 'react-native'
import { useState } from 'react';
import React from 'react'

export default function RegisterScreen() {
   const [isChecked, setChecked] = useState(false);

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Image source={require('../assets/BusImage/logo.png')} style={styles.logoImage} />
            <View style={styles.textAccount}>
              <Text style={styles.textName}>Create Account</Text>
              <Text style={styles.shortText}>Join TEGA Bus Rwanda For Smarter, Better Travel</Text>

            </View>
        </View>
        <View style={styles.form}>
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Full Names'/>
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Email ' />
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Phone Number'/>
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Password' />

        </View>

        <View style={styles.termRow}>
          <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} />
          <Text>l agree to the term & Condition</Text>
        </View>

        <TouchableOpacity style={styles.registerBtn}>
          <Text style={styles.btn}>Register</Text>
        </TouchableOpacity>

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
    alignItems:'center',
    marginBottom:30,
    marginTop:10

  },
  textName:{
    fontSize:30,
    fontWeight:"bold",
    marginBottom:10

  },
  shortText:{
    

  },
  form:{
    width:'100%',
    height:'60%',
    gap:10
   
    
    

  },
  textField:{
    borderRadius:7,
    height:'15%',
    width:'95%',
    borderWidth:1,
    padding:4

    

  }

})

