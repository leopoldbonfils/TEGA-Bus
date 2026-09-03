import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react';
import { Checkbox } from 'expo-checkbox';
import React from 'react'
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { registerUser } from '../services/authService';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked]=useState(false);
  const [showPassword,setShowPassword]= useState(false);
  const [loading, setLoading]= useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '1088153516882-jub92ho1phia1ombjlpio105hoda5fou.apps.googleusercontent.com',
    androidClientId: '1088153516882-h79vhjmlrd87enpbg0kbkvvi2tcv2dr4.apps.googleusercontent.com',
  });


  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchGoogleUser(authentication.accessToken);
      }
    }
  }, [response]);

  const fetchGoogleUser = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      Toast.show({
        type: 'success',
        text1: 'Google Sign-In',
        text2: `Welcome ${user.name || user.email}!`,
        position: 'top',
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Google Sign-In Error',
        text2: error.message || 'Failed to fetch Google profile',
        position: 'top',
      });
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({
          type: 'error',
          text1: 'Not Available',
          text2: 'Apple Sign-In is only available on iOS devices',
          position: 'top',
        });
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      Toast.show({
        type: 'success',
        text1: 'Apple Sign-In',
        text2: 'Welcome to TEGA Bus!',
        position: 'top',
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Toast.show({
          type: 'error',
          text1: 'Apple Sign-In Failed',
          text2: e.message || 'Authentication failed',
          position: 'top',
        });
      }
    }
  };


  const handleRegister= async ()=>{
  
    if(!name.trim()){
      Toast.show({
        type:'error',
        text1:'Full name is required',
        text2:'Please enter your full name',
        position:'top'
        
      })
      return;
    }
    if(!email.trim()){
      Toast.show({
        type:'error',
        text1:'Email is required',
        text2:'Please enter your email',
        position:'top',
      })
      return;
    }
    if(!phone.trim()){
      Toast.show({
        type:'error',
        text1:'Phone number is required',
        text2:'Please enter your phone number',
        position:'top', 
      })
      return;
    }
    if(!password.trim()){
      Toast.show({
        type:'error',
        text1:'Password is required',
        text2:'Please enter your password',
        position:'top',
      })
      return;
    }

    if (!isChecked){
      Toast.show({
        type:'error',
        text1:'Terms and conditions',
        text2:'Please agree to the terms and conditions',
        position:'top',
      })
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Password is too short',
        text2: 'Password must be at least 8 characters',
        position: 'top',
      });
      return;
    }
    if (!/[A-Z]/.test(password)){
      Toast.show({
        type:'error',
        text1:'Password is too short',
        text2:'Password must contain at least one uppercase letter',
        position:'top',
      })
      return;
    }
    if (!/[a-z]/.test(password)){
      Toast.show({
        type:'error',
        text1:'Password is too short',
        text2:'Password must contain at least one lowercase letter',
        position:'top',
      })
      return;
    }
    if (!/[0-9]/.test(password)){
      Toast.show({
        type:'error',
        text1:'Password is too short',
        text2:'Password must contain at least one number',
        position:'top',
      })
      return;
    }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)){
      Toast.show({
        type:'error',
        text1:'Invalid email',
        text2:'Please enter a valid email',
        position:'top',
      })
      return;
    }

    setLoading(true);

    try{
      await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password: password,
          
      });
      Toast.show({
        type:'success',
        text1:'Registration successful',
        text2:'Account created successfully',
        position:'top',
      });
      setTimeout(()=>{
        router.replace('/login')
      },1200);
      
        
    }catch(error:any){
      Toast.show({
        type:'error',
        text1:'Registration failed',
        text2:error.message || 'Failed to create account',
        position:'top',
      });

    }finally{
      setLoading(false);
    }


  }

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
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Enter Full Names' value={name} onChangeText={setName} />
        </View>

        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} autoCapitalize="none" />
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
        </View>
        
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputWrapper}>
          <Feather name="phone" size={20} color="#999" style={styles.inputIcon} />
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder='Enter Phone Number' value={phone} onChangeText={setPhone} />

        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder="Enter your password, 8+ chars, 1 uppercase, 1 number, 1 special character" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#999" />
          </TouchableOpacity>
        </View>
        
      </View>

      <View style={styles.termRow}>
        <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setIsChecked} color={isChecked ? '#007AFF' : undefined} />
        <Text>I agree to the term & Condition</Text>
      </View>

      <TouchableOpacity style={[styles.registerBtn, loading && styles.btnDisabled]} disabled={loading} onPress={handleRegister}>
        { loading ? (
        <ActivityIndicator color="#fff" />
        ):(
        <Text style={styles.btn}>Register</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton} onPress={() => promptAsync()} activeOpacity={0.7}>
          <Image source={require('../assets/BusImage/google.png')} style={styles.googleImage}/>
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn} activeOpacity={0.7}>
          <Ionicons name="logo-apple" size={18} color="#000" />
          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.footerText}>Already have an account? <Text style={styles.linkText}>Login</Text></Text>
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
  btnDisabled:{
    opacity:0.7,
  },
});