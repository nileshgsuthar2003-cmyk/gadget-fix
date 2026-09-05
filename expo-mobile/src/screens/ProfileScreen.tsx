import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, 
  TextInput, Modal, ActivityIndicator, RefreshControl, KeyboardAvoidingView, Platform, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  HelpCircle,
  LogOut,
  MapPin,
  ClipboardList,
  Moon,
  Sun,
  Edit2,
  X,
  Plus,
  Building2,
  Home as HomeIcon,
  Phone,
  Mail,
  User as UserIcon,
  ShieldCheck,
  CreditCard,
  Lock,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import Card from '../components/Card';
import { inr, CUSTOMER_NAME } from '../lib/data';
import { api, ApiRepair, UserAddress } from '../lib/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout, updateUser } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [liveRepairs, setLiveRepairs] = useState<ApiRepair[]>([]);
  
  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || 'Rahul');
  const [lastName, setLastName] = useState(user?.last_name || 'Sharma');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [email, setEmail] = useState(user?.email || 'rahul@fixly.com');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Address Management States
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressViewMode, setAddressViewMode] = useState<'list' | 'form'>('list');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrType, setAddrType] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [addrCustomTag, setAddrCustomTag] = useState('');
  const [addrFlat, setAddrFlat] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [addresses, setAddresses] = useState<UserAddress[]>(
    user?.addresses && user.addresses.length > 0
      ? user.addresses
      : [
          { id: 'addr_1', type: 'Home', flat: 'B-42, Rose Apartments', street: 'Andheri West', landmark: 'Near Metro Station', city: 'Mumbai', pincode: '400053', line: 'B-42, Rose Apartments, Andheri West, Mumbai 400053', is_default: true },
          { id: 'addr_2', type: 'Office', flat: '3rd Floor, Trade View', street: 'Lower Parel', landmark: 'Kamala Mills Compound', city: 'Mumbai', pincode: '400013', line: '3rd Floor, Trade View, Lower Parel, Mumbai 400013', is_default: false },
        ]
  );

  // Fetch Live Profile & Live Bookings from MySQL API
  const fetchLiveProfile = useCallback(async () => {
    try {
      const [userRes, repairsRes] = await Promise.allSettled([
        api.getMe(user?.id),
        api.getMyRepairs(),
      ]);

      if (userRes.status === 'fulfilled' && userRes.value?.success && userRes.value?.user) {
        const u = userRes.value.user;
        updateUser(u);
        setFirstName(u.first_name || 'Rahul');
        setLastName(u.last_name || 'Sharma');
        setPhone(u.phone || '9876543210');
        setEmail(u.email || 'rahul@fixly.com');
        if (Array.isArray(u.addresses) && u.addresses.length > 0) {
          setAddresses(u.addresses);
        }
      }

      if (repairsRes.status === 'fulfilled' && repairsRes.value?.success && Array.isArray(repairsRes.value?.repairs)) {
        setLiveRepairs(repairsRes.value.repairs);
      }
    } catch (err) {
      console.warn('Could not fetch live profile from MySQL:', err);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  // Re-fetch whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchLiveProfile();
    }, [fetchLiveProfile])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLiveProfile();
  }, [fetchLiveProfile]);

  // Save Profile Changes (Synchronizes with MySQL DB)
  const handleSaveProfile = async () => {
    if (!firstName.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please enter your name and phone number.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        user_id: user?.id || 1,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const res = await api.updateProfile(payload);

      if (res && res.success && res.user) {
        updateUser(res.user);
        setIsEditModalOpen(false);
        setNewPassword('');
        Alert.alert('Success 🎉', 'Profile information updated successfully in database!');
      } else {
        Alert.alert('Update Failed', res?.error || 'Could not update profile details.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddrType('Home');
    setAddrCustomTag('');
    setAddrFlat('');
    setAddrStreet('');
    setAddrLandmark('');
    setAddrCity('Mumbai');
    setAddrPincode('');
    setAddrIsDefault(addresses.length === 0);
  };

  const handleOpenAddAddress = () => {
    resetAddressForm();
    setAddressViewMode('form');
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    const isStandard = addr.type === 'Home' || addr.type === 'Office';
    setAddrType(isStandard ? (addr.type as any) : 'Other');
    setAddrCustomTag(isStandard ? '' : addr.type);
    setAddrFlat(addr.flat || '');
    setAddrStreet(addr.street || '');
    setAddrLandmark(addr.landmark || '');
    setAddrCity(addr.city || 'Mumbai');
    setAddrPincode(addr.pincode || '');
    setAddrIsDefault(!!addr.is_default);
    setAddressViewMode('form');
  };

  const handleSaveAddress = async () => {
    if (!addrFlat.trim()) {
      Alert.alert('Required Field', 'Please enter flat / house no. / building.');
      return;
    }
    if (!addrStreet.trim()) {
      Alert.alert('Required Field', 'Please enter street / road / locality.');
      return;
    }
    if (!addrCity.trim()) {
      Alert.alert('Required Field', 'Please enter city name.');
      return;
    }
    if (!addrPincode.trim() || addrPincode.trim().length < 6) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit postal code.');
      return;
    }

    const effectiveType = addrType === 'Other' && addrCustomTag.trim() ? addrCustomTag.trim() : addrType;

    setIsSavingAddress(true);
    try {
      const payload = {
        id: editingAddressId || undefined,
        user_id: user?.id || 1,
        type: effectiveType,
        flat: addrFlat.trim(),
        street: addrStreet.trim(),
        landmark: addrLandmark.trim(),
        city: addrCity.trim(),
        pincode: addrPincode.trim(),
        is_default: addrIsDefault,
      };

      const res = await api.saveAddress(payload);
      if (res && res.success && res.addresses) {
        setAddresses(res.addresses);
        updateUser({ addresses: res.addresses });
        setAddressViewMode('list');
        resetAddressForm();
        Alert.alert('Success 🎉', editingAddressId ? 'Address updated successfully!' : 'New address saved to your profile!');
      } else {
        Alert.alert('Save Failed', res?.error || 'Could not save address.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const target = addresses.find(a => a.id === id);
    if (!target) return;
    try {
      const res = await api.saveAddress({
        ...target,
        user_id: user?.id || 1,
        is_default: true,
      });
      if (res && res.success && res.addresses) {
        setAddresses(res.addresses);
        updateUser({ addresses: res.addresses });
      }
    } catch (err) {
      console.warn('Failed to set default address', err);
    }
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this saved address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.deleteAddress(id, user?.id || 1);
              if (res && res.success && res.addresses) {
                setAddresses(res.addresses);
                updateUser({ addresses: res.addresses });
              } else {
                setAddresses(prev => prev.filter(a => a.id !== id));
              }
            } catch (err) {
              setAddresses(prev => prev.filter(a => a.id !== id));
            }
          },
        },
      ]
    );
  };

  const customerFullName = user ? `${user.first_name} ${user.last_name}` : (CUSTOMER_NAME || 'Rahul Sharma');
  const customerPhone = user?.phone || '+91 98765 43210';
  const customerEmail = user?.email || 'rahul@fixly.com';
  
  // Calculate Live Dynamic Metrics
  const repairsCount = liveRepairs.length > 0 ? liveRepairs.length : (user?.repairs_count ?? 2);
  const totalSpentAmount = liveRepairs.length > 0 
    ? liveRepairs.reduce((acc, r) => acc + (Number(r.estimate) || 0), 0)
    : (Number(user?.total_spent) || 4500);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of Fixly?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: () => {
            logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      
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
        
        {/* Dynamic Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarLetter}>{customerFullName.charAt(0).toUpperCase()}</Text>
          </View>

          <Text style={[styles.profileName, { color: theme.text }]}>{customerFullName}</Text>
          <Text style={[styles.profileContact, { color: theme.textSecondary }]}>
            {customerPhone} • {customerEmail}
          </Text>

          <TouchableOpacity 
            style={[styles.editPillBtn, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={() => {
              setFirstName(user?.first_name || 'Rahul');
              setLastName(user?.last_name || 'Sharma');
              setPhone(user?.phone || '9876543210');
              setEmail(user?.email || 'rahul@fixly.com');
              setIsEditModalOpen(true);
            }}
            activeOpacity={0.7}
          >
            <Edit2 size={13} color={theme.primary} />
            <Text style={[styles.editPillText, { color: theme.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Orders & Places */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>ACCOUNT & ACTIVITY</Text>
          
          <View style={[styles.menuGroup, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            {/* My Repairs */}
            <TouchableOpacity 
              style={[styles.menuRow, { borderBottomColor: theme.divider }]}
              onPress={() => (navigation as any).navigate('MyRepairs')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: theme.primarySoft }]}>
                <ClipboardList size={18} color={theme.primary} />
              </View>
              <Text style={[styles.menuTitle, { color: theme.text }]}>My Repair Orders</Text>
              <View style={styles.menuRightSide}>
                <View style={[styles.countBadge, { backgroundColor: theme.primarySoft }]}>
                  <Text style={[styles.countBadgeText, { color: theme.primary }]}>{repairsCount}</Text>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </View>
            </TouchableOpacity>

            {/* Saved Addresses */}
            <TouchableOpacity 
              style={styles.menuRow}
              onPress={() => setIsAddressModalOpen(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#fef3c7' }]}>
                <MapPin size={18} color="#d97706" />
              </View>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Saved Addresses</Text>
              <View style={styles.menuRightSide}>
                <View style={[styles.countBadge, { backgroundColor: '#fef3c7' }]}>
                  <Text style={[styles.countBadgeText, { color: '#d97706' }]}>{addresses.length}</Text>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Preferences & Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>PREFERENCES & HELP</Text>
          
          <View style={[styles.menuGroup, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            {/* Dark Mode */}
            <View style={[styles.menuRow, { borderBottomColor: theme.divider }]}>
              <View style={[styles.menuIconBox, { backgroundColor: isDark ? '#312e81' : '#fef3c7' }]}>
                {isDark ? <Moon size={18} color="#818cf8" /> : <Sun size={18} color="#f59e0b" />}
              </View>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Dark Mode</Text>
              <Switch 
                value={isDark} 
                onValueChange={toggleTheme}
                trackColor={{ false: '#e2e8f0', true: theme.primary }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Help & Support */}
            <TouchableOpacity 
              style={styles.menuRow}
              onPress={() => Alert.alert(
                'Fixly Customer Care 📞',
                'Toll-Free Helpline: 1800-FIX-PHONE (1800-349-7466)\nDirect Support: +91 98765 43210\nEmail: support@fixly.com\nHours: 9:00 AM – 9:00 PM (All 7 Days)'
              )}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: theme.primarySoft }]}>
                <HelpCircle size={18} color={theme.primary} />
              </View>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Help & Support</Text>
              <View style={styles.menuRightSide}>
                <ChevronRight size={18} color={theme.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: Logout */}
        <View style={styles.section}>
          <View style={[styles.menuGroup, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <TouchableOpacity 
              style={styles.logoutRow} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={18} color="#ef4444" />
              <Text style={styles.logoutRowText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.cleanFooter, { color: theme.textMuted }]}>Fixly Mobile App • Connected to Live Cloud</Text>

      </ScrollView>

      {/* ---------- EDIT PROFILE MODAL ---------- */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            <View style={styles.modalTopBar}>
              <View>
                <Text style={[styles.modalHeading, { color: theme.text }]}>Edit Profile</Text>
                <Text style={[styles.modalSubheading, { color: theme.textSecondary }]}>Updates sync directly with MySQL database</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
              <View style={styles.inputWrap}>
                <Text style={[styles.inputTag, { color: theme.textSecondary }]}>First Name</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={[styles.inputTag, { color: theme.textSecondary }]}>Last Name</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={[styles.inputTag, { color: theme.textSecondary }]}>Phone Number</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="10-digit mobile"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={[styles.inputTag, { color: theme.textSecondary }]}>Email Address</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="email@example.com"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={[styles.inputTag, { color: theme.textSecondary }]}>New Password (Optional)</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Leave blank to keep current"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ---------- ADDRESSES MODAL ---------- */}
      <Modal visible={isAddressModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalBox, { backgroundColor: theme.surface, maxHeight: '90%' }]}>
            
            {/* Modal Header */}
            <View style={styles.modalTopBar}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {addressViewMode === 'form' && (
                    <TouchableOpacity 
                      onPress={() => {
                        setAddressViewMode('list');
                        resetAddressForm();
                      }} 
                      style={[styles.backIconBtn, { backgroundColor: theme.primarySoft }]}
                      activeOpacity={0.7}
                    >
                      <ArrowLeft size={16} color={theme.primary} />
                    </TouchableOpacity>
                  )}
                  <Text style={[styles.modalHeading, { color: theme.text }]}>
                    {addressViewMode === 'list' ? 'Saved Addresses' : (editingAddressId ? 'Edit Address' : 'Add New Address')}
                  </Text>
                </View>
                <Text style={[styles.modalSubheading, { color: theme.textSecondary }]}>
                  {addressViewMode === 'list' 
                    ? 'Doorstep pickup & delivery locations' 
                    : 'Provide complete street & landmark details'}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setIsAddressModalOpen(false);
                  setAddressViewMode('list');
                  resetAddressForm();
                }}
                style={styles.closeBtnBox}
                activeOpacity={0.7}
              >
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {addressViewMode === 'list' ? (
              /* LIST VIEW */
              <View style={{ flexShrink: 1 }}>
                <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                  {addresses.length === 0 ? (
                    <View style={styles.emptyAddressBox}>
                      <MapPin size={36} color={theme.textMuted} />
                      <Text style={[styles.emptyAddressTitle, { color: theme.text }]}>No addresses saved yet</Text>
                      <Text style={[styles.emptyAddressSubtitle, { color: theme.textSecondary }]}>
                        Add an address for easy one-tap doorstep repairs booking.
                      </Text>
                    </View>
                  ) : (
                    addresses.map(a => {
                      const isDefault = !!a.is_default;
                      const IconComp = a.type === 'Home' ? HomeIcon : (a.type === 'Office' ? Building2 : MapPin);
                      const displayLine = a.line || [a.flat, a.street, a.landmark, `${a.city || ''} ${a.pincode || ''}`].filter(Boolean).join(', ');

                      return (
                        <View 
                          key={a.id} 
                          style={[
                            styles.addrCard, 
                            { 
                              borderColor: isDefault ? theme.primary : theme.cardBorder, 
                              backgroundColor: theme.background 
                            }
                          ]}
                        >
                          <View style={styles.addrCardHeader}>
                            <View style={styles.addrTypeRow}>
                              <View style={[styles.addrIconBubble, { backgroundColor: theme.primarySoft }]}>
                                <IconComp size={16} color={theme.primary} />
                              </View>
                              <Text style={[styles.addrCardType, { color: theme.text }]}>{a.type}</Text>
                              {isDefault && (
                                <View style={[styles.defaultBadge, { backgroundColor: theme.primarySoft }]}>
                                  <Check size={11} color={theme.primary} strokeWidth={3} />
                                  <Text style={[styles.defaultBadgeText, { color: theme.primary }]}>Default</Text>
                                </View>
                              )}
                            </View>

                            <View style={styles.addrActionButtons}>
                              <TouchableOpacity 
                                onPress={() => handleOpenEditAddress(a)} 
                                style={[styles.cardActionBtn, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                                activeOpacity={0.7}
                              >
                                <Edit2 size={14} color={theme.textSecondary} />
                              </TouchableOpacity>
                              <TouchableOpacity 
                                onPress={() => handleDeleteAddress(a.id)} 
                                style={[styles.cardActionBtn, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}
                                activeOpacity={0.7}
                              >
                                <Trash2 size={14} color="#ef4444" />
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Address lines */}
                          <View style={styles.addrCardBody}>
                            {!!a.flat && <Text style={[styles.addrFlatText, { color: theme.text }]}>{a.flat}</Text>}
                            <Text style={[styles.addrStreetText, { color: theme.textSecondary }]}>
                              {displayLine}
                            </Text>
                          </View>

                          {!isDefault && (
                            <TouchableOpacity 
                              style={[styles.setDefaultBtn, { borderColor: theme.cardBorder, backgroundColor: theme.surface }]}
                              onPress={() => handleSetDefaultAddress(a.id)}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.setDefaultBtnText, { color: theme.primary }]}>Set as Default</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })
                  )}
                </ScrollView>

                {/* Add Address Trigger Button */}
                <TouchableOpacity 
                  style={[styles.primaryAddBtn, { backgroundColor: theme.primary }]}
                  onPress={handleOpenAddAddress}
                  activeOpacity={0.8}
                >
                  <Plus size={18} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.primaryAddBtnText}>Add New Address</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* FORM VIEW */
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.addressFormScroll}>
                {/* Type Selection */}
                <View style={styles.inputWrap}>
                  <Text style={[styles.inputTag, { color: theme.textSecondary }]}>Address Type</Text>
                  <View style={styles.typeChipsRow}>
                    {(['Home', 'Office', 'Other'] as const).map(t => {
                      const isSelected = addrType === t;
                      const TypeIcon = t === 'Home' ? HomeIcon : (t === 'Office' ? Building2 : MapPin);
                      return (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setAddrType(t)}
                          style={[
                            styles.typeChipBtn,
                            { borderColor: theme.cardBorder, backgroundColor: theme.background },
                            isSelected && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                          ]}
                          activeOpacity={0.7}
                        >
                          <TypeIcon size={14} color={isSelected ? theme.primary : theme.textSecondary} />
                          <Text style={[styles.typeChipLabel, { color: isSelected ? theme.primary : theme.textSecondary }]}>
                            {t}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Optional Custom Label for Other */}
                {addrType === 'Other' && (
                  <View style={styles.inputWrap}>
                    <Text style={[styles.inputTag, { color: theme.textSecondary }]}>Custom Label (e.g. Studio, Parents)</Text>
                    <TextInput
                      style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                      value={addrCustomTag}
                      onChangeText={setAddrCustomTag}
                      placeholder="e.g. Warehouse, Parents, Studio"
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>
                )}

                {/* Flat / House No / Building */}
                <View style={styles.inputWrap}>
                  <Text style={[styles.inputTag, { color: theme.textSecondary }]}>Flat / House No. / Building *</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                    value={addrFlat}
                    onChangeText={setAddrFlat}
                    placeholder="e.g. Flat 402, B-Wing, Sunshine Heights"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>

                {/* Street / Road / Area */}
                <View style={styles.inputWrap}>
                  <Text style={[styles.inputTag, { color: theme.textSecondary }]}>Street / Road / Locality *</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                    value={addrStreet}
                    onChangeText={setAddrStreet}
                    placeholder="e.g. Link Road, Indiranagar"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>

                {/* Landmark */}
                <View style={styles.inputWrap}>
                  <Text style={[styles.inputTag, { color: theme.textSecondary }]}>Landmark (Optional)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                    value={addrLandmark}
                    onChangeText={setAddrLandmark}
                    placeholder="e.g. Near Metro Station / Opp City Mall"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>

                {/* City & Pincode 2-column */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={[styles.inputWrap, { flex: 1 }]}>
                    <Text style={[styles.inputTag, { color: theme.textSecondary }]}>City *</Text>
                    <TextInput
                      style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                      value={addrCity}
                      onChangeText={setAddrCity}
                      placeholder="e.g. Mumbai"
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>

                  <View style={[styles.inputWrap, { flex: 1 }]}>
                    <Text style={[styles.inputTag, { color: theme.textSecondary }]}>Pincode *</Text>
                    <TextInput
                      style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                      value={addrPincode}
                      onChangeText={setAddrPincode}
                      placeholder="e.g. 400053"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                {/* Make Default Switch */}
                <View style={[styles.defaultSwitchRow, { borderColor: theme.cardBorder, backgroundColor: theme.background }]}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: theme.text }]}>Make default address</Text>
                    <Text style={[styles.switchSubtitle, { color: theme.textSecondary }]}>
                      Pre-selected for doorstep pickup
                    </Text>
                  </View>
                  <Switch
                    value={addrIsDefault}
                    onValueChange={setAddrIsDefault}
                    trackColor={{ false: '#e2e8f0', true: theme.primary }}
                    thumbColor="#ffffff"
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.formActionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: theme.cardBorder, backgroundColor: theme.background }]}
                    onPress={() => {
                      setAddressViewMode('list');
                      resetAddressForm();
                    }}
                    disabled={isSavingAddress}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveAddressBtn, { backgroundColor: theme.primary }, isSavingAddress && { opacity: 0.6 }]}
                    onPress={handleSaveAddress}
                    disabled={isSavingAddress}
                    activeOpacity={0.8}
                  >
                    {isSavingAddress ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.saveAddressBtnText}>
                        {editingAddressId ? 'Update Address' : 'Save Address'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

              </ScrollView>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 4,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  profileContact: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  editPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  editPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dynamicStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 10,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  section: {
    marginTop: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuGroup: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  menuRightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  logoutRowText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  cleanFooter: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubheading: {
    fontSize: 11,
    marginTop: 2,
  },
  modalForm: {
    gap: 12,
  },
  inputWrap: {},
  inputTag: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  inputField: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#0284c7',
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  backIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnBox: {
    padding: 4,
  },
  emptyAddressBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyAddressTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyAddressSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  addrCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
  },
  addrCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addrTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addrIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addrCardType: {
    fontSize: 14,
    fontWeight: '800',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  addrActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addrCardBody: {
    marginBottom: 6,
  },
  addrFlatText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  addrStreetText: {
    fontSize: 12,
    lineHeight: 17,
  },
  setDefaultBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  setDefaultBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  primaryAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 14,
    marginTop: 10,
  },
  primaryAddBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  addressFormScroll: {
    gap: 12,
    paddingBottom: 16,
  },
  typeChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  typeChipLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  defaultSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  formActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveAddressBtn: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveAddressBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
