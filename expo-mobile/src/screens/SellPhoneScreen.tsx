import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, Search, Smartphone, Check, ArrowRight, 
  DollarSign, Sparkles, ShieldCheck, MapPin, Calendar, Clock, 
  BadgeCheck, Zap 
} from 'lucide-react-native';
import Card from '../components/Card';
import { brands, modelsByBrand, sellBasePrices, inr, appointmentDays, timeSlots } from '../lib/data';
import { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

export default function SellPhoneScreen({ navigation }: RootStackScreenProps<'SellPhone'>) {
  const { theme, isDark } = useTheme();

  // Wizard state: 1 = Brand/Model, 2 = Storage & Condition, 3 = Instant Quote & Pickup
  const [step, setStep] = useState<number>(1);
  const [brand, setBrand] = useState<string>('Apple');
  const [model, setModel] = useState<string>('iPhone 13');
  const [storage, setStorage] = useState<string>('128 GB');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Diagnostic questions
  const [screenCondition, setScreenCondition] = useState<'flawless' | 'good' | 'cracked'>('good');
  const [bodyCondition, setBodyCondition] = useState<'flawless' | 'good' | 'dented'>('good');
  const [camerasWorking, setCamerasWorking] = useState<boolean>(true);
  const [hasBox, setHasBox] = useState<boolean>(true);
  const [hasBill, setHasBill] = useState<boolean>(true);

  // Pickup state
  const [day, setDay] = useState<number>(1);
  const [slot, setSlot] = useState<string>('11:00 AM');
  const [upiId, setUpiId] = useState<string>('rahul@okaxis');
  const [address, setAddress] = useState<string>('B-42, Rose Apartments, Andheri West, Mumbai');

  const models = useMemo(() => modelsByBrand[brand] ?? [], [brand]);

  // Calculate dynamic valuation based on inputs
  const calculatedPrice = useMemo(() => {
    let base = sellBasePrices[model] || 22000;
    
    // Storage modifier
    if (storage === '256 GB') base += 3500;
    if (storage === '512 GB') base += 7000;
    if (storage === '64 GB') base -= 2500;

    // Condition modifiers
    if (screenCondition === 'flawless') base += 2000;
    if (screenCondition === 'cracked') base -= 6500;

    if (bodyCondition === 'flawless') base += 1000;
    if (bodyCondition === 'dented') base -= 3000;

    if (!camerasWorking) base -= 3500;
    if (hasBox) base += 800;
    if (hasBill) base += 1200;

    return Math.max(base, 3000);
  }, [model, storage, screenCondition, bodyCondition, camerasWorking, hasBox, hasBill]);

  const handleConfirmPickup = () => {
    Alert.alert(
      "Pickup Scheduled! 🎉",
      `Our technician will inspect your ${model} on ${appointmentDays[day]?.date} at ${slot}.\nInstant payout of ${inr(calculatedPrice)} will be transferred to ${upiId} after inspection!`,
      [{ text: "Great!", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity 
          onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} 
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Sell Old Phone</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBg, { backgroundColor: theme.divider }]}>
        <View style={[styles.progressBar, { width: `${(step / 3) * 100}%`, backgroundColor: theme.primary }]} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          
          {/* STEP 1: Select Brand & Model */}
          {step === 1 && (
            <View>
              {/* Trust Tag */}
              <View style={[styles.instantCashBanner, { backgroundColor: theme.primarySoft, borderColor: theme.cardBorder }]}>
                <Zap size={22} color={theme.primary} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.cashBannerTitle, { color: theme.primary }]}>Get Instant Cash at Doorstep</Text>
                  <Text style={[styles.cashBannerSubtitle, { color: theme.textSecondary }]}>
                    Free doorstep pickup • Best price guaranteed • Instant UPI transfer
                  </Text>
                </View>
              </View>

              <Text style={[styles.stepTitle, { color: theme.text }]}>1. Select your device</Text>

              {/* Brand Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandScroll}>
                {brands.map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[
                      styles.brandPill,
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      brand === b && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setBrand(b)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.brandPillText,
                      { color: theme.textSecondary },
                      brand === b && { color: '#ffffff', fontWeight: '700' }
                    ]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Model List */}
              <Text style={[styles.subHeading, { color: theme.textSecondary }]}>Select Model</Text>
              <View style={styles.modelList}>
                {models.map((m) => {
                  const estBase = sellBasePrices[m] || 20000;
                  const isSelected = model === m;

                  return (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.modelCard,
                        { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                        isSelected && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                      ]}
                      onPress={() => setModel(m)}
                      activeOpacity={0.7}
                    >
                      <Smartphone size={24} color={isSelected ? theme.primary : theme.textSecondary} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[
                          styles.modelName, 
                          { color: theme.text },
                          isSelected && { color: theme.primary }
                        ]}>{m}</Text>
                        <Text style={[styles.modelValueEstimate, { color: theme.textSecondary }]}>
                          Get up to <Text style={{ color: '#16a34a', fontWeight: '700' }}>{inr(estBase + 4000)}</Text>
                        </Text>
                      </View>
                      {isSelected && <Check size={20} color={theme.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Continue to Step 2 */}
              <TouchableOpacity
                style={[styles.nextStepBtn, { backgroundColor: theme.primary }]}
                onPress={() => setStep(2)}
                activeOpacity={0.8}
              >
                <Text style={styles.nextStepBtnText}>Next: Device Condition</Text>
                <ArrowRight size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Storage & Condition Assessment */}
          {step === 2 && (
            <View>
              <Card style={styles.selectedDeviceCard}>
                <Smartphone size={24} color={theme.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.selectedDeviceName, { color: theme.text }]}>{brand} {model}</Text>
                  <Text style={[styles.selectedDeviceSub, { color: theme.textSecondary }]}>Let's assess condition for exact valuation</Text>
                </View>
              </Card>

              {/* Storage Capacity */}
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Storage Capacity</Text>
              <View style={styles.storageGrid}>
                {['64 GB', '128 GB', '256 GB', '512 GB'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.storagePill,
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      storage === s && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                    ]}
                    onPress={() => setStorage(s)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.storagePillText,
                      { color: theme.text },
                      storage === s && { color: theme.primary, fontWeight: '700' }
                    ]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Screen Condition */}
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Screen Condition</Text>
              <View style={styles.optionList}>
                {[
                  { id: 'flawless', label: 'Flawless (No scratches, original display)' },
                  { id: 'good', label: 'Good (Minor visible hairline scratches)' },
                  { id: 'cracked', label: 'Cracked or Display defect' },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.optionCard,
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      screenCondition === opt.id && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                    ]}
                    onPress={() => setScreenCondition(opt.id as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionCardText,
                      { color: theme.text },
                      screenCondition === opt.id && { color: theme.primary, fontWeight: '700' }
                    ]}>{opt.label}</Text>
                    {screenCondition === opt.id && <Check size={18} color={theme.primary} />}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Body Condition */}
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Body Condition</Text>
              <View style={styles.optionList}>
                {[
                  { id: 'flawless', label: 'Flawless (Like new, zero dents)' },
                  { id: 'good', label: 'Good (Minor normal signs of use)' },
                  { id: 'dented', label: 'Heavy dents or chipped paint' },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.optionCard,
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      bodyCondition === opt.id && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                    ]}
                    onPress={() => setBodyCondition(opt.id as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionCardText,
                      { color: theme.text },
                      bodyCondition === opt.id && { color: theme.primary, fontWeight: '700' }
                    ]}>{opt.label}</Text>
                    {bodyCondition === opt.id && <Check size={18} color={theme.primary} />}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Accessories Checklist */}
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Accessories Available</Text>
              <View style={styles.checkboxGrid}>
                <TouchableOpacity
                  style={[
                    styles.checkboxCard,
                    { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                    hasBox && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                  ]}
                  onPress={() => setHasBox(!hasBox)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.checkboxLabel, { color: theme.text }, hasBox && { color: theme.primary, fontWeight: '700' }]}>
                    Original Box (+{inr(800)})
                  </Text>
                  {hasBox && <Check size={18} color={theme.primary} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.checkboxCard,
                    { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                    hasBill && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                  ]}
                  onPress={() => setHasBill(!hasBill)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.checkboxLabel, { color: theme.text }, hasBill && { color: theme.primary, fontWeight: '700' }]}>
                    Original Bill (+{inr(1200)})
                  </Text>
                  {hasBill && <Check size={18} color={theme.primary} />}
                </TouchableOpacity>
              </View>

              {/* Continue to Step 3 */}
              <TouchableOpacity
                style={[styles.nextStepBtn, { backgroundColor: theme.primary }]}
                onPress={() => setStep(3)}
                activeOpacity={0.8}
              >
                <Text style={styles.nextStepBtnText}>Calculate Instant Quote</Text>
                <ArrowRight size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Instant Quote & Pickup Schedule */}
          {step === 3 && (
            <View>
              {/* Massive Valuation Card */}
              <Card style={[styles.valuationHeroCard, { backgroundColor: isDark ? '#1e1b4b' : '#eef2ff', borderColor: theme.primary }]}>
                <View style={styles.valuationBadge}>
                  <Sparkles size={16} color="#ffffff" />
                  <Text style={styles.valuationBadgeText}>Guaranteed Valuation</Text>
                </View>

                <Text style={[styles.valuationDeviceText, { color: theme.text }]}>
                  {brand} {model} ({storage})
                </Text>

                <Text style={[styles.valuationAmount, { color: theme.primary }]}>
                  {inr(calculatedPrice)}
                </Text>

                <Text style={[styles.valuationLockHint, { color: theme.textSecondary }]}>
                  Price locked for 7 days • Instant payment upon doorstep handover
                </Text>
              </Card>

              {/* Pickup Appointment */}
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Schedule Doorstep Pickup</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                {appointmentDays.map((d, i) => (
                  <TouchableOpacity
                    key={d.date}
                    style={[
                      styles.dateBox,
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      day === i && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setDay(i)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dateLabel,
                      { color: theme.textSecondary },
                      day === i && { color: 'rgba(255,255,255,0.8)' }
                    ]}>{d.label}</Text>
                    <Text style={[
                      styles.dateValue,
                      { color: theme.text },
                      day === i && { color: '#ffffff' }
                    ]}>{d.date}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Time Slots */}
              <View style={styles.slotsGrid}>
                {timeSlots.filter(t => t.available).map((t) => (
                  <TouchableOpacity
                    key={t.time}
                    style={[
                      styles.slotPill,
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      slot === t.time && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setSlot(t.time)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.slotPillText,
                      { color: theme.text },
                      slot === t.time && { color: '#ffffff', fontWeight: '700' }
                    ]}>{t.time}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Instant Payout Method */}
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Instant Payment Details</Text>
              <Card style={styles.payoutCard}>
                <Text style={[styles.payoutLabel, { color: theme.textSecondary }]}>UPI ID for Instant Payout</Text>
                <TextInput
                  style={[styles.payoutInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                  placeholder="e.g. yourname@okaxis"
                  placeholderTextColor={theme.textMuted}
                  value={upiId}
                  onChangeText={setUpiId}
                />
              </Card>

              {/* Address */}
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Pickup Address</Text>
              <Card style={styles.payoutCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin size={18} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.addressText, { color: theme.text }]}>{address}</Text>
                </View>
              </Card>

              {/* Confirm CTA */}
              <TouchableOpacity
                style={[styles.confirmPickupBtn, { backgroundColor: theme.primary }]}
                onPress={handleConfirmPickup}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmPickupBtnText}>
                  Confirm Pickup • Get {inr(calculatedPrice)}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
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
  progressBg: {
    height: 4,
  },
  progressBar: {
    height: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  instantCashBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  cashBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cashBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  brandScroll: {
    marginBottom: 16,
  },
  brandPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  brandPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  modelList: {
    gap: 10,
    marginBottom: 24,
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '700',
  },
  modelValueEstimate: {
    fontSize: 13,
    marginTop: 2,
  },
  nextStepBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  nextStepBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  selectedDeviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  selectedDeviceName: {
    fontSize: 16,
    fontWeight: '800',
  },
  selectedDeviceSub: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 10,
  },
  storageGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  storagePill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  storagePillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionList: {
    gap: 8,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  optionCardText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    paddingRight: 8,
  },
  checkboxGrid: {
    gap: 8,
    marginBottom: 24,
  },
  checkboxCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  valuationHeroCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 24,
  },
  valuationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  valuationBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  valuationDeviceText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  valuationAmount: {
    fontSize: 34,
    fontWeight: '900',
    marginVertical: 4,
  },
  valuationLockHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  dateScroll: {
    marginBottom: 14,
  },
  dateBox: {
    width: 72,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginRight: 10,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  slotPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  slotPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  payoutCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  payoutLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  payoutInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  confirmPickupBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  confirmPickupBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
