import React, { useRef, useEffect } from 'react';
import { Animated, View, Text, StyleSheet, Image, StatusBar,} from 'react-native';
import {router} from 'expo-router';
export default function SplashScreen() {
 const fadeAmin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAmin, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();


    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor='#06407F' translucent={false} />

       <Animated.View style={[styles.logoContainer, {opacity: fadeAmin}]}>
        <Image source={require('../assets/BusImage/logo.png')} style={styles.logoImage} resizeMode="contain"/>
       </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06407F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});
