import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { Wrench } from 'lucide-react-native';
import { RootStackScreenProps } from '../navigation/types';

export default function SplashScreen({ navigation }: RootStackScreenProps<'Splash'>) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(600 - delay),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);

    const timer = setTimeout(() => {
      // Simulate splash screen delay then go to Login
      navigation.replace('Login');
    }, 2500); // slightly longer so they can see the animation

    return () => clearTimeout(timer);
  }, [navigation, dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/icon.png')} 
        style={{ width: 120, height: 120, borderRadius: 28, marginBottom: 24, resizeMode: 'cover' }} 
      />
      <Text style={styles.title}>Cell Care</Text>
      <Text style={styles.subtitle}>Fast. Reliable. Trusted Mobile Repair.</Text>
      
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 48,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  }
});
