import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar,} from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor='#06407F' translucent={false} />

        <Image source={require('../assets/BusImage/logo.png')} style={styles.logoImage} resizeMode="contain"/>
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
