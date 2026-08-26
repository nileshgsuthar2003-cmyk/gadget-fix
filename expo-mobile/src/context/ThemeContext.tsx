import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  primaryDark: string;
  inputBg: string;
  inputBorder: string;
  divider: string;
  badgeBg: string;
  badgeText: string;
}

export const lightTheme: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  primary: '#4f46e5',
  primarySoft: '#eef2ff',
  primaryDark: '#3730a3',
  inputBg: '#ffffff',
  inputBorder: '#cbd5e1',
  divider: '#f1f5f9',
  badgeBg: '#eef2ff',
  badgeText: '#4f46e5',
};

export const darkTheme: ThemeColors = {
  background: '#0f172a',
  surface: '#1e293b',
  card: '#1e293b',
  cardBorder: '#334155',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  primary: '#6366f1',
  primarySoft: '#1e1b4b',
  primaryDark: '#4338ca',
  inputBg: '#0f172a',
  inputBorder: '#334155',
  divider: '#334155',
  badgeBg: '#1e1b4b',
  badgeText: '#818cf8',
};

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeColors;
  toggleTheme: () => void;
  setDarkMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  theme: lightTheme,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(systemColorScheme === 'dark');

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const setDarkMode = (enabled: boolean) => {
    setIsDark(enabled);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setDarkMode }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
