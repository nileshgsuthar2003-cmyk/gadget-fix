import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  Modal, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, Search, Smartphone, ShieldCheck, BatteryCharging, 
  Check, X, Truck, CreditCard, Sparkles, Tag 
} from 'lucide-react-native';
import Card from '../components/Card';
import { refurbishedPhones, RefurbishedPhone, inr, brands, CUSTOMER_NAME } from '../lib/data';
import { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

export default function BuyPhonesScreen({ navigation }: RootStackScreenProps<'BuyPhones'>) {
  const { theme, isDark } = useTheme();

  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Checkout Modal State
  const [selectedPhone, setSelectedPhone] = useState<RefurbishedPhone | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('B-42, Rose Apartments, Andheri West, Mumbai 400053');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('upi');

  const filteredPhones = useMemo(() => {
    return refurbishedPhones.filter((phone) => {
      const matchBrand = selectedBrand === 'All' || phone.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchCondition = selectedCondition === 'All' || phone.condition.toLowerCase() === selectedCondition.toLowerCase();
      const matchQuery = phone.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         phone.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBrand && matchCondition && matchQuery;
    });
  }, [selectedBrand, selectedCondition, searchQuery]);

  const handleOpenBuy = (phone: RefurbishedPhone) => {
    setSelectedPhone(phone);
    setModalVisible(true);
  };

  const handlePlaceOrder = () => {
    if (!selectedPhone) return;
    setModalVisible(false);
    Alert.alert(
      "Order Confirmed! 🎉",
      `Your order for ${selectedPhone.model} (${selectedPhone.storage}) has been placed.\nEstimated Delivery: 2-3 Days.\nFree 6-month warranty included!`,
      [{ text: "Done", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Buy Refurbished Phones</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Banner */}
        <View style={[styles.trustBanner, { backgroundColor: theme.primarySoft, borderColor: theme.cardBorder }]}>
          <View style={styles.trustBannerHeader}>
            <Sparkles size={20} color={theme.primary} />
            <Text style={[styles.trustBannerTitle, { color: theme.primary }]}>Fixly Certified Refurbished</Text>
          </View>
          <Text style={[styles.trustBannerSubtitle, { color: theme.textSecondary }]}>
            • 32 Quality Checks Passed  • 6 Months Warranty  • 7 Days Replacement
          </Text>
        </View>

        {/* Search Input */}
        <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <Search size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search refurbished phones (e.g. iPhone, S23)..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Brand Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['All', 'Apple', 'Samsung', 'OnePlus', 'Google'].map((brand) => (
            <TouchableOpacity
              key={brand}
              style={[
                styles.filterPill,
                { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                selectedBrand === brand && { backgroundColor: theme.primary, borderColor: theme.primary }
              ]}
              onPress={() => setSelectedBrand(brand)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterPillText,
                { color: theme.textSecondary },
                selectedBrand === brand && { color: '#ffffff', fontWeight: '700' }
              ]}>{brand}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Condition Filters */}
        <View style={styles.conditionRow}>
          <Text style={[styles.conditionLabel, { color: theme.textSecondary }]}>Condition:</Text>
          {['All', 'Superb', 'Good', 'Fair'].map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.conditionPill,
                { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                selectedCondition === c && { backgroundColor: theme.primarySoft, borderColor: theme.primary }
              ]}
              onPress={() => setSelectedCondition(c)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.conditionPillText,
                { color: theme.textMuted },
                selectedCondition === c && { color: theme.primary, fontWeight: '700' }
              ]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Product Cards */}
        <View style={styles.productList}>
          {filteredPhones.map((phone) => {
            const savings = phone.originalPrice - phone.price;

            return (
              <Card key={phone.id} style={styles.productCard}>
                <View style={styles.productTopRow}>
                  <View style={[styles.phoneIconBox, { backgroundColor: theme.primarySoft }]}>
                    <Smartphone size={32} color={theme.primary} />
                  </View>
                  <View style={styles.productMainInfo}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.conditionBadge, { backgroundColor: theme.primarySoft }]}>
                        <Text style={[styles.conditionBadgeText, { color: theme.primary }]}>{phone.condition}</Text>
                      </View>
                      <View style={[styles.batteryBadge, { backgroundColor: isDark ? '#064e3b' : '#dcfce7' }]}>
                        <BatteryCharging size={12} color={isDark ? '#34d399' : '#166534'} />
                        <Text style={[styles.batteryBadgeText, { color: isDark ? '#34d399' : '#166534' }]}>
                          {phone.batteryHealth}% Battery
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.productTitle, { color: theme.text }]}>{phone.model}</Text>
                    <Text style={[styles.productSpecs, { color: theme.textSecondary }]}>
                      {phone.storage} • {phone.color}
                    </Text>
                  </View>
                </View>

                {/* Warranty & Guarantee */}
                <View style={[styles.warrantyRow, { backgroundColor: isDark ? '#1e1b4b' : '#f8fafc', borderColor: theme.cardBorder }]}>
                  <ShieldCheck size={16} color={theme.primary} />
                  <Text style={[styles.warrantyText, { color: theme.textSecondary }]}>{phone.warranty}</Text>
                </View>

                {/* Price & CTA Row */}
                <View style={styles.productBottomRow}>
                  <View>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.currentPrice, { color: theme.text }]}>{inr(phone.price)}</Text>
                      <Text style={[styles.originalPrice, { color: theme.textMuted }]}>{inr(phone.originalPrice)}</Text>
                    </View>
                    <Text style={styles.savingsText}>Save {inr(savings)}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.buyBtn, { backgroundColor: theme.primary }]}
                    onPress={() => handleOpenBuy(phone)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buyBtnText}>Buy Now</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}

          {filteredPhones.length === 0 && (
            <View style={styles.emptyContainer}>
              <Smartphone size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Phones Found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Try adjusting your brand or condition filters.
              </Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Checkout / Order Sheet Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Purchase</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            {selectedPhone && (
              <ScrollView style={{ maxHeight: 400 }}>
                {/* Item Details */}
                <View style={[styles.modalItemCard, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                  <Smartphone size={28} color={theme.primary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.modalItemTitle, { color: theme.text }]}>{selectedPhone.model}</Text>
                    <Text style={[styles.modalItemSpecs, { color: theme.textSecondary }]}>
                      {selectedPhone.storage} • {selectedPhone.color} • {selectedPhone.condition} Condition
                    </Text>
                    <Text style={[styles.modalItemPrice, { color: theme.primary }]}>{inr(selectedPhone.price)}</Text>
                  </View>
                </View>

                {/* Delivery Address */}
                <Text style={[styles.modalSectionLabel, { color: theme.text }]}>Delivery Address</Text>
                <View style={[styles.modalAddressBox, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                  <Truck size={18} color={theme.primary} style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={[styles.modalAddressText, { color: theme.textSecondary }]}>{address}</Text>
                </View>

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
                      activeOpacity={0.7}
                    >
                      <pay.icon size={18} color={paymentMethod === pay.id ? theme.primary : theme.textSecondary} />
                      <Text style={[
                        styles.paymentPillText,
                        { color: theme.text },
                        paymentMethod === pay.id && { color: theme.primary, fontWeight: '700' }
                      ]}>{pay.label}</Text>
                      {paymentMethod === pay.id && <Check size={16} color={theme.primary} style={{ marginLeft: 'auto' }} />}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Total Summary */}
                <View style={[styles.modalPriceSummary, { borderTopColor: theme.divider }]}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Price</Text>
                    <Text style={[styles.summaryVal, { color: theme.text }]}>{inr(selectedPhone.price)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Delivery Fee</Text>
                    <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 13 }}>FREE</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>6-Month Warranty</Text>
                    <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 13 }}>INCLUDED</Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: theme.divider }]} />
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryTotalLabel, { color: theme.text }]}>Total Amount</Text>
                    <Text style={[styles.summaryTotalVal, { color: theme.primary }]}>{inr(selectedPhone.price)}</Text>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Place Order CTA */}
            <TouchableOpacity
              style={[styles.confirmOrderBtn, { backgroundColor: theme.primary }]}
              onPress={handlePlaceOrder}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmOrderBtnText}>
                Place Order • {selectedPhone ? inr(selectedPhone.price) : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  trustBanner: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  trustBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  trustBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  trustBannerSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  filterScroll: {
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  conditionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  conditionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  conditionPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productList: {
    gap: 12,
  },
  productCard: {
    padding: 16,
    borderRadius: 20,
  },
  productTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  phoneIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  productMainInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  conditionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  batteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  batteryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  productSpecs: {
    fontSize: 13,
    fontWeight: '500',
  },
  warrantyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  warrantyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
    marginTop: 2,
  },
  buyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  modalItemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalItemSpecs: {
    fontSize: 12,
    marginTop: 2,
  },
  modalItemPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  modalSectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalAddressBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  modalAddressText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  paymentOptions: {
    gap: 8,
    marginBottom: 16,
  },
  paymentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  paymentPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalPriceSummary: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 18,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 4,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  summaryTotalVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  confirmOrderBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmOrderBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
