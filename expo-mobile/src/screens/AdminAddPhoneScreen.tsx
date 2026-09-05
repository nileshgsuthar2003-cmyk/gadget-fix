import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, ActivityIndicator, RefreshControl, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, Plus, Smartphone, Trash2, Edit3, X,
  BatteryCharging, Tag, Package, Check, ShieldCheck
} from 'lucide-react-native';
import { api, ApiUsedPhone } from '../lib/api';
import { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

const CONDITION_OPTIONS = ['Superb', 'Good', 'Fair'] as const;
const STORAGE_OPTIONS = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];

function inr(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}

export default function AdminAddPhoneScreen({ navigation }: RootStackScreenProps<'AdminAddPhone'>) {
  const { theme, isDark } = useTheme();

  const [phones, setPhones] = useState<ApiUsedPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPhone, setEditingPhone] = useState<ApiUsedPhone | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [storage, setStorage] = useState('128 GB');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState<'Superb' | 'Good' | 'Fair'>('Good');
  const [batteryHealth, setBatteryHealth] = useState('90');
  const [originalPrice, setOriginalPrice] = useState('');
  const [price, setPrice] = useState('');
  const [warranty, setWarranty] = useState('6 Months Fixly Warranty');
  const [description, setDescription] = useState('');

  const fetchPhones = useCallback(async () => {
    try {
      const res = await api.getAdminUsedPhones();
      if (res.success && Array.isArray(res.phones)) {
        setPhones(res.phones);
      }
    } catch (err) {
      console.warn('Failed to fetch used phones:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPhones();
  }, [fetchPhones]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPhones();
  };

  const resetForm = () => {
    setBrand('');
    setModel('');
    setStorage('128 GB');
    setColor('');
    setCondition('Good');
    setBatteryHealth('90');
    setOriginalPrice('');
    setPrice('');
    setWarranty('6 Months Fixly Warranty');
    setDescription('');
    setEditingPhone(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (phone: ApiUsedPhone) => {
    setEditingPhone(phone);
    setBrand(phone.brand);
    setModel(phone.model);
    setStorage(phone.storage);
    setColor(phone.color);
    setCondition(phone.condition);
    setBatteryHealth(String(phone.battery_health));
    setOriginalPrice(String(phone.original_price));
    setPrice(String(phone.price));
    setWarranty(phone.warranty);
    setDescription(phone.description || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!brand.trim() || !model.trim() || !originalPrice.trim() || !price.trim()) {
      Alert.alert('Missing Fields', 'Please fill in Brand, Model, Original Price, and Selling Price.');
      return;
    }

    setSaving(true);
    try {
      if (editingPhone) {
        const res = await api.updateUsedPhone(editingPhone.id, {
          brand: brand.trim(),
          model: model.trim(),
          storage,
          color: color.trim() || 'Black',
          condition,
          battery_health: parseInt(batteryHealth) || 90,
          original_price: parseFloat(originalPrice),
          price: parseFloat(price),
          warranty: warranty.trim(),
          description: description.trim() || undefined,
        });
        if (res.success) {
          Alert.alert('Updated! ✅', 'Listing updated successfully.');
          setModalVisible(false);
          fetchPhones();
        } else {
          Alert.alert('Error', res.error || 'Failed to update listing.');
        }
      } else {
        const res = await api.createUsedPhone({
          brand: brand.trim(),
          model: model.trim(),
          storage,
          color: color.trim() || 'Black',
          condition,
          battery_health: parseInt(batteryHealth) || 90,
          original_price: parseFloat(originalPrice),
          price: parseFloat(price),
          warranty: warranty.trim(),
          description: description.trim() || undefined,
        });
        if (res.success) {
          Alert.alert('Added! 🎉', 'New phone listing created successfully.');
          setModalVisible(false);
          fetchPhones();
        } else {
          Alert.alert('Error', res.error || 'Failed to create listing.');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (phone: ApiUsedPhone) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${phone.brand} ${phone.model}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await api.deleteUsedPhone(phone.id);
            if (res.success) {
              fetchPhones();
            } else {
              Alert.alert('Error', res.error || 'Failed to delete.');
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (phone: ApiUsedPhone) => {
    const res = await api.updateUsedPhone(phone.id, { is_active: !phone.is_active } as any);
    if (res.success) {
      fetchPhones();
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Manage Used Phones</Text>
        <TouchableOpacity onPress={openAddModal} style={[styles.addBtn, { backgroundColor: theme.primary }]}>
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: theme.primarySoft, borderBottomColor: theme.cardBorder }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{phones.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Listings</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#16a34a' }]}>{phones.filter(p => p.is_active).length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.textMuted }]}>{phones.filter(p => !p.is_active).length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Inactive</Text>
        </View>
      </View>

      {/* Phone Listings */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading listings...</Text>
          </View>
        ) : phones.length === 0 ? (
          <View style={styles.centerBox}>
            <Package size={56} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Listings Yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Tap the + button to add your first used phone listing.
            </Text>
          </View>
        ) : (
          <View style={styles.phoneList}>
            {phones.map((phone) => (
              <View
                key={phone.id}
                style={[
                  styles.phoneCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: phone.is_active ? theme.cardBorder : (isDark ? '#7f1d1d' : '#fecaca'),
                  },
                ]}
              >
                {/* Top Row: Icon + Info */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.phoneIconBox, { backgroundColor: theme.primarySoft }]}>
                    <Smartphone size={28} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameBadgeRow}>
                      <Text style={[styles.phoneName, { color: theme.text }]} numberOfLines={1}>
                        {phone.brand} {phone.model}
                      </Text>
                      {!phone.is_active && (
                        <View style={[styles.inactiveBadge, { backgroundColor: isDark ? '#7f1d1d' : '#fef2f2' }]}>
                          <Text style={[styles.inactiveBadgeText, { color: isDark ? '#fca5a5' : '#dc2626' }]}>Inactive</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.phoneSpecs, { color: theme.textSecondary }]}>
                      {phone.storage} • {phone.color} • {phone.condition}
                    </Text>
                  </View>
                </View>

                {/* Details Row */}
                <View style={styles.detailRow}>
                  <View style={[styles.detailChip, { backgroundColor: isDark ? '#064e3b' : '#dcfce7' }]}>
                    <BatteryCharging size={12} color={isDark ? '#34d399' : '#166534'} />
                    <Text style={[styles.detailChipText, { color: isDark ? '#34d399' : '#166534' }]}>
                      {phone.battery_health}%
                    </Text>
                  </View>
                  <View style={[styles.detailChip, { backgroundColor: theme.primarySoft }]}>
                    <ShieldCheck size={12} color={theme.primary} />
                    <Text style={[styles.detailChipText, { color: theme.primary }]} numberOfLines={1}>
                      {phone.warranty}
                    </Text>
                  </View>
                  {(phone.buy_requests_count ?? 0) > 0 && (
                    <View style={[styles.detailChip, { backgroundColor: isDark ? '#78350f' : '#fef3c7' }]}>
                      <Tag size={12} color={isDark ? '#fbbf24' : '#92400e'} />
                      <Text style={[styles.detailChipText, { color: isDark ? '#fbbf24' : '#92400e' }]}>
                        {phone.buy_requests_count} requests
                      </Text>
                    </View>
                  )}
                </View>

                {/* Price + Actions Row */}
                <View style={styles.cardBottomRow}>
                  <View>
                    <Text style={[styles.phonePrice, { color: theme.primary }]}>{inr(phone.price)}</Text>
                    <Text style={[styles.phoneOriginalPrice, { color: theme.textMuted }]}>{inr(phone.original_price)}</Text>
                  </View>
                  <View style={styles.actionBtns}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: phone.is_active ? (isDark ? '#064e3b' : '#dcfce7') : (isDark ? '#78350f' : '#fef3c7') }]}
                      onPress={() => toggleActive(phone)}
                    >
                      {phone.is_active ? (
                        <Check size={16} color={isDark ? '#34d399' : '#166534'} />
                      ) : (
                        <Package size={16} color={isDark ? '#fbbf24' : '#92400e'} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.primarySoft }]}
                      onPress={() => openEditModal(phone)}
                    >
                      <Edit3 size={16} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: isDark ? '#7f1d1d' : '#fef2f2' }]}
                      onPress={() => handleDelete(phone)}
                    >
                      <Trash2 size={16} color={isDark ? '#fca5a5' : '#dc2626'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {editingPhone ? 'Edit Listing' : 'Add Used Phone'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                  <X size={22} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
                {/* Brand & Model Row */}
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Brand *</Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                      placeholder="e.g. Apple"
                      placeholderTextColor={theme.textMuted}
                      value={brand}
                      onChangeText={setBrand}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Model *</Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                      placeholder="e.g. iPhone 14"
                      placeholderTextColor={theme.textMuted}
                      value={model}
                      onChangeText={setModel}
                    />
                  </View>
                </View>

                {/* Storage */}
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Storage</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {STORAGE_OPTIONS.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.storagePill,
                        { backgroundColor: theme.background, borderColor: theme.cardBorder },
                        storage === s && { backgroundColor: theme.primarySoft, borderColor: theme.primary },
                      ]}
                      onPress={() => setStorage(s)}
                    >
                      <Text style={[
                        styles.storagePillText,
                        { color: theme.text },
                        storage === s && { color: theme.primary, fontWeight: '700' },
                      ]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Color & Battery */}
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Color</Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                      placeholder="e.g. Midnight Black"
                      placeholderTextColor={theme.textMuted}
                      value={color}
                      onChangeText={setColor}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Battery %</Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                      placeholder="90"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="numeric"
                      value={batteryHealth}
                      onChangeText={setBatteryHealth}
                    />
                  </View>
                </View>

                {/* Condition */}
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Condition</Text>
                <View style={styles.conditionRow}>
                  {CONDITION_OPTIONS.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.conditionPill,
                        { backgroundColor: theme.background, borderColor: theme.cardBorder },
                        condition === c && { backgroundColor: theme.primarySoft, borderColor: theme.primary },
                      ]}
                      onPress={() => setCondition(c)}
                    >
                      <Text style={[
                        styles.conditionPillText,
                        { color: theme.text },
                        condition === c && { color: theme.primary, fontWeight: '700' },
                      ]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Prices */}
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Original Price (₹) *</Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                      placeholder="69900"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="numeric"
                      value={originalPrice}
                      onChangeText={setOriginalPrice}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Selling Price (₹) *</Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                      placeholder="43999"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="numeric"
                      value={price}
                      onChangeText={setPrice}
                    />
                  </View>
                </View>

                {/* Warranty */}
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Warranty</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text, marginBottom: 14 }]}
                  placeholder="6 Months Fixly Warranty"
                  placeholderTextColor={theme.textMuted}
                  value={warranty}
                  onChangeText={setWarranty}
                />

                {/* Description */}
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Description (optional)</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text, height: 80, textAlignVertical: 'top', marginBottom: 14 }
                  ]}
                  placeholder="Any additional details about the phone..."
                  placeholderTextColor={theme.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </ScrollView>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: saving ? 0.6 : 1 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingPhone ? 'Update Listing' : 'Add Listing'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  addBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 28 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 14, marginTop: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptySubtitle: { fontSize: 14, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
  phoneList: { gap: 12 },
  phoneCard: {
    borderRadius: 20, borderWidth: 1.5, padding: 16,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  phoneIconBox: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  nameBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phoneName: { fontSize: 16, fontWeight: '800', flex: 1 },
  inactiveBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  inactiveBadgeText: { fontSize: 10, fontWeight: '700' },
  phoneSpecs: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  detailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  detailChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  detailChipText: { fontSize: 11, fontWeight: '700' },
  cardBottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  phonePrice: { fontSize: 18, fontWeight: '800' },
  phoneOriginalPrice: { fontSize: 12, textDecorationLine: 'line-through', marginTop: 2 },
  actionBtns: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 18,
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalCloseBtn: { padding: 4 },
  formRow: { flexDirection: 'row', marginBottom: 14 },
  formLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  formInput: {
    height: 46, borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, fontSize: 14,
  },
  storagePill: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, marginRight: 8,
  },
  storagePillText: { fontSize: 13, fontWeight: '600' },
  conditionRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  conditionPill: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, alignItems: 'center',
  },
  conditionPillText: { fontSize: 13, fontWeight: '600' },
  saveBtn: {
    height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 6,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
});
