import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Smartphone, Battery, Plug, Camera, Speaker, Droplets, Bell, Search,
  ShoppingBag, Zap, Sparkles, ArrowRight, ShieldCheck, Wrench, Cpu 
} from 'lucide-react-native';
import Card from '../components/Card';
import { popularServices as fallbackServices, repairs as fallbackRepairs, CUSTOMER_NAME, inr } from '../lib/data';
import { api, ApiRepair } from '../lib/api';
import { HomeTabScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }: HomeTabScreenProps<'Home'>) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const greetingName = user?.first_name || CUSTOMER_NAME.split(' ')[0];

  const [liveServices, setLiveServices] = useState<any[]>([]);
  const [liveRepairs, setLiveRepairs] = useState<ApiRepair[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = async () => {
    try {
      const [servicesRes, repairsRes] = await Promise.allSettled([
        api.getServices(),
        api.getMyRepairs(),
      ]);

      if (servicesRes.status === 'fulfilled' && servicesRes.value?.services?.length > 0) {
        setLiveServices(servicesRes.value.services);
      } else {
        setLiveServices(fallbackServices as any);
      }

      if (repairsRes.status === 'fulfilled' && Array.isArray(repairsRes.value?.repairs) && repairsRes.value.repairs.length > 0) {
        setLiveRepairs(repairsRes.value.repairs);
      } else {
        setLiveRepairs(fallbackRepairs as any);
      }
    } catch (err) {
      setLiveServices(fallbackServices as any);
      setLiveRepairs(fallbackRepairs as any);
    } finally {
      setLoadingServices(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh every time the Home tab is focused / opened
  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [])
  );

  // Pull down to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHomeData();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'smartphone': return <Smartphone size={26} color={theme.primary} />;
      case 'battery': return <Battery size={26} color={theme.primary} />;
      case 'plug': return <Plug size={26} color={theme.primary} />;
      case 'camera': return <Camera size={26} color={theme.primary} />;
      case 'speaker': return <Speaker size={26} color={theme.primary} />;
      case 'droplets': return <Droplets size={26} color={theme.primary} />;
      case 'cpu': return <Cpu size={26} color={theme.primary} />;
      default: return <Wrench size={26} color={theme.primary} />;
    }
  };

  const currentRepair = (liveRepairs.length > 0 ? liveRepairs : fallbackRepairs).find(
    r => r.status !== 'Completed' && r.status !== 'Cancelled'
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Hello, {greetingName} 👋</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>How can we help your phone today?</Text>
          </View>
          <TouchableOpacity style={[styles.bellButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <Bell size={22} color={theme.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
          onPress={() => navigation.navigate('Book')}
          activeOpacity={0.8}
        >
          <Search size={20} color={theme.textMuted} style={styles.searchIcon} />
          <Text style={[styles.searchPlaceholder, { color: theme.textMuted }]}>
            Search repair services, brands, models...
          </Text>
        </TouchableOpacity>

        {/* Buy & Sell Quick Action Cards */}
        <View style={styles.marketplaceSection}>
          <View style={styles.marketplaceGrid}>
            {/* Buy Card */}
            <TouchableOpacity 
              style={[styles.marketplaceCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
              onPress={() => (navigation as any).navigate('BuyPhones')}
              activeOpacity={0.8}
            >
              <View style={[styles.marketIconBox, { backgroundColor: theme.primarySoft }]}>
                <ShoppingBag size={22} color={theme.primary} />
              </View>
              <View style={[styles.marketBadge, { backgroundColor: isDark ? '#1e1b4b' : '#dcfce7' }]}>
                <Text style={[styles.marketBadgeText, { color: isDark ? '#a5b4fc' : '#166534' }]}>Up to 50% Off</Text>
              </View>
              <Text style={[styles.marketTitle, { color: theme.text }]}>Buy Refurbished</Text>
              <Text style={[styles.marketSubtitle, { color: theme.textSecondary }]}>
                Certified with 6M warranty
              </Text>
              <View style={styles.marketActionRow}>
                <Text style={[styles.marketActionText, { color: theme.primary }]}>Shop Now</Text>
                <ArrowRight size={14} color={theme.primary} />
              </View>
            </TouchableOpacity>

            {/* Sell Card */}
            <TouchableOpacity 
              style={[styles.marketplaceCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
              onPress={() => (navigation as any).navigate('SellPhone')}
              activeOpacity={0.8}
            >
              <View style={[styles.marketIconBox, { backgroundColor: isDark ? '#451a03' : '#fef3c7' }]}>
                <Zap size={22} color="#d97706" />
              </View>
              <View style={[styles.marketBadge, { backgroundColor: isDark ? '#451a03' : '#fef3c7' }]}>
                <Text style={[styles.marketBadgeText, { color: '#d97706' }]}>Instant Cash</Text>
              </View>
              <Text style={[styles.marketTitle, { color: theme.text }]}>Sell Old Phone</Text>
              <Text style={[styles.marketSubtitle, { color: theme.textSecondary }]}>
                Free doorstep evaluation
              </Text>
              <View style={styles.marketActionRow}>
                <Text style={[styles.marketActionText, { color: '#d97706' }]}>Get Quote</Text>
                <ArrowRight size={14} color="#d97706" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Services — Dynamic from MySQL */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular Repair Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Book')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>Book Now →</Text>
            </TouchableOpacity>
          </View>

          {loadingServices ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularScroll}>
              {liveServices.map((service, index) => {
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
                        {getIcon(service.icon)}
                      </View>
                      <Text style={[styles.popularName, { color: theme.text }]}>
                        {line1}{'\n'}{line2}
                      </Text>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
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
                onPress={() => (navigation as any).navigate('RepairDetails', { repairId: currentRepair.id })}
                activeOpacity={0.8}
              >
                <Text style={[styles.trackButtonText, { color: theme.primary }]}>Track Repair</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}



      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: { fontSize: 13, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  bellButton: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284c7',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  searchIcon: { marginRight: 8 },
  searchPlaceholder: { fontSize: 13 },
  marketplaceSection: { marginBottom: 20 },
  marketplaceGrid: { flexDirection: 'row', gap: 12 },
  marketplaceCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  marketIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  marketBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  marketBadgeText: { fontSize: 10, fontWeight: '800' },
  marketTitle: { fontSize: 14, fontWeight: '800' },
  marketSubtitle: { fontSize: 11, marginTop: 2, marginBottom: 8 },
  marketActionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  marketActionText: { fontSize: 12, fontWeight: '800' },
  section: { marginBottom: 24 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  seeAllText: { fontSize: 13, fontWeight: '700' },
  popularScroll: { paddingRight: 16 },
  popularCard: {
    width: 108,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginLeft: 10,
    overflow: 'hidden',
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  popularName: { fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 15 },
  repairCard: { padding: 16, borderRadius: 18, overflow: 'hidden' },
  repairHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  repairId: { fontSize: 12, fontWeight: '800' },
  repairingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  repairingBadgeText: { fontSize: 11, fontWeight: '800' },
  repairDeviceService: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12 },
  progressValue: { fontSize: 12, fontWeight: '700' },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 14 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  trackButton: { paddingVertical: 10, borderRadius: 12, alignItems: 'center', overflow: 'hidden' },
  trackButtonText: { fontSize: 13, fontWeight: '800' },
});
