import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Image, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Smartphone, Battery, Plug, Camera, Speaker, Droplets, Bell, Search,
  ShoppingBag, Zap, Sparkles, ArrowRight, ShieldCheck, Wrench, Cpu, Megaphone,
  Settings, ClipboardList
} from 'lucide-react-native';
import Card from '../components/Card';
import { inr } from '../lib/data';
import { api, ApiBanner, API_BASE_URL } from '../lib/api';
import { HomeTabScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen({ navigation }: HomeTabScreenProps<'Home'>) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const greetingName = user?.first_name || (user?.name ? user.name.split(' ')[0] : 'there');

  const [liveServices, setLiveServices] = useState<any[]>([]);
  const [liveBanners, setLiveBanners] = useState<ApiBanner[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = async () => {
    try {
      const [servicesRes, bannersRes] = await Promise.allSettled([
        api.getServices(),
        api.getBanners(),
      ]);

      if (servicesRes.status === 'fulfilled' && Array.isArray(servicesRes.value?.services)) {
        setLiveServices(servicesRes.value.services);
      } else {
        setLiveServices([]);
      }

      if (bannersRes.status === 'fulfilled' && Array.isArray(bannersRes.value?.banners)) {
        setLiveBanners(bannersRes.value.banners);
      } else {
        setLiveBanners([]);
      }
    } catch (err) {
      setLiveServices([]);
      setLiveBanners([]);
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

        {/* Dynamic Advertisement Banners Carousel Under Search Bar */}
        {liveBanners.length > 0 && (
          <View style={styles.bannerSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bannerScroll}
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH - 32}
              snapToAlignment="center"
            >
              {liveBanners.map((b) => {
                const getBannerBg = (grad?: string) => {
                  switch (grad) {
                    case 'purple': return isDark ? '#4c1d95' : '#7c3aed';
                    case 'emerald': return isDark ? '#064e3b' : '#059669';
                    case 'amber': return isDark ? '#78350f' : '#d97706';
                    case 'dark': return '#0f172a';
                    default: return isDark ? '#1e3a8a' : '#2563eb';
                  }
                };

                const handleBannerPress = () => {
                  if (b.link_type === 'sell') {
                    (navigation as any).navigate('SellPhone');
                  } else if (b.link_type === 'buy') {
                    (navigation as any).navigate('BuyPhones');
                  } else {
                    navigation.navigate('Book');
                  }
                };

                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.bannerCard, { backgroundColor: getBannerBg(b.bg_gradient) }]}
                    onPress={handleBannerPress}
                    activeOpacity={0.88}
                  >
                    <View style={styles.bannerContent}>
                      {b.badge_text ? (
                        <View style={styles.bannerBadge}>
                          <Text style={styles.bannerBadgeText}>{b.badge_text}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.bannerTitle} numberOfLines={2}>{b.title}</Text>
                      {b.subtitle ? (
                        <Text style={styles.bannerSubtitle} numberOfLines={2}>{b.subtitle}</Text>
                      ) : null}
                      <View style={styles.bannerCta}>
                        <Text style={styles.bannerCtaText}>
                          {b.link_type === 'sell' ? 'Sell Phone' : b.link_type === 'buy' ? 'Shop Phones' : 'Book Repair'}
                        </Text>
                        <ArrowRight size={12} color="#0f172a" />
                      </View>
                    </View>

                    {b.image_url ? (
                      <View style={styles.bannerImageBox}>
                        <Image
                          source={{ uri: b.image_url.startsWith('http') ? b.image_url : `${API_BASE_URL.replace('/api', '')}${b.image_url}` }}
                          style={styles.bannerImage}
                          resizeMode="cover"
                        />
                      </View>
                    ) : (
                      <View style={styles.bannerIconBox}>
                        <Sparkles size={28} color="rgba(255,255,255,0.9)" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

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
  bannerSection: { marginBottom: 20 },
  bannerScroll: { paddingRight: 16 },
  bannerCard: {
    width: SCREEN_WIDTH - 32,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerContent: { flex: 1, paddingRight: 12, zIndex: 2 },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    marginBottom: 6,
  },
  bannerBadgeText: { fontSize: 9, fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.5 },
  bannerTitle: { fontSize: 15, fontWeight: '900', color: '#ffffff', lineHeight: 19 },
  bannerSubtitle: { fontSize: 11, color: 'rgba(255, 255, 255, 0.85)', marginTop: 3, lineHeight: 15 },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    marginTop: 8,
    gap: 4,
  },
  bannerCtaText: { fontSize: 11, fontWeight: '800', color: '#0f172a' },
  bannerImageBox: {
    width: 68,
    height: 68,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginLeft: 10,
  },
  bannerImage: { width: '100%', height: '100%' },
  bannerIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  adminBadgeText: { fontSize: 11, fontWeight: '700' },
  adminGrid: { flexDirection: 'row', gap: 12 },
  adminCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  adminCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  adminCardTitle: { fontSize: 14, fontWeight: '800' },
  adminCardSub: { fontSize: 11, marginTop: 2 },
});
