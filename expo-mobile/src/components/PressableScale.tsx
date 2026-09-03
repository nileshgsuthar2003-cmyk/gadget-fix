import React, { useRef } from 'react';
import { Animated, Pressable, ViewStyle, StyleProp, GestureResponderEvent } from 'react-native';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  activeScale?: number;
}

export default function PressableScale({
  children,
  onPress,
  style,
  disabled = false,
  activeScale = 0.96,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: activeScale,
        useNativeDriver: true,
        speed: 40,
        bounciness: 4,
      }),
      Animated.timing(opacity, {
        toValue: 0.8,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      android_disableSound={false}
    >
      <Animated.View style={[{ transform: [{ scale }], opacity, overflow: 'hidden' }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
