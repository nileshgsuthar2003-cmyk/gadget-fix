import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, Smartphone, Check, ImagePlus, Video, X, Store, 
  Truck, Home as HomeIcon, Building2, ChevronRight, ChevronLeft, ShieldCheck 
} from 'lucide-react-native';
import Card from '../components/Card';
import { 
  problems, timeSlots, appointmentDays, inr, CUSTOMER_NAME 
} from '../lib/data';
import { api, ApiBrand, ApiModel, ApiModelService } from '../lib/api';
import { HomeTabScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const TOTAL_STEPS = 9;

const stepTitles: Record<number, { title: string; sub: string }> = {
  1: { title: "What phone do you use?", sub: "Select your mobile brand" },
  2: { title: "Select your model", sub: "Choose your exact device model" },
  3: { title: "What's wrong with your phone?", sub: "Select all that apply" },
  4: { title: "Tell us more", sub: "Help our technician prepare" },
  5: { title: "Service & Price", sub: "Model-specific transparent pricing" },
  6: { title: "Choose an appointment", sub: "Pick a convenient date & time" },
  7: { title: "Repair method", sub: "How should we repair your phone?" },
  8: { title: "Pickup address", sub: "Where should we collect your phone?" },
  9: { title: "Booking summary", sub: "Review and confirm" },
};

export default function BookScreen({ navigation }: HomeTabScreenProps<'Book'>) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  
  // Dynamic Catalog State
  const [brandsList, setBrandsList] = useState<ApiBrand[]>([]);
  const [selectedBrandObj, setSelectedBrandObj] = useState<ApiBrand | null>(null);
  const [brand, setBrand] = useState<string>('');
  
  const [modelsList, setModelsList] = useState<ApiModel[]>([]);
  const [selectedModelObj, setSelectedModelObj] = useState<ApiModel | null>(null);
  const [model, setModel] = useState<string>('');

  const [servicesList, setServicesList] = useState<ApiModelService[]>([]);
  const [selectedServiceObj, setSelectedServiceObj] = useState<ApiModelService | null>(null);
  const [serviceId, setServiceId] = useState<string>('');

  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [brandQuery, setBrandQuery] = useState('');
  const [modelQuery, setModelQuery] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<number[]>([1]);
  const [day, setDay] = useState(2);
  const [slot, setSlot] = useState<string>('11:00 AM');
  const [method, setMethod] = useState<'store' | 'pickup' | ''>('pickup');
  const [addressId, setAddressId] = useState<string>('home');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // 1. Fetch Dynamic Brands from MySQL API
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      const data = await api.getBrands();
      setBrandsList(data);
      setLoadingBrands(false);
    };
    fetchBrands();
  }, []);

  // 2. Fetch Dynamic Models when Brand is selected
  useEffect(() => {
    if (selectedBrandObj) {
      const fetchModels = async () => {
        setLoadingModels(true);
        const data = await api.getModels(selectedBrandObj.id, selectedBrandObj.name);
        setModelsList(data);
        setLoadingModels(false);
      };
      fetchModels();
    }
  }, [selectedBrandObj]);

  // 3. Fetch Dynamic Model Services when Model is selected
  useEffect(() => {
    if (selectedModelObj) {
      const fetchServices = async () => {
        setLoadingServices(true);
        const data = await api.getModelServices(selectedModelObj.id, selectedModelObj.name);
        setServicesList(data);
        if (data.length > 0) {
          setSelectedServiceObj(data[0]);
          setServiceId(String(data[0].id));
        }
        setLoadingServices(false);
      };
      fetchServices();
    }
  }, [selectedModelObj]);

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
  const currentServicePrice = selectedServiceObj ? selectedServiceObj.price : 999;
  const total = Math.max(0, currentServicePrice + pickupFee - coupon);

  const toggleProblem = (p: string) => {
    if (selectedProblems.includes(p)) {
      setSelectedProblems(prev => prev.filter(x => x !== p));
    } else {
      setSelectedProblems(prev => [...prev, p]);
    }
  };

  // Submit Booking to MySQL Backend
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);

    try {
      const appointmentDateStr = `${appointmentDays[day]?.date} 2026, ${slot || '11:00 AM'}`;

      await api.createRepair({
        device: `${brand} ${model}`,
        service: selectedServiceObj?.service_name || 'Screen Replacement',
        problem: selectedProblems.join(', ') || 'Diagnostic Repair',
        estimate: total,
        appointmentDate: appointmentDateStr,
        method: method === 'pickup' ? 'Doorstep Pickup & Delivery' : 'Store Visit',
      });

      setIsSubmitting(false);

      Alert.alert(
        '🎉 Repair Booked Successfully!',
        `Your booking for ${brand} ${model} has been saved to Fixly Control Center. A technician will arrive at ${slot}.`,
        [{ text: 'View Home', onPress: () => navigation.navigate('Home') }]
      );
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert(
        'Booking Confirmed!',
        `Your repair request for ${brand} ${model} is scheduled.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
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

          {/* STEP 1: Dynamic Brands from MySQL */}
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

              {loadingBrands ? (
                <View style={styles.loaderBox}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={[styles.loaderText, { color: theme.textSecondary }]}>Loading brands from catalog...</Text>
                </View>
              ) : (
                <View style={styles.gridContainer}>
                  {brandsList
                    .filter(b => b.name.toLowerCase().includes(brandQuery.toLowerCase()))
                    .map(b => (
                      <TouchableOpacity
                        key={b.id}
                        style={[
                          styles.tile, 
                          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                          brand === b.name && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                        ]}
                        onPress={() => {
                          setBrand(b.name);
                          setSelectedBrandObj(b);
                          setModel('');
                          setSelectedModelObj(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <Smartphone size={20} color={brand === b.name ? theme.primary : theme.textSecondary} />
                        <Text style={[
                          styles.tileText, 
                          { color: theme.text },
                          brand === b.name && { color: theme.primary }
                        ]}>{b.name}</Text>
                        {brand === b.name && <Check size={18} color={theme.primary} style={{ marginLeft: 'auto' }} />}
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>
          )}

          {/* STEP 2: Dynamic Models from MySQL */}
          {step === 2 && (
            <View>
              <Card style={styles.selectedCard}>
                <Smartphone size={24} color={theme.primary} />
                <View style={styles.selectedCardInfo}>
                  <Text style={[styles.selectedCardLabel, { color: theme.textSecondary }]}>Brand</Text>
                  <Text style={[styles.selectedCardValue, { color: theme.text }]}>{brand}</Text>
                </View>
              </Card>

              <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <Search size={20} color={theme.textMuted} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder={`Search ${brand} models...`}
                  placeholderTextColor={theme.textMuted}
                  value={modelQuery}
                  onChangeText={setModelQuery}
                />
              </View>

              {loadingModels ? (
                <View style={styles.loaderBox}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={[styles.loaderText, { color: theme.textSecondary }]}>Loading {brand} models...</Text>
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {modelsList
                    .filter(m => m.name.toLowerCase().includes(modelQuery.toLowerCase()))
                    .map(m => (
                      <TouchableOpacity
                        key={m.id}
                        style={[
                          styles.rowTile, 
                          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                          model === m.name && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                        ]}
                        onPress={() => {
                          setModel(m.name);
                          setSelectedModelObj(m);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.rowTileText, 
                          { color: theme.text },
                          model === m.name && { color: theme.primary }
                        ]}>{m.name}</Text>
                        {model === m.name && <Check size={18} color={theme.primary} />}
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>
          )}

          {/* STEP 3: Problems */}
          {step === 3 && (
            <View>
              <Card style={styles.selectedCard}>
                <Smartphone size={24} color={theme.primary} />
                <View style={styles.selectedCardInfo}>
                  <Text style={[styles.selectedCardLabel, { color: theme.textSecondary }]}>Device</Text>
                  <Text style={[styles.selectedCardValue, { color: theme.text }]}>{brand} {model}</Text>
                </View>
              </Card>

              <View style={styles.listContainer}>
                {problems.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.rowTile, 
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      selectedProblems.includes(p) && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                    ]}
                    onPress={() => toggleProblem(p)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.rowTileText, 
                      { color: theme.text },
                      selectedProblems.includes(p) && { color: theme.primary }
                    ]}>{p}</Text>
                    {selectedProblems.includes(p) && <Check size={18} color={theme.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* STEP 4: Tell us more */}
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
              <Text style={[styles.hintText, { color: theme.textSecondary }]}>Photos help our certified technician prepare.</Text>
            </View>
          )}

          {/* STEP 5: Dynamic Model-Specific Services & Custom Pricing */}
          {step === 5 && (
            <View>
              <Card style={styles.selectedCard}>
                <Smartphone size={24} color={theme.primary} />
                <View style={styles.selectedCardInfo}>
                  <Text style={[styles.selectedCardLabel, { color: theme.textSecondary }]}>{brand}</Text>
                  <Text style={[styles.selectedCardValue, { color: theme.text }]}>{model}</Text>
                </View>
              </Card>

              {loadingServices ? (
                <View style={styles.loaderBox}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={[styles.loaderText, { color: theme.textSecondary }]}>Loading {model} custom pricing...</Text>
                </View>
              ) : (
                servicesList.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.serviceRowTile, 
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      serviceId === String(s.id) && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                    ]}
                    onPress={() => {
                      setServiceId(String(s.id));
                      setSelectedServiceObj(s);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[
                        styles.serviceRowName, 
                        { color: theme.text },
                        serviceId === String(s.id) && { color: theme.primary }
                      ]}>{s.service_name}</Text>
                      <Text style={[styles.serviceRowTag, { color: theme.textSecondary }]}>
                        ⭐ {s.part_quality} • 🛡️ {s.warranty}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.serviceRowPrice, { color: theme.text }]}>{inr(s.price)}</Text>
                      {serviceId === String(s.id) && <Check size={16} color={theme.primary} style={{ marginTop: 4 }} />}
                    </View>
                  </TouchableOpacity>
                ))
              )}

              <View style={[styles.warningBox, { backgroundColor: isDark ? '#451a03' : '#fffbeb' }]}>
                <Text style={[styles.warningText, { color: isDark ? '#fde68a' : '#b45309' }]}>
                  All repairs include 6-month genuine parts warranty.
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
                      styles.dateTile, 
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      day === i && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                    ]}
                    onPress={() => setDay(i)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dateDay, 
                      { color: theme.textSecondary },
                      day === i && { color: theme.primary }
                    ]}>{d.label}</Text>
                    <Text style={[
                      styles.dateNum, 
                      { color: theme.text },
                      day === i && { color: theme.primary }
                    ]}>{d.date}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.subHeading, { color: theme.text, marginTop: 24 }]}>Time Slot</Text>
              <View style={styles.slotGrid}>
                {timeSlots.map((t) => (
                  <TouchableOpacity
                    key={t.time}
                    style={[
                      styles.slotTile, 
                      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                      slot === t.time && { borderColor: theme.primary, backgroundColor: theme.primarySoft },
                      !t.available && { opacity: 0.4 }
                    ]}
                    onPress={() => t.available && setSlot(t.time)}
                    disabled={!t.available}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.slotText, 
                      { color: theme.text },
                      slot === t.time && { color: theme.primary }
                    ]}>{t.time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* STEP 7: Repair Method */}
          {step === 7 && (
            <View>
              {[
                { id: "pickup", icon: Truck, title: "Doorstep Pickup & Delivery", desc: "Our executive collects your phone from your doorstep (₹99)" },
                { id: "store", icon: Store, title: "Visit Fixly Service Hub", desc: "Walk in to our nearest certified service center (Free)" },
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
                  <m.icon size={24} color={method === m.id ? theme.primary : theme.textSecondary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
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
            </View>
          )}

          {/* STEP 9: Summary & MySQL Booking Confirmation */}
          {step === 9 && (
            <View>
              <Card style={styles.summaryCard}>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Customer</Text><Text style={[styles.kvValue, { color: theme.text }]}>{user?.name || CUSTOMER_NAME || "Rahul Sharma"}</Text></View>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Device</Text><Text style={[styles.kvValue, { color: theme.text }]}>{brand} {model}</Text></View>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Problem</Text><Text style={[styles.kvValue, { color: theme.text }]}>{selectedProblems.join(", ") || "Diagnostic Repair"}</Text></View>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Service</Text><Text style={[styles.kvValue, { color: theme.text }]}>{selectedServiceObj?.service_name ?? "Screen Replacement"}</Text></View>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Appointment</Text><Text style={[styles.kvValue, { color: theme.text }]}>{appointmentDays[day]?.date} 2026, {slot || "11:00 AM"}</Text></View>
                <View style={[styles.kvRow, { borderBottomColor: theme.divider }]}><Text style={[styles.kvKey, { color: theme.textSecondary }]}>Method</Text><Text style={[styles.kvValue, { color: theme.text }]}>{method === "pickup" ? "Doorstep Pickup & Delivery" : "Visit Store"}</Text></View>
              </Card>

              <Card style={styles.priceCard}>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Estimated Service</Text>
                  <Text style={[styles.priceValue, { color: theme.text }]}>{inr(currentServicePrice)}</Text>
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
                  Final repair amount will be confirmed after doorstep inspection.
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
            style={[styles.btn, styles.btnPrimary, isSubmitting && styles.btnDisabled]} 
            onPress={handleConfirmBooking}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Confirm · {inr(total)}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  backButtonPlaceholder: { width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  progressContainer: { height: 4, width: '100%' },
  progressBar: { height: 4 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  stepSub: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  stepTitle: { fontSize: 20, fontWeight: '800', marginTop: 4, marginBottom: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  tileText: { fontSize: 14, fontWeight: '700' },
  listContainer: { gap: 10 },
  rowTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  rowTileText: { fontSize: 14, fontWeight: '700' },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  selectedCardInfo: { flex: 1 },
  selectedCardLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  selectedCardValue: { fontSize: 15, fontWeight: '800', marginTop: 1 },
  textArea: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 14,
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 20,
  },
  subHeading: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  photoGrid: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  photoBox: {
    width: 70,
    height: 70,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoBox: {
    width: 70,
    height: 70,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    padding: 2,
  },
  hintText: { fontSize: 12, marginTop: 4 },
  serviceRowTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  serviceRowName: { fontSize: 15, fontWeight: '800' },
  serviceRowTag: { fontSize: 12, marginTop: 2 },
  serviceRowPrice: { fontSize: 16, fontWeight: '900' },
  warningBox: { padding: 12, borderRadius: 12, marginTop: 8 },
  warningText: { fontSize: 12, fontWeight: '600' },
  dateScroll: { flexDirection: 'row', marginBottom: 8 },
  dateTile: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  dateDay: { fontSize: 12, fontWeight: '600' },
  dateNum: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotTile: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  slotText: { fontSize: 13, fontWeight: '700' },
  methodDesc: { fontSize: 12, marginTop: 2 },
  addAddressBtn: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 10,
  },
  addAddressText: { fontSize: 14, fontWeight: '700' },
  summaryCard: { padding: 14, borderRadius: 16, marginBottom: 12 },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  kvKey: { fontSize: 13 },
  kvValue: { fontSize: 13, fontWeight: '700' },
  priceCard: { padding: 16, borderRadius: 16, marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 13 },
  priceValue: { fontSize: 13, fontWeight: '700' },
  priceSuccess: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  priceTotalLabel: { fontSize: 15, fontWeight: '800' },
  priceTotalValue: { fontSize: 17, fontWeight: '900' },
  divider: { height: 1, marginVertical: 8 },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  btn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondary: { width: 80, borderWidth: 1 },
  btnSecondaryText: { fontSize: 14, fontWeight: '700' },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    gap: 6,
  },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
  loaderBox: { padding: 30, alignItems: 'center', gap: 8 },
  loaderText: { fontSize: 12 },
});
