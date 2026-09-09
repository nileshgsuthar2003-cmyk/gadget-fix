import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, User, Plus, ShoppingBag } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

import { RootStackParamList, RootTabParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import BookScreen from '../screens/BookScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RepairScreen from '../screens/RepairScreen';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MyRepairsScreen from '../screens/MyRepairsScreen';
import BuyPhonesScreen from '../screens/BuyPhonesScreen';
import SellPhoneScreen from '../screens/SellPhoneScreen';
import AdminAddPhoneScreen from '../screens/AdminAddPhoneScreen';
import AdminBuyRequestsScreen from '../screens/AdminBuyRequestsScreen';
import PhoneDetailsScreen from '../screens/PhoneDetailsScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.cardBorder,
          height: 56 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="BuyPhones" 
        component={BuyPhonesScreen} 
        options={{
          tabBarLabel: 'Buy Phones',
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Book" 
        component={BookScreen} 
        options={{
          tabBarLabel: 'Book Repair',
          tabBarIcon: ({ color, size }) => <Plus color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isDark, theme } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.cardBorder,
      primary: theme.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen 
          name="MyRepairs" 
          component={MyRepairsScreen} 
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="RepairDetails" 
          component={RepairScreen} 
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="BuyPhones" 
          component={BuyPhonesScreen} 
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="SellPhone" 
          component={SellPhoneScreen} 
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="PhoneDetails" 
          component={PhoneDetailsScreen} 
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="AdminAddPhone" 
          component={AdminAddPhoneScreen} 
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="AdminBuyRequests" 
          component={AdminBuyRequestsScreen} 
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Terms" 
          component={TermsScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Privacy" 
          component={PrivacyScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
