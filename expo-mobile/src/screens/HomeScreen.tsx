import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone, Battery, Plug, Camera, Speaker, Droplets, Bell, Search } from 'lucide-react-native';
import Card from '../components/Card';
import { popularServices, repairs, CUSTOMER_NAME } from '../lib/data';
import { HomeTabScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }: HomeTabScreenProps<'Home'>) {
  const { theme, isDark } = useTheme();

  const iconMap: Record<string, React.ReactNode> = {
    smartphone: <Smartphone size={28} color={theme.primary} />,
    battery: <Battery size={28} color={theme.primary} />,
    plug: <Plug size={28} color={theme.primary} />,
    camera: <Camera size={28} color={theme.primary} />,
    speaker: <Speaker size={28} color={theme.primary} />,
    droplets: <Droplets size={28} color={theme.primary} />,
  };

  // Use the first active repair for the "My Current Repair" section
  const currentRepair = repairs.find(r => r.status !== 'Completed' && r.status !== 'Cancelled');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Hello, {CUSTOMER_NAME.split(' ')[0]} 👋</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>How can we help your phone today?</Text>
          </View>
          <TouchableOpacity style={[styles.bellButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <Bell size={22} color={theme.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <Search size={20} color={theme.textMuted} style={styles.searchIcon} />
          <TextInput 
            style={[styles.searchInput, { color: theme.text }]} 
            placeholder="Search repair services..." 
            placeholderTextColor={theme.textMuted}
          />
        </View>

        {/* Popular Services */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular Services</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularScroll}>
            {popularServices.map((service, index) => {
              const parts = service.name.split(' ');
              const line1 = parts[0];
              const line2 = parts.slice(1).join(' ');

              return (
                <TouchableOpacity 
                  key={service.id} 
                  onPress={() => navigation.navigate('Book')}
                  activeOpacity={0.7}
                >
                  <Card style={[styles.popularCard, index === 0 && { marginLeft: 0 }]}>
                    <View style={[styles.iconWrapper, { backgroundColor: theme.primarySoft }]}>
                      {iconMap[service.icon]}
                    </View>
                    <Text style={[styles.popularName, { color: theme.text }]}>
                      {line1}{'\n'}{line2}
                    </Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* My Current Repair */}
        {currentRepair && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>My Current Repair</Text>
            <Card style={styles.repairCard}>
              <View style={styles.repairHeaderRow}>
                <Text style={[styles.repairId, { color: theme.primary }]}>{currentRepair.id}</Text>
                <View style={[styles.repairingBadge, { backgroundColor: theme.primarySoft }]}>
                  <Text style={[styles.repairingBadgeText, { color: theme.primary }]}>{currentRepair.status}</Text>
                </View>
              </View>
              
              <Text style={[styles.repairDeviceService, { color: theme.text }]}>
                {currentRepair.device} · {currentRepair.service}
              </Text>

              <View style={styles.progressRow}>
                <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Repair progress</Text>
                <Text style={[styles.progressValue, { color: theme.text }]}>60%</Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: theme.divider }]}>
                <View style={[styles.progressBarFill, { width: '60%', backgroundColor: theme.primary }]} />
              </View>

              <TouchableOpacity 
                style={[styles.trackButton, { backgroundColor: theme.primarySoft }]}
                onPress={() => navigation.navigate('RepairDetails', { repairId: currentRepair.id })}
                activeOpacity={0.8}
              >
                <Text style={[styles.trackButtonText, { color: theme.primary }]}>Track Repair</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Browse Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Browse Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Book')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Book')}>
            <Card style={styles.browseCard}>
              <View style={[styles.iconWrapper, { backgroundColor: theme.primarySoft, marginBottom: 0, marginRight: 16 }]}>
                {iconMap['smartphone']}
              </View>
              <View>
                <Text style={[styles.browseTitle, { color: theme.text }]}>Screen Replacement</Text>
                <Text style={[styles.browseSubtitle, { color: theme.textSecondary }]}>Original & Aftermarket</Text>
              </View>
            </Card>
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
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 8,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    maxWidth: '90%',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  popularScroll: {
    paddingRight: 16,
  },
  popularCard: {
    width: 110,
    height: 130,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 20,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  popularName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  repairCard: {
    padding: 16,
    borderRadius: 20,
  },
  repairHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  repairId: {
    fontSize: 14,
    fontWeight: '700',
  },
  repairingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  repairingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  repairDeviceService: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    marginBottom: 18,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  trackButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  trackButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  browseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
  },
  browseTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  browseSubtitle: {
    fontSize: 14,
  },
});
