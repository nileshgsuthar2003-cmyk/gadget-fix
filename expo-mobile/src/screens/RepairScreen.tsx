import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, CheckCircle2, Circle, FileText 
} from 'lucide-react-native';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { repairs, statusFlow, trackingSteps, inr } from '../lib/data';
import { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

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
  const repair = repairs.find((r) => r.id === repairId) || repairs[0];

  if (!repair) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Repair Not Found</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>This repair does not exist.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStep = getTrackingCurrentStep(repair.status);
  const isPickup = repair.method === "Pickup & Delivery";
  const pickupFee = isPickup ? 99 : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Track Repair</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.repairTag, { color: theme.primary }]}>#{repair.id.replace("REP-2026-", "REP")}</Text>
              <Text style={[styles.deviceService, { color: theme.text }]} numberOfLines={1}>
                {repair.device} · {repair.service}
              </Text>
            </View>
            <StatusBadge status={repair.status} />
          </View>
        </Card>

        {/* Tracking Timeline */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Repair Timeline</Text>
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

        {/* Booking Details Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Booking Details</Text>
          <Card style={styles.detailsCard}>
            <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}>
              <Text style={[styles.kvKey, { color: theme.textSecondary }]}>Problem</Text>
              <Text style={[styles.kvValue, { color: theme.text }]}>{repair.problem}</Text>
            </View>
            <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}>
              <Text style={[styles.kvKey, { color: theme.textSecondary }]}>Appointment</Text>
              <Text style={[styles.kvValue, { color: theme.text }]}>{repair.appointment}, {repair.time}</Text>
            </View>
            <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}>
              <Text style={[styles.kvKey, { color: theme.textSecondary }]}>Repair Method</Text>
              <Text style={[styles.kvValue, { color: theme.text }]}>{repair.method}</Text>
            </View>
            <View style={[styles.kvRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.kvKey, { color: theme.textSecondary }]}>Payment Status</Text>
              <Text style={[styles.kvValue, { color: repair.payment === 'Paid' ? '#16a34a' : '#d97706' }]}>
                {repair.payment}
              </Text>
            </View>
          </Card>
        </View>

        {/* Pricing Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {repair.status === "Completed" ? "Final Cost" : "Estimated Cost"}
          </Text>
          <Card style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Service ({repair.service})</Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>{inr(repair.estimate - pickupFee)}</Text>
            </View>
            {isPickup && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Pickup Fee</Text>
                <Text style={[styles.priceValue, { color: theme.text }]}>{inr(pickupFee)}</Text>
              </View>
            )}
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <View style={styles.priceRow}>
              <Text style={[styles.priceTotalLabel, { color: theme.text }]}>
                {repair.status === "Completed" ? "Total Paid" : "Estimated Total"}
              </Text>
              <Text style={[styles.priceTotalValue, { color: theme.text }]}>{inr(repair.estimate)}</Text>
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
                Final repair amount will be confirmed after physical inspection.
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
  summaryCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  repairTag: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  deviceService: {
    fontSize: 16,
    fontWeight: '800',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
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
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  priceTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  priceTotalValue: {
    fontSize: 18,
    fontWeight: '800',
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
    fontSize: 13,
    fontWeight: '500',
  },
});
