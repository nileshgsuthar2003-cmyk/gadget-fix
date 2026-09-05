import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { 
  ChevronLeft, CheckCircle2, Circle, FileText, Plus, Sparkles, Info 
} from 'lucide-react-native';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { statusFlow, trackingSteps, inr } from '../lib/data';
import { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { api, ApiRepair, API_BASE_URL } from '../lib/api';

function getTrackingCurrentStep(status: string): number {
  const statusIndex = statusFlow.indexOf(status as any);
  if (statusIndex === -1 || statusIndex === 0) return 0; // Booking Created
  if (statusIndex === 1) return 1; // Appointment Confirmed
  if (statusIndex === 2) return 2; // Device Received
  if (statusIndex === 3 || statusIndex === 4 || statusIndex === 5) return 3; // Inspection
  if (statusIndex === 6) return 4; // Repair In Progress
  if (statusIndex === 7) return 5; // Quality Check
  if (statusIndex >= 8 && statusIndex < 10) return 6; // Ready for Delivery
  if (statusIndex >= 10) return 7; // Completed
  return 0;
}

export default function RepairScreen({ route, navigation }: RootStackScreenProps<'RepairDetails'>) {
  const { theme, isDark } = useTheme();
  const { repairId } = route.params || {};

  const [liveRepair, setLiveRepair] = useState<ApiRepair | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveRepair = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getRepair(repairId);
      if (res && res.success && res.repair) {
        setLiveRepair(res.repair);
      } else {
        const listRes = await api.getMyRepairs();
        if (listRes && listRes.success && Array.isArray(listRes.repairs)) {
          const found = listRes.repairs.find((r: any) => String(r.id) === String(repairId));
          if (found) {
            setLiveRepair(found);
          } else {
            setLiveRepair(null);
          }
        }
      }
    } catch (e) {
      console.warn('Could not refresh repair details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [repairId]);

  useFocusEffect(
    useCallback(() => {
      fetchLiveRepair();
    }, [fetchLiveRepair])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLiveRepair();
  }, [fetchLiveRepair]);

  const repair = liveRepair;

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Track Repair</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>Loading repair details from database...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!repair) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Repair Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>This repair order was not found in the database.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStep = getTrackingCurrentStep(repair.status);
  const isPickup = repair.method === "Pickup & Delivery" || repair.method === "pickup";
  const totalEstimate = Number(repair.estimate || 0);
  const extraCharges = Number(repair.extra_charges || 0);
  const hasExtraCharges = extraCharges > 0;
  const baseServicePrice = Math.max(0, totalEstimate - extraCharges);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Track Repair</Text>
        <View style={{ width: 24 }} />
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
        
        <Card style={styles.deviceBanner}>
          <View style={styles.bannerTop}>
            <View>
              <Text style={[styles.repairIdText, { color: theme.textSecondary }]}>Booking #{repair.id}</Text>
              <Text style={[styles.deviceText, { color: theme.text }]}>{repair.device}</Text>
            </View>
            <StatusBadge status={repair.status as any} />
          </View>
          <Text style={[styles.serviceText, { color: theme.textSecondary }]}>{repair.service}</Text>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Repair Status Progress</Text>
          <Card style={styles.timelineCard}>
            {trackingSteps.map((stepName, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;
              const isLast = index === trackingSteps.length - 1;

              return (
                <View key={stepName} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    {isCompleted ? (
                      <CheckCircle2 size={22} color={isCurrent ? theme.primary : "#10b981"} />
                    ) : (
                      <Circle size={22} color={theme.cardBorder} />
                    )}
                    {!isLast && (
                      <View style={[styles.timelineLine, { backgroundColor: isCompleted ? "#10b981" : theme.cardBorder }]} />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text style={[
                      styles.timelineStepText,
                      { color: theme.textMuted },
                      isCompleted && { color: theme.textSecondary, fontWeight: '600' },
                      isCurrent && { color: theme.primary, fontWeight: '800' }
                    ]}>
                      {stepName}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Booking Details</Text>
          <Card style={styles.detailsCard}>
            <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}>
              <Text style={[styles.kvKey, { color: theme.textSecondary }]}>Problem</Text>
              <Text style={[styles.kvValue, { color: theme.text }]}>{repair.problem}</Text>
            </View>
            {repair.description ? (
              <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}>
                <Text style={[styles.kvKey, { color: theme.textSecondary }]}>Note</Text>
                <Text style={[styles.kvValue, { color: theme.text }]}>{repair.description}</Text>
              </View>
            ) : null}
            {repair.address ? (
              <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}>
                <Text style={[styles.kvKey, { color: theme.textSecondary }]}>Address</Text>
                <Text style={[styles.kvValue, { color: theme.text }]}>{repair.address}</Text>
              </View>
            ) : null}
            <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}>
              <Text style={[styles.kvKey, { color: theme.textSecondary }]}>Appointment</Text>
              <Text style={[styles.kvValue, { color: theme.text }]}>{repair.appointment_date || repair.appointment || 'Scheduled'}{repair.time_slot ? `, ${repair.time_slot}` : (repair.time ? `, ${repair.time}` : '')}</Text>
            </View>
            <View style={[styles.kvRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.kvKey, { color: theme.textSecondary }]}>Payment</Text>
              <Text style={[styles.kvValue, { color: (repair.payment_status || repair.payment) === 'Paid' ? '#16a34a' : '#d97706' }]}>
                {repair.payment_status || repair.payment || 'Pending'}
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {repair.status === "Completed" ? "Final Cost Breakdown" : "Price & Estimate Details"}
            </Text>
            {hasExtraCharges && (
              <View style={[styles.priceAdjustedBadge, { backgroundColor: isDark ? '#451a03' : '#fef3c7' }]}>
                <Sparkles size={11} color="#d97706" />
                <Text style={styles.priceAdjustedBadgeText}>Additional Charges Added</Text>
              </View>
            )}
          </View>

          <Card style={styles.priceCard}>
            {/* 1. Base Repair Price */}
            <View style={styles.priceRow}>
              <View style={styles.priceLabelCol}>
                <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Base Repair Price</Text>
                <Text style={[styles.priceSubLabel, { color: theme.textMuted }]}>{repair.service}</Text>
              </View>
              <Text style={[styles.priceValue, { color: theme.text }]}>{inr(baseServicePrice)}</Text>
            </View>

            {/* 2. Doorstep Pickup & Delivery */}
            {isPickup && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Doorstep Pickup & Delivery</Text>
                <Text style={[styles.priceValue, { color: '#10b981', fontWeight: '700' }]}>Free</Text>
              </View>
            )}

            {/* 3. Additional Charges Added (Separate) */}
            {hasExtraCharges && (
              <View style={[
                styles.extraChargesBox, 
                { 
                  backgroundColor: isDark ? '#1e1b4b' : '#eff6ff', 
                  borderColor: isDark ? '#3730a3' : '#bfdbfe' 
                }
              ]}>
                <View style={styles.extraChargesHeader}>
                  <View style={styles.extraChargesTitleRow}>
                    <Plus size={15} color={isDark ? '#818cf8' : '#2563eb'} />
                    <Text style={[styles.extraChargesTitle, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>
                      Additional Charges
                    </Text>
                  </View>
                  <Text style={[styles.extraChargesAmount, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>
                    +{inr(extraCharges)}
                  </Text>
                </View>

                {/* Multi-item Breakdown if available */}
                {repair.additional_charges && Array.isArray(repair.additional_charges) && repair.additional_charges.length > 0 ? (
                  <View style={{ marginTop: 6, gap: 4 }}>
                    {repair.additional_charges.map((item: any, idx: number) => (
                      <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[{ fontSize: 12, fontWeight: '600', flex: 1, paddingRight: 8 }, { color: isDark ? '#e0e7ff' : '#1e3a8a' }]}>
                          • {item.title || `Item #${idx + 1}`}
                        </Text>
                        <Text style={[{ fontSize: 12, fontWeight: '700' }, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>
                          +{inr(item.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : repair.extra_charges_note ? (
                  <Text style={[styles.extraChargesReason, { color: isDark ? '#c7d2fe' : '#3b82f6' }]}>
                    Reason: {repair.extra_charges_note}
                  </Text>
                ) : (
                  <Text style={[styles.extraChargesReason, { color: isDark ? '#c7d2fe' : '#3b82f6' }]}>
                    Approved additional components & service charges
                  </Text>
                )}
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            {/* 4. Full Total */}
            <View style={styles.priceRow}>
              <View>
                <Text style={[styles.priceTotalLabel, { color: theme.text }]}>
                  {repair.status === "Completed" ? "Full Final Total" : "Full Total to Pay"}
                </Text>
                {hasExtraCharges && (
                  <Text style={[styles.priceCompareText, { color: theme.textMuted }]}>
                    Base: {inr(baseServicePrice)} + Additional Charges: {inr(extraCharges)}
                  </Text>
                )}
              </View>
              <Text style={[styles.priceTotalValue, { color: theme.primary }]}>{inr(totalEstimate)}</Text>
            </View>
          </Card>

          {repair.status === "Completed" ? (
            <TouchableOpacity 
              style={[styles.invoiceBtn, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
              onPress={() => Alert.alert("Invoice", "Downloading Bill (PDF)...")}
            >
              <FileText size={18} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.invoiceBtnText, { color: theme.primary }]}>Download Bill (PDF)</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.warningBox, { backgroundColor: isDark ? '#451a03' : '#fffbeb' }]}>
              <Text style={[styles.warningText, { color: isDark ? '#fde68a' : '#b45309' }]}>
                {hasExtraCharges
                  ? "Note: Total price includes the additional charges approved during device inspection."
                  : "Final repair amount will be confirmed after physical inspection."}
              </Text>
            </View>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
  },
  deviceBanner: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 20,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  repairIdText: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  deviceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  serviceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceAdjustedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priceAdjustedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d97706',
  },
  timelineCard: {
    padding: 16,
    borderRadius: 18,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 48,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 26,
    marginRight: 14,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingTop: 2,
  },
  timelineStepText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsCard: {
    padding: 16,
    borderRadius: 18,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  kvKey: {
    fontSize: 14,
  },
  kvValue: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  priceCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabelCol: {
    flex: 1,
    paddingRight: 10,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceSubLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  extraChargesBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 6,
  },
  extraChargesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  extraChargesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  extraChargesTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  extraChargesAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  extraChargesReason: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  priceTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  priceCompareText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  priceTotalValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 50,
  },
  invoiceBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  warningBox: {
    padding: 12,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
