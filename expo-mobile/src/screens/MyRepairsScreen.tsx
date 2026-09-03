import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone } from 'lucide-react-native';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { repairs as fallbackRepairs, CUSTOMER_NAME, inr } from '../lib/data';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { api, ApiRepair } from '../lib/api';

export default function MyRepairsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme, isDark } = useTheme();

  const [liveRepairs, setLiveRepairs] = useState<ApiRepair[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRepairs = useCallback(async () => {
    try {
      const res = await api.getMyRepairs();
      if (res && res.success && Array.isArray(res.repairs) && res.repairs.length > 0) {
        setLiveRepairs(res.repairs);
      } else {
        setLiveRepairs(fallbackRepairs as any);
      }
    } catch (e) {
      setLiveRepairs(fallbackRepairs as any);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh data every time My Repairs tab is focused / opened
  useFocusEffect(
    useCallback(() => {
      fetchRepairs();
    }, [fetchRepairs])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRepairs();
  }, [fetchRepairs]);

  const allRepairs = liveRepairs.length > 0 ? liveRepairs : (fallbackRepairs as any);
  const activeRepairs = allRepairs.filter((r: any) => r.status !== "Completed" && r.status !== "Cancelled");
  const pastRepairs = allRepairs.filter((r: any) => r.status === "Completed" || r.status === "Cancelled");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Repairs</Text>
      </View>

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
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loaderText, { color: theme.textSecondary }]}>Loading your repairs...</Text>
          </View>
        ) : (
          <>
            {/* Active Repairs */}
            {activeRepairs.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Repairs</Text>
                {activeRepairs.map((r: any) => (
                  <TouchableOpacity 
                    key={r.id} 
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('RepairDetails', { repairId: r.id })}
                  >
                    <Card style={styles.repairCard}>
                      <View style={[styles.iconContainerActive, { backgroundColor: theme.primarySoft }]}>
                        <Smartphone size={22} color={theme.primary} />
                      </View>
                      <View style={styles.repairInfo}>
                        <Text style={[styles.repairDevice, { color: theme.text }]} numberOfLines={1}>{r.device}</Text>
                        <Text style={[styles.repairService, { color: theme.textSecondary }]}>{r.service}</Text>
                      </View>
                      <View style={styles.statusCol}>
                        <StatusBadge status={r.status} />
                        <Text style={[styles.dateText, { color: theme.textMuted }]}>{r.appointment || r.created_at?.slice(0, 10)}</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Past Repairs */}
            {pastRepairs.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Past Repairs</Text>
                {pastRepairs.map((r: any) => (
                  <TouchableOpacity 
                    key={r.id} 
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('RepairDetails', { repairId: r.id })}
                  >
                    <Card style={styles.repairCard}>
                      <View style={[styles.iconContainerPast, { backgroundColor: theme.background }]}>
                        <Smartphone size={22} color={theme.textMuted} />
                      </View>
                      <View style={styles.repairInfo}>
                        <Text style={[styles.repairDevice, { color: theme.text }]} numberOfLines={1}>{r.device}</Text>
                        <Text style={[styles.repairService, { color: theme.textSecondary }]}>{r.service}</Text>
                      </View>
                      <View style={styles.statusCol}>
                        <StatusBadge status={r.status} />
                        <Text style={[styles.estimateText, { color: theme.text }]}>{inr(r.estimate || r.cost || 0)}</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeRepairs.length === 0 && pastRepairs.length === 0 && (
              <View style={styles.emptyState}>
                <Smartphone size={48} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Repairs Found</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>You haven't booked any phone repairs yet.</Text>
              </View>
            )}
          </>
        )}

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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  repairCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginVertical: 6,
  },
  iconContainerActive: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconContainerPast: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  repairInfo: {
    flex: 1,
    marginRight: 8,
  },
  repairDevice: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  repairService: {
    fontSize: 13,
  },
  statusCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  estimateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  loaderContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 13,
  },
});
