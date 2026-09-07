import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  Modal, Alert, ActivityIndicator, Image, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, Smartphone, ShieldCheck, BatteryCharging, 
  Check, X, Truck, CreditCard, Sparkles, Home as HomeIcon, Building2, MapPin
} from 'lucide-react-native';
import { api, BACKEND_URL } from '../lib/api';
import { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

function inr(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}

export default function PhoneDetailsScreen({ route, navigation }: RootStackScreenProps<'PhoneDetails'>) {
  const { phone } = route.params;
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  
  const userSavedAddresses = user?.addresses || [];
  const [addressId, setAddressId] = useState<string>(userSavedAddresses.length > 0 ? userSavedAddresses[0].id : '');
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('upi');
  const [submitting, setSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const savings = phone.original_price - phone.price;

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to place an order.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") }
      ]);
      return;
    }
    if (!addressId) {
      Alert.alert("Address Required", "Please select a delivery address.");
      return;
    }
    setSubmitting(true);
    try {
      const selectedAddr = userSavedAddresses.find(a => a.id === addressId);
      const addressString = selectedAddr ? (selectedAddr.line || [(selectedAddr as any).flat, (selectedAddr as any).street, (selectedAddr as any).landmark, `${(selectedAddr as any).city || ''} ${(selectedAddr as any).pincode || ''}`].filter(Boolean).join(', ')) : '';

      const res = await api.submitBuyRequest(phone.id, {
        customer_name: user.name || `${user.first_name} ${user.last_name}`,
        customer_phone: user.phone,
        customer_email: user.email,
        address: addressString,
        payment_method: paymentMethod,
        user_id: user.id,
      });
      setModalVisible(false);
      if (res.success) {
        Alert.alert(
          "Order Confirmed! 🎉",
          `Your order for ${phone.brand} ${phone.model} (${phone.storage}) has been placed.\nEstimated Delivery: 2-3 Days.\nFree 6-month warranty included!`,
          [{ text: "Done", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Error", res.error || 'Failed to place order.');
      }
    } catch (err) {
      Alert.alert("Error", 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Phone Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* Images Carousel */}
        <View style={[styles.carouselContainer, { backgroundColor: theme.surface }]}>
          {phone.images && phone.images.length > 0 ? (
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setActiveImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {phone.images.map((img, index) => (
                <Image 
                  key={index}
                  source={{ uri: img.startsWith('http') ? img : `${BACKEND_URL}${img}` }}
                  style={{ width, height: 300, resizeMode: 'contain' }}
                />
              ))}
            </ScrollView>
          ) : (
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop' }} 
              style={{ width, height: 300, resizeMode: 'cover' }} 
            />
          )}
          
          {phone.images && phone.images.length > 1 && (
            <View style={styles.pagination}>
              {phone.images.map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.paginationDot,
                    activeImageIndex === index ? { backgroundColor: theme.primary, width: 24 } : { backgroundColor: theme.textMuted }
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Title & Price */}
          <Text style={[styles.title, { color: theme.text }]}>{phone.brand} {phone.model}</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.currentPrice, { color: theme.text }]}>{inr(phone.price)}</Text>
            <Text style={[styles.originalPrice, { color: theme.textMuted }]}>{inr(phone.original_price)}</Text>
            <Text style={styles.savings}>Save {inr(savings)}</Text>
          </View>

          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>Condition: {phone.condition}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: isDark ? '#064e3b' : '#dcfce7' }]}>
              <BatteryCharging size={14} color={isDark ? '#34d399' : '#166534'} />
              <Text style={[styles.badgeText, { color: isDark ? '#34d399' : '#166534' }]}>{phone.battery_health}% Battery</Text>
            </View>
          </View>

          {/* Specs */}
          <View style={[styles.specsBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Storage</Text>
              <Text style={[styles.specValue, { color: theme.text }]}>{phone.storage}</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Color</Text>
              <Text style={[styles.specValue, { color: theme.text }]}>{phone.color}</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Warranty</Text>
              <Text style={[styles.specValue, { color: theme.primary, fontSize: 13 }]} numberOfLines={2}>
                {phone.warranty}
              </Text>
            </View>
          </View>

          {/* Description */}
          {phone.description && (
            <View style={[styles.descriptionBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
              <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>{phone.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Buy Button */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.cardBorder }]}>
        <View>
          <Text style={[styles.bottomPrice, { color: theme.text }]}>{inr(phone.price)}</Text>
          <Text style={[styles.bottomSubtext, { color: theme.textMuted }]}>Free Delivery</Text>
        </View>
        <TouchableOpacity 
          style={[styles.buyNowBtn, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Checkout Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalTopBar}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.modalHeading, { color: theme.text }]}>
                  Confirm Purchase
                </Text>
                <Text style={[styles.modalSubheading, { color: theme.textSecondary }]}>
                  Review your order details below
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeIconBtn}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 400 }}>
              <View style={[styles.modalItemCard, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                {phone.images && phone.images.length > 0 ? (
                  <Image 
                    source={{ uri: phone.images[0].startsWith('http') ? phone.images[0] : `${BACKEND_URL}${phone.images[0]}` }}
                    style={{ width: 48, height: 48, borderRadius: 12 }}
                  />
                ) : (
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop' }} 
                    style={{ width: 48, height: 48, borderRadius: 12 }} 
                  />
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.modalItemTitle, { color: theme.text }]}>{phone.brand} {phone.model}</Text>
                  <Text style={[styles.modalItemSpecs, { color: theme.textSecondary }]}>{phone.storage} • {phone.color}</Text>
                  <Text style={[styles.modalItemPrice, { color: theme.primary }]}>{inr(phone.price)}</Text>
                </View>
              </View>

              {/* Delivery Address */}
              <Text style={[styles.modalSectionLabel, { color: theme.text }]}>Delivery Address</Text>
              
              {userSavedAddresses.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 20, backgroundColor: theme.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.cardBorder, marginBottom: 16 }}>
                  <MapPin size={28} color={theme.textMuted} style={{ marginBottom: 8 }} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 4 }}>No Saved Addresses</Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 12 }}>Please add a delivery address in your profile to proceed.</Text>
                  <TouchableOpacity onPress={() => { setModalVisible(false); navigation.navigate('Profile'); }} style={{ backgroundColor: theme.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Go to Profile</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 8, marginBottom: 16 }}>
                  {userSavedAddresses.map(a => {
                    const IconComp = a.type === 'Home' ? HomeIcon : (a.type === 'Office' ? Building2 : MapPin);
                    const isSelected = addressId === a.id;
                    const displayLine = a.line || [(a as any).flat, (a as any).street, (a as any).landmark, `${(a as any).city || ''} ${(a as any).pincode || ''}`].filter(Boolean).join(', ');

                    return (
                      <TouchableOpacity
                        key={a.id}
                        style={[
                          { flexDirection: 'row', padding: 12, borderRadius: 14, borderWidth: 1, backgroundColor: theme.background, borderColor: theme.cardBorder, alignItems: 'flex-start' },
                          isSelected && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                        ]}
                        onPress={() => setAddressId(a.id)}
                        activeOpacity={0.7}
                      >
                        <IconComp size={20} color={isSelected ? theme.primary : theme.textSecondary} style={{ marginTop: 2 }} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[
                              { fontSize: 14, fontWeight: '700', color: theme.text },
                              isSelected && { color: theme.primary }
                            ]}>{a.type}</Text>
                            {a.is_default && (
                              <View style={{ backgroundColor: theme.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>DEFAULT</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[{ fontSize: 12, lineHeight: 18, marginTop: 4, color: theme.textSecondary }]}>{displayLine}</Text>
                        </View>
                        {isSelected && <Check size={20} color={theme.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Payment Method */}
              <Text style={[styles.modalSectionLabel, { color: theme.text }]}>Payment Method</Text>
              <View style={styles.paymentOptions}>
                {[
                  { id: 'upi', label: 'UPI / Instant Online', icon: Sparkles },
                  { id: 'cod', label: 'Cash on Delivery (COD)', icon: Truck },
                  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                ].map((pay) => (
                  <TouchableOpacity
                    key={pay.id}
                    style={[
                      styles.paymentPill,
                      { backgroundColor: theme.background, borderColor: theme.cardBorder },
                      paymentMethod === pay.id && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                    ]}
                    onPress={() => setPaymentMethod(pay.id as any)}
                  >
                    <pay.icon size={18} color={paymentMethod === pay.id ? theme.primary : theme.textSecondary} />
                    <Text style={[styles.paymentPillText, { color: theme.text }, paymentMethod === pay.id && { color: theme.primary, fontWeight: '700' }]}>
                      {pay.label}
                    </Text>
                    {paymentMethod === pay.id && <Check size={16} color={theme.primary} style={{ marginLeft: 'auto' }} />}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Place Order CTA */}
            <TouchableOpacity
              style={[styles.confirmOrderBtn, { backgroundColor: theme.primary, opacity: submitting ? 0.6 : 1 }]}
              onPress={handlePlaceOrder}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmOrderBtnText}>Place Order • {inr(phone.price)}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  container: { flex: 1 },
  carouselContainer: { width: '100%', height: 300, position: 'relative' },
  placeholderImage: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  pagination: { flexDirection: 'row', position: 'absolute', bottom: 16, alignSelf: 'center', gap: 6 },
  paginationDot: { height: 6, width: 6, borderRadius: 3 },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  currentPrice: { fontSize: 24, fontWeight: '800' },
  originalPrice: { fontSize: 16, textDecorationLine: 'line-through' },
  savings: { fontSize: 14, fontWeight: '700', color: '#16a34a' },
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  specsBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20 },
  specItem: { flex: 1, alignItems: 'center' },
  specLabel: { fontSize: 12, marginBottom: 4, fontWeight: '500' },
  specValue: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  specDivider: { width: 1, height: '100%', backgroundColor: '#e2e8f0' },
  descriptionBox: { padding: 16, borderWidth: 1, borderRadius: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  descriptionText: { fontSize: 14, lineHeight: 22 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderTopWidth: 1 },
  bottomPrice: { fontSize: 20, fontWeight: '800' },
  bottomSubtext: { fontSize: 12, fontWeight: '500' },
  buyNowBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  buyNowText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 24, paddingBottom: 40 },
  modalTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, width: '100%' },
  modalHeading: { fontSize: 18, fontWeight: '800' },
  modalSubheading: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  closeIconBtn: { padding: 4, backgroundColor: '#f1f5f9', borderRadius: 20 },
  modalItemCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  modalItemTitle: { fontSize: 15, fontWeight: '700' },
  modalItemSpecs: { fontSize: 12, marginTop: 2 },
  modalItemPrice: { fontSize: 15, fontWeight: '800', marginTop: 4 },
  modalSectionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  modalAddressBox: { flexDirection: 'row', padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  paymentOptions: { gap: 8, marginBottom: 24 },
  paymentPill: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, gap: 10 },
  paymentPillText: { fontSize: 14, fontWeight: '600' },
  confirmOrderBtn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  confirmOrderBtnText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
});
