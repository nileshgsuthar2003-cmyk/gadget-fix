import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, style }: CardProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: theme.card, 
        borderColor: theme.cardBorder,
        shadowOpacity: isDark ? 0 : 0.05,
      }, 
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
