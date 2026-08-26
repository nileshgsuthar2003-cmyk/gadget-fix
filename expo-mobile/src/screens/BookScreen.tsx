import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, Smartphone, Check, ImagePlus, Video, X, Store, 
  Truck, Home as HomeIcon, Building2, ChevronRight, ChevronLeft 
} from 'lucide-react-native';
import Card from '../components/Card';
import { 
  brands, modelsByBrand, problems, servicesForDevice, 
  timeSlots, appointmentDays, inr, CUSTOMER_NAME 
} from '../lib/data';
import { HomeTabScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

const TOTAL_STEPS = 9;

const stepTitles: Record<number, { title: string; sub: string }> = {
  1: { title: "What phone do you use?", sub: "Select your mobile brand" },
  2: { title: "Select your model", sub: "Choose your exact device model" },
  3: { title: "What's wrong with your phone?", sub: "Select all that apply" },
  4: { title: "Tell us more", sub: "Help our technician prepare" },
  5: { title: "Service & Price", sub: "Transparent estimated pricing" },
  6: { title: "Choose an appointment", sub: "Pick a convenient date & time" },
  7: { title: "Repair method", sub: "How should we repair your phone?" },
  8: { title: "Pickup address", sub: "Where should we collect your phone?" },
  9: { title: "Booking summary", sub: "Review and confirm" },
};

export default function BookScreen({ navigation }: HomeTabScreenProps<'Book'>) {
  const { theme, isDark } = useTheme();

  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [brandQuery, setBrandQuery] = useState('');
  const [modelQuery, setModelQuery] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<number[]>([1]);
  const [serviceId, setServiceId] = useState<string>('');
  const [day, setDay] = useState(2);
  const [slot, setSlot] = useState<string>('');
  const [method, setMethod] = useState<'store' | 'pickup' | ''>('');
  const [addressId, setAddressId] = useState<string>('home');
  const [showAddressForm, setShowAddressForm] = useState(false);

  const models = useMemo(() => modelsByBrand[brand] ?? [], [brand]);
  const service = servicesForDevice.find((s) => s.id === serviceId);

  const effectiveStep = step === 8 && method === 'store' ? 9 : step;
  
  const next = () => {
    if (step === 7 && method === 'store') setStep(9);
    else setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  
  const back = () => {
    if (step === 9 && method === 'store') setStep(7);
    else setStep((s) => Math.max(s - 1, 1));
  };

  const canContinue =
    (step === 1 && !!brand) ||
    (step === 2 && !!model) ||
    (step === 3 && selectedProblems.length > 0) ||
    step === 4 ||
    (step === 5 && !!serviceId) ||
    (step === 6 && !!slot) ||
    (step === 7 && !!method) ||
    step === 8 ||
    step === 9;

  const pickupFee = method === 'pickup' ? 99 : 0;
  const coupon = 500;
  const total = (service?.price ?? 0) + pickupFee - coupon;

  const toggleProblem = (p: string) => {
    if (selectedProblems.includes(p)) {
      setSelectedProblems(prev => prev.filter(x => x !== p));
    } else {
      setSelectedProblems(prev => [...prev, p]);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
        {step > 1 ? (
          <TouchableOpacity onPress={back} style={styles.backButton}>
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
        ) : <View style={styles.backButtonPlaceholder} />}
        <Text style={[styles.headerTitle, { color: theme.text }]}>Book a Repair</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.divider }]}>
        <View style={[styles.progressBar, { width: `${(effectiveStep / TOTAL_STEPS) * 100}%`, backgroundColor: theme.primary }]} />
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={[styles.stepSub, { color: theme.textSecondary }]}>{stepTitles[effectiveStep]?.sub}</Text>
          <Text style={[styles.stepTitle, { color: theme.text }]}>{stepTitles[effectiveStep]?.title}</Text>

          {/* STEP 1: Brand */}
          {step === 1 && (
            <View>
              <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <Search size={20} color={theme.textMuted} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Search brands..."
                  placeholderTextColor={theme.textMuted}
                  value={brandQuery}
                  onChangeText={setBrandQuery}
                />
              </View>
              <View style={styles.gridContainer}>
                {brands.filter(b => b.toLowerCase().includes(brandQuery.toLowerCase())).map(b => (
                  <TouchableOpacity
                    key={b}
                    style={[
                      styles.tile, 
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      brand === b && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                    ]}
                    onPress={() => setBrand(b)}
                    activeOpacity={0.7}
                  >
                    <Smartphone size={20} color={brand === b ? theme.primary : theme.textSecondary} />
                    <Text style={[
                      styles.tileText, 
                      { color: theme.text },
                      brand === b && { color: theme.primary }
                    ]}>{b}</Text>
                    {brand === b && <Check size={18} color={theme.primary} style={{ marginLeft: 'auto' }} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* STEP 2: Model */}
          {step === 2 && (
            <View>
              <Card style={styles.selectedCard}>
                <Smartphone size={24} color={theme.primary} />
                <View style={styles.selectedCardInfo}>
                  <Text style={[styles.selectedCardLabel, { color: theme.textSecondary }]}>Brand</Text>
                  <Text style={[styles.selectedCardValue, { color: theme.text }]}>{brand}</Text>
                </View>
                <TouchableOpacity onPress={() => setStep(1)}>
                  <Text style={[styles.changeLink, { color: theme.primary }]}>Change</Text>
                </TouchableOpacity>
              </Card>

              <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <Search size={20} color={theme.textMuted} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Search models..."
                  placeholderTextColor={theme.textMuted}
                  value={modelQuery}
                  onChangeText={setModelQuery}
                />
              </View>

              {models.filter(m => m.toLowerCase().includes(modelQuery.toLowerCase())).map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.rowTile, 
                    { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                    model === m && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                  ]}
                  onPress={() => setModel(m)}
                  activeOpacity={0.7}
                >
                  <Smartphone size={20} color={model === m ? theme.primary : theme.textSecondary} />
                  <Text style={[
                    styles.rowTileText, 
                    { color: theme.text },
                    model === m && { color: theme.primary }
                  ]}>{m}</Text>
                  {model === m && <Check size={18} color={theme.primary} style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* STEP 3: Problems */}
          {step === 3 && (
            <View style={styles.gridContainer}>
              {problems.map(p => {
                const on = selectedProblems.includes(p);
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.tile, 
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder, paddingVertical: 16 },
                      on && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                    ]}
                    onPress={() => toggleProblem(p)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.tileText, 
                      { color: theme.text, flex: 1, marginLeft: 0 },
                      on && { color: theme.primary }
                    ]}>{p}</Text>
                    {on && (
                      <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
                        <Check size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* STEP 4: Describe */}
          {step === 4 && (
            <View>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, borderColor: theme.cardBorder, color: theme.text }]}
                multiline
                numberOfLines={4}
                placeholder="Describe the problem... e.g. screen cracked after a drop, touch works on top half only."
                placeholderTextColor={theme.textMuted}
                value={description}
                onChangeText={setDescription}
              />
              
              <Text style={[styles.subHeading, { color: theme.text }]}>Add Photos</Text>
              <View style={styles.photoGrid}>
                {photos.map(p => (
                  <View key={p} style={[styles.photoBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                    <Smartphone size={32} color={theme.textMuted} />
                    <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotos([])}>
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity 
                  style={[styles.addPhotoBox, { borderColor: theme.cardBorder }]} 
                  onPress={() => setPhotos([1])}
                >
                  <ImagePlus size={24} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.hintText, { color: theme.textSecondary }]}>Photos help us understand the issue before inspection.</Text>

              <TouchableOpacity 
                style={[styles.videoBox, { borderColor: theme.cardBorder }]} 
                onPress={() => Alert.alert('Video Upload', 'Video upload prototype coming soon!')}
              >
                <Video size={18} color={theme.textSecondary} />
                <Text style={[styles.videoBoxText, { color: theme.textSecondary }]}>Add Video (optional)</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 5: Service */}
          {step === 5 && (
            <View>
              <Card style={styles.selectedCard}>
                <Smartphone size={24} color={theme.primary} />
                <View style={styles.selectedCardInfo}>
                  <Text style={[styles.selectedCardLabel, { color: theme.textSecondary }]}>{brand}</Text>
                  <Text style={[styles.selectedCardValue, { color: theme.text }]}>{model}</Text>
                </View>
              </Card>

              {servicesForDevice.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.serviceRowTile, 
                    { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                    serviceId === s.id && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                  ]}
                  onPress={() => setServiceId(s.id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.serviceRowName, 
                      { color: theme.text },
                      serviceId === s.id && { color: theme.primary }
                    ]}>{s.name}</Text>
                    <Text style={[styles.serviceRowTag, { color: theme.textSecondary }]}>
                      {s.tag ? `${s.tag} estimate` : 'Estimated Price'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.serviceRowPrice, { color: theme.text }]}>{inr(s.price)}</Text>
                    {serviceId === s.id && <Check size={16} color={theme.primary} style={{ marginTop: 4 }} />}
                  </View>
                </TouchableOpacity>
              ))}

              <View style={[styles.warningBox, { backgroundColor: isDark ? '#451a03' : '#fffbeb' }]}>
                <Text style={[styles.warningText, { color: isDark ? '#fde68a' : '#b45309' }]}>
                  Final price may change after physical inspection.
                </Text>
              </View>
            </View>
          )}

          {/* STEP 6: Appointment */}
          {step === 6 && (
            <View>
              <Text style={[styles.subHeading, { color: theme.text }]}>Date</Text>
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

              <Text style={[styles.subHeading, { color: theme.text }]}>Time slot</Text>
              <View style={styles.gridContainer}>
                {timeSlots.map(t => (
                  <TouchableOpacity
                    key={t.time}
                    disabled={!t.available}
                    style={[
                      styles.timeBox,
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      !t.available && { backgroundColor: theme.divider, borderColor: theme.divider, opacity: 0.5 },
                      t.available && slot === t.time && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setSlot(t.time)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.timeBoxText,
                      { color: theme.text },
                      !t.available && { color: theme.textMuted, textDecorationLine: 'line-through' },
                      t.available && slot === t.time && { color: '#ffffff' }
                    ]}>{t.time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* STEP 7: Method */}
          {step === 7 && (
            <View>
              {[
                { id: "store", icon: Store, title: "Visit Store", desc: "Bring your phone to our repair center." },
                { id: "pickup", icon: Truck, title: "Pickup & Delivery", desc: "We'll collect your phone and return it after repair." },
              ].map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.rowTile, 
                    { backgroundColor: theme.surface, borderColor: theme.cardBorder, alignItems: 'flex-start' },
                    method === m.id && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                  ]}
                  onPress={() => setMethod(m.id as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.methodIconBox, { backgroundColor: theme.background }]}>
                    <m.icon size={24} color={method === m.id ? theme.primary : theme.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.rowTileText, 
                      { color: theme.text },
                      method === m.id && { color: theme.primary }
                    ]}>{m.title}</Text>
                    <Text style={[styles.methodDesc, { color: theme.textSecondary }]}>{m.desc}</Text>
                  </View>
                  {method === m.id && <Check size={20} color={theme.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* STEP 8: Address */}
          {step === 8 && (
            <View>
              {[
                { id: "home", icon: HomeIcon, label: "Home", line: "B-42, Rose Apartments, Andheri West, Mumbai 400053" },
                { id: "office", icon: Building2, label: "Office", line: "3rd Floor, Trade View, Lower Parel, Mumbai 400013" },
              ].map(a => (
                <TouchableOpacity
                  key={a.id}
                  style={[
                    styles.rowTile, 
                    { backgroundColor: theme.surface, borderColor: theme.cardBorder, alignItems: 'flex-start' },
                    addressId === a.id && !showAddressForm && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                  ]}
                  onPress={() => { setAddressId(a.id); setShowAddressForm(false); }}
                  activeOpacity={0.7}
                >
                  <a.icon size={20} color={addressId === a.id && !showAddressForm ? theme.primary : theme.textSecondary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[
                      styles.rowTileText, 
                      { color: theme.text, marginLeft: 0 },
                      addressId === a.id && !showAddressForm && { color: theme.primary }
                    ]}>{a.label}</Text>
                    <Text style={[styles.methodDesc, { color: theme.textSecondary }]}>{a.line}</Text>
                  </View>
                  {addressId === a.id && !showAddressForm && <Check size={18} color={theme.primary} />}
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                style={[styles.addAddressBtn, { borderColor: theme.primary }]}
                onPress={() => setShowAddressForm(!showAddressForm)}
                activeOpacity={0.8}
              >
                <Text style={[styles.addAddressText, { color: theme.primary }]}>+ Add New Address</Text>
              </TouchableOpacity>

              {showAddressForm && (
                <Card style={styles.addressForm}>
                  <TextInput 
                    style={[styles.formInput, { backgroundColor: theme.surface, borderColor: theme.cardBorder, color: theme.text }]} 
                    placeholder="Full Name" 
                    placeholderTextColor={theme.textMuted}
                  />
                  <TextInput 
                    style={[styles.formInput, { backgroundColor: theme.surface, borderColor: theme.cardBorder, color: theme.text }]} 
                    placeholder="Phone" 
                    placeholderTextColor={theme.textMuted}
                    keyboardType="phone-pad" 
                  />
                  <TextInput 
                    style={[styles.formInput, { backgroundColor: theme.surface, borderColor: theme.cardBorder, color: theme.text }]} 
                    placeholder="House / Flat" 
                    placeholderTextColor={theme.textMuted}
                  />
                  <View style={styles.formRow}>
                    <TextInput 
                      style={[styles.formInput, { flex: 1, marginRight: 8, backgroundColor: theme.surface, borderColor: theme.cardBorder, color: theme.text }]} 
                      placeholder="Street" 
                      placeholderTextColor={theme.textMuted}
                    />
                    <TextInput 
                      style={[styles.formInput, { flex: 1, backgroundColor: theme.surface, borderColor: theme.cardBorder, color: theme.text }]} 
                      placeholder="Area" 
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>
                </Card>
              )}
            </View>
          )}

          {/* STEP 9: Summary */}
          {step === 9 && (
            <View>
              <Card style={styles.summaryCard}>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Customer</Text><Text style={[styles.kvValue, { color: theme.text }]}>{CUSTOMER_NAME || "Rahul Sharma"}</Text></View>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Device</Text><Text style={[styles.kvValue, { color: theme.text }]}>{model || "iPhone 13"}</Text></View>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Problem</Text><Text style={[styles.kvValue, { color: theme.text }]}>{selectedProblems.join(", ") || "Screen Broken"}</Text></View>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Service</Text><Text style={[styles.kvValue, { color: theme.text }]}>{service?.name ?? "Screen Replacement"}</Text></View>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Appointment</Text><Text style={[styles.kvValue, { color: theme.text }]}>{appointmentDays[day]?.date} 2026, {slot || "11:00 AM"}</Text></View>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Method</Text><Text style={[styles.kvValue, { color: theme.text }]}>{method === "pickup" ? "Pickup & Delivery" : "Visit Store"}</Text></View>
                {method === "pickup" && (
                  <View style={[styles.kvRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.kvKey, { color: theme.textSecondary }]}>Address</Text>
                    <Text style={[styles.kvValue, { color: theme.text }]}>{addressId === "home" ? "Home" : "Office"}</Text>
                  </View>
                )}
              </Card>

              <Card style={styles.priceCard}>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Estimated Service</Text>
                  <Text style={[styles.priceValue, { color: theme.text }]}>{inr(service?.price ?? 12999)}</Text>
                </View>
                {method === "pickup" && (
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Pickup Fee</Text>
                    <Text style={[styles.priceValue, { color: theme.text }]}>{inr(pickupFee)}</Text>
                  </View>
                )}
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Coupon (FIX500)</Text>
                  <Text style={styles.priceSuccess}>-{inr(coupon)}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                <View style={styles.priceRow}>
                  <Text style={[styles.priceTotalLabel, { color: theme.text }]}>Estimated Total</Text>
                  <Text style={[styles.priceTotalValue, { color: theme.text }]}>{inr(total)}</Text>
                </View>
              </Card>

              <View style={[styles.warningBox, { backgroundColor: isDark ? '#451a03' : '#fffbeb' }]}>
                <Text style={[styles.warningText, { color: isDark ? '#fde68a' : '#b45309' }]}>
                  Final repair amount will be confirmed after inspection.
                </Text>
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer CTA */}
      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.cardBorder }]}>
        <TouchableOpacity 
          style={[styles.btn, styles.btnSecondary, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]} 
          onPress={step === 1 ? () => navigation.goBack() : back}
        >
          <Text style={[styles.btnSecondaryText, { color: theme.text }]}>Back</Text>
        </TouchableOpacity>

        {step < TOTAL_STEPS ? (
          <TouchableOpacity 
            style={[styles.btn, styles.btnPrimary, !canContinue && styles.btnDisabled]} 
            onPress={next}
            disabled={!canContinue}
          >
            <Text style={styles.btnPrimaryText}>Continue</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.btn, styles.btnPrimary]} 
            onPress={() => {
              Alert.alert('Success', 'Repair booked successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
              ]);
            }}
          >
            <Text style={styles.btnPrimaryText}>Confirm · {inr(total)}</Text>
          </TouchableOpacity>
        )}
      </View>
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
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  backButtonPlaceholder: {
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    height: 4,
  },
  progressBar: {
    height: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  stepSub: {
    fontSize: 14,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  tileText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  rowTile: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rowTileText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 12,
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  selectedCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedCardLabel: {
    fontSize: 12,
  },
  selectedCardValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  changeLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  photoBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginRight: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    fontSize: 13,
    marginBottom: 24,
  },
  videoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  videoBoxText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  serviceRowTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  serviceRowName: {
    fontSize: 15,
    fontWeight: '700',
  },
  serviceRowTag: {
    fontSize: 12,
    marginTop: 2,
  },
  serviceRowPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  warningBox: {
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dateBox: {
    width: 72,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1.5,
    borderRadius: 16,
    marginRight: 12,
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
  timeBox: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 12,
  },
  timeBoxText: {
    fontSize: 13,
    fontWeight: '700',
  },
  methodIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  addAddressBtn: {
    height: 52,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addAddressText: {
    fontSize: 15,
    fontWeight: '700',
  },
  addressForm: {
    marginTop: 16,
    padding: 16,
  },
  formInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
    marginBottom: 16,
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
  priceSuccess: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  priceTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  priceTotalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  btn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    marginRight: 12,
    maxWidth: 100,
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnPrimary: {
    flex: 2,
    backgroundColor: '#111827',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
});
