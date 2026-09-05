import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone, ChevronRight, Calendar, Plus, Sparkles } from 'lucide-react-native';
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

  const renderRepairCard = (r: any, isActive: boolean) => {
    const total = Number(r.estimate || r.cost || 0);
    const extra = Number(r.extra_charges || 0);
    const hasExtra = extra > 0;
    const basePrice = Math.max(0, total - extra);

    return (
      <TouchableOpacity 
        key={r.id} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('RepairDetails', { repairId: r.id })}
        style={styles.cardTouch}
      >
        <Card style={styles.repairCard}>
          {/* Header Row: Icon, Device, Booking ID, Status */}
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconContainer, { backgroundColor: isActive ? theme.primarySoft : theme.background }]}>
              <Smartphone size={20} color={isActive ? theme.primary : theme.textMuted} />
            </View>
            <View style={styles.repairInfo}>
              <Text style={[styles.repairDevice, { color: theme.text }]} numberOfLines={1}>
                {r.device}
              </Text>
              <Text style={[styles.repairService, { color: theme.textSecondary }]}>
                {r.service} · #{r.id}
              </Text>
            </View>
            <StatusBadge status={r.status} />
          </View>

          {/* Pricing Breakdown Box */}
          {hasExtra ? (
            <View style={[
              styles.pricingBreakdownBox, 
              { 
                backgroundColor: isDark ? '#1e1b4b' : '#eff6ff', 
                borderColor: isDark ? '#3730a3' : '#bfdbfe' 
              }
            ]}>
              <View style={styles.badgeLabelRow}>
                <View style={[styles.priceAdjustBadge, { backgroundColor: isDark ? '#451a03' : '#fef3c7' }]}>
                  <Sparkles size={11} color="#d97706" />
                  <Text style={styles.priceAdjustBadgeText}>Additional Charges Added</Text>
                </View>
              </View>

              {/* 1. Base Price */}
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingLabel, { color: theme.textSecondary }]}>Base Repair Price:</Text>
                <Text style={[styles.pricingValue, { color: theme.text }]}>{inr(basePrice)}</Text>
              </View>

              {/* 2. Additional Charges Breakdown (Multiple or Single) */}
              {r.additional_charges && Array.isArray(r.additional_charges) && r.additional_charges.length > 0 ? (
                <View style={[styles.multiAdditionBox, { backgroundColor: isDark ? '#312e81' : '#dbeafe' }]}>
                  <Text style={[styles.multiAdditionHeader, { color: isDark ? '#c7d2fe' : '#1e40af' }]}>
                    Additional Charges Items:
                  </Text>
                  {r.additional_charges.map((item: any, idx: number) => (
                    <View key={idx} style={styles.miniItemRow}>
                      <Text style={[styles.miniItemTitle, { color: isDark ? '#e0e7ff' : '#1e3a8a' }]} numberOfLines={1}>
                        • {item.title || `Charge #${idx + 1}`}
                      </Text>
                      <Text style={[styles.miniItemAmount, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>
                        +{inr(item.amount)}
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.pricingRow, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: isDark ? '#4338ca' : '#bfdbfe' }]}>
                    <Text style={[styles.extraLabel, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>
                      Total Additional Charges:
                    </Text>
                    <Text style={[styles.extraValue, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>
                      +{inr(extra)}
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.pricingRow}>
                    <View style={styles.extraTagRow}>
                      <Plus size={13} color={isDark ? '#818cf8' : '#2563eb'} />
                      <Text style={[styles.extraLabel, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>
                        Additional Charges:
                      </Text>
                    </View>
                    <Text style={[styles.extraValue, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>
                      +{inr(extra)}
                    </Text>
                  </View>

                  {r.extra_charges_note ? (
                    <View style={styles.noteRow}>
                      <Text style={[styles.noteText, { color: isDark ? '#c7d2fe' : '#3b82f6' }]} numberOfLines={2}>
                        Reason: {r.extra_charges_note}
                      </Text>
                    </View>
                  ) : null}
                </>
              )}

              <View style={[styles.pricingDivider, { backgroundColor: isDark ? '#3730a3' : '#bfdbfe' }]} />

              {/* 3. Full Total */}
              <View style={styles.pricingRow}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>Full Total Amount:</Text>
                <Text style={[styles.totalValue, { color: theme.primary }]}>{inr(total)}</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.simplePricingBox, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }]}>
              <Text style={[styles.simplePricingLabel, { color: theme.textSecondary }]}>Total Estimate:</Text>
              <Text style={[styles.simplePricingValue, { color: theme.text }]}>{inr(total)}</Text>
            </View>
          )}

          {/* Footer Row: Appointment Date & View Details Link */}
          <View style={[styles.cardFooterRow, { borderTopColor: theme.cardBorder }]}>
            <View style={styles.dateRow}>
              <Calendar size={13} color={theme.textMuted} />
              <Text style={[styles.dateText, { color: theme.textMuted }]}>
                {r.appointment || (r.created_at ? r.created_at.slice(0, 10) : 'Recent')}
              </Text>
            </View>
            <View style={styles.trackCtaRow}>
              <Text style={[styles.trackCtaText, { color: theme.primary }]}>View Track Details</Text>
              <ChevronRight size={14} color={theme.primary} />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

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
                {activeRepairs.map((r: any) => renderRepairCard(r, true))}
              </View>
            )}

            {/* Past Repairs */}
            {pastRepairs.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Past Repairs</Text>
                {pastRepairs.map((r: any) => renderRepairCard(r, false))}
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
  cardTouch: {
    marginVertical: 6,
  },
  repairCard: {
    padding: 16,
    borderRadius: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    fontSize: 12,
  },
  // Extra Charges Breakdown Box
  pricingBreakdownBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  badgeLabelRow: {
    marginBottom: 8,
  },
  priceAdjustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priceAdjustBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  pricingLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  pricingValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  extraTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  extraLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  extraValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  noteRow: {
    marginTop: 4,
    marginBottom: 2,
    paddingLeft: 4,
  },
  noteText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  pricingDivider: {
    height: 1,
    marginVertical: 8,
  },
  multiAdditionBox: {
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  multiAdditionHeader: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  miniItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  miniItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
  },
  miniItemAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  // Simple Pricing Box (when no extra charges)
  simplePricingBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  simplePricingLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  simplePricingValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  trackCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trackCtaText: {
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
