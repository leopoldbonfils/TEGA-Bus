import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useState } from 'react';
import { Checkbox } from 'expo-checkbox';
import React from 'react'
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }: any) {
  const [isChecked, setChecked] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      <View style={styles.header}>
        <Image source={require('../assets/BusImage/logo.png')} style={styles.logoImage} />
        <Text style={styles.textAccount}>Create Account</Text>
        <Text style={styles.textName}>Join TEGA Bus Rwanda for smarter, better travel.</Text>
      </View>

      <View style={styles.form}>
        <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Full Names' />
        <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Email' />
        <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Phone Number' />
        <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Password' />
      </View>

      <View style={styles.termRow}>
        <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} />
        <Text>I agree to the term & Condition</Text>
      </View>

      <TouchableOpacity style={styles.registerBtn}>
        <Text style={styles.btn}>Register</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={18} color="#DB4437" />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-apple" size={18} color="#000" />
          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
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
    marginBottom: 7,
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
  textField: {
    borderRadius: 10,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 14,
    fontSize: 14,
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
});