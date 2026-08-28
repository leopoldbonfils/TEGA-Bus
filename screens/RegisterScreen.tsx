import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useState } from 'react';
import { Checkbox } from 'expo-checkbox';
import React from 'react'
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [isChecked, setChecked] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      <View style={styles.header}>
        <Image source={require('../assets/BusImage/logo.png')} style={styles.logoImage} />
        <Text style={styles.textAccount}>Create Account</Text>
        <Text style={styles.textName}>Join TEGA Bus Rwanda for smarter, better travel.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}> Full Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Enter Full Names' />
        </View>

        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" />
        </View>
        
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputWrapper}>
          <Feather name="phone" size={20} color="#999" style={styles.inputIcon} />
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Enter Phone Number' />

        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder="Enter your password" secureTextEntry={true} />
          <TouchableOpacity style={styles.eyeIcon}>
            <Ionicons name="eye-off-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        
      </View>

      <View style={styles.termRow}>
        <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} />
        <Text>I agree to the term & Condition</Text>
      </View>

      <TouchableOpacity style={styles.registerBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.btn}>Register</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton}>
          <Image source={require('../assets/BusImage/google.png')} style={styles.googleImage}/>
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-apple" size={18} color="#000" />
          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.footerText}>
          Already have an account? <Text style={styles.linkText}>Login</Text>
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FA',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: '20%',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 18,
    marginBottom: 16,
  },
  textAccount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0B3D66',
    marginBottom: 6,
  },
  textName: {
    fontSize: 13,
    color: '#666',
  },
  form: {
    gap: 12,
    marginBottom: 16,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
    marginTop: 6,
  },
  checkbox: {},
  registerBtn: {
    backgroundColor: '#0B3D66',
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  btn: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 1,
    marginTop: 5,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 50,
  },

  inputIcon: {
    marginRight: 10,
  },

  textField: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },

  eyeIcon: {
    paddingLeft: 8,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 11,
    color: '#999',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#333',
  },
  linkText: {
    color: '#0B3D66',
    fontWeight: '600',
  },
   googleImage:{
    width:18,
    height:18
  },
});