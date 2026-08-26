import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  User,
  Wrench,
  ClipboardList,
  Moon,
  Sun,
} from 'lucide-react-native';
import Card from '../components/Card';
import { adminCustomers, CUSTOMER_NAME, inr } from '../lib/data';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme, isDark, toggleTheme } = useTheme();

  const customer = adminCustomers.find((c) => c.name === CUSTOMER_NAME) || {
    name: CUSTOMER_NAME,
    phone: "+91 98765 43210",
    repairs: 4,
    spent: 23496,
  };

  const menuItems = [
    { label: "Personal Information", icon: User, action: () => Alert.alert("Personal Information", "View & edit profile info") },
    { label: "My Repairs", icon: ClipboardList, action: () => (navigation as any).navigate('Tabs', { screen: 'MyRepairs' }) },
    { label: "Saved Addresses", icon: MapPin, action: () => Alert.alert("Saved Addresses", "Manage your pickup addresses") },
    { label: "Help & Support", icon: HelpCircle, action: () => Alert.alert("Help & Support", "Contact our customer support team") },
    { label: "Settings", icon: Settings, action: () => Alert.alert("Settings", "App preferences & notifications") },
  ];

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of Fixly?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{customer.name.charAt(0)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>{customer.name}</Text>
            <Text style={[styles.userPhone, { color: theme.textSecondary }]}>{customer.phone}</Text>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconBox, { backgroundColor: theme.primarySoft }]}>
                <Wrench size={16} color={theme.primary} />
              </View>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Repairs</Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{customer.repairs}</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconBox, { backgroundColor: theme.primarySoft }]}>
                <CreditCard size={16} color={theme.primary} />
              </View>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Amount Spent</Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{inr(customer.spent)}</Text>
          </Card>
        </View>

        {/* Preferences / Dark Mode Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>
          <View style={[styles.menuContainer, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                {isDark ? (
                  <Moon size={18} color="#818cf8" />
                ) : (
                  <Sun size={18} color="#f59e0b" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: theme.text }]}>Dark Mode</Text>
                <Text style={[styles.menuSubLabel, { color: theme.textSecondary }]}>
                  {isDark ? 'Dark theme active' : 'Light theme active'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#cbd5e1', true: theme.primary }}
                thumbColor={isDark ? '#ffffff' : '#ffffff'}
              />
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
          <View style={[styles.menuContainer, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider }
                ]}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                  <item.icon size={18} color={theme.textSecondary} />
                </View>
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.logoutIconContainer}>
              <LogOut size={18} color="#ef4444" />
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    marginVertical: 0,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  menuContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutContainer: {
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  logoutIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logoutText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
});
