import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const slides=[
  {
    id: '1',
    title: 'Find Your Route',
    description: 'Search destinations easily across Kigali and beyond with precise tracking.',
    image: require('../assets/BusImage/onboard1.jpg'),
    buttonText: 'NEXT',
    showArrow: true,
  },

  {
    id: '2',
    title: 'Track Your Bus',
    description: 'See exactly where your bus is and get accurate arrival times.',
    image: require('../assets/BusImage/onBoard2.png'),
    buttonText: 'Next',
    showArrow: true,
  },

  {
    id: '3',
    title: 'Travel With Confidence',
    description: 'Know your fare and route details before you even step outside.',
    image: require('../assets/BusImage/onboard3.jpg'),
    buttonText: 'GET STARTED',
    showArrow: true,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  const currentSlide = slides[currentIndex];
  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.contentWrapper, { paddingBottom: Math.max(insets.bottom, 16) + 20 }]}>

        <View style={styles.imageCardContainer}>
          <View style={styles.imageCard}>
            <Image source={currentSlide.image} style={styles.image} resizeMode="cover"/>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </View>

        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View key={index} style={[styles.dot, currentIndex === index ? styles.activeDot : styles.inactiveDot,]}/>
          ))}
        </View>

        <View style={styles.bottomArea}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.buttonText}>{currentSlide.buttonText}</Text>
            {currentSlide.showArrow && (
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }}/>
            )}
          </TouchableOpacity>

          {!isLastSlide && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>SKIP</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    justifyContent: 'space-between',
  },
  imageCardContainer: {
    width: '100%',
    height: Math.min(width * 0.78, height * 0.38),
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCard: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E0EAF6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#062347',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#5A6B82',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 28,
    backgroundColor: '#062347',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#D1DCE8',
  },
  bottomArea: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#062347',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#062347',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  skipButton: {
    marginTop: 14,
    padding: 6,
  },
  skipText: {
    color: '#8A99AD',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
