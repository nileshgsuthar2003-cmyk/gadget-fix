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
} from 'lucide-react-native';
import Card from '../components/Card';
import { inr, CUSTOMER_NAME } from '../lib/data';
import { api, ApiRepair } from '../lib/api';
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

  // Address Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState([
    { id: '1', type: 'Home', line: 'B-42, Rose Apartments, Andheri West, Mumbai 400053' },
    { id: '2', type: 'Office', line: '3rd Floor, Trade View, Lower Parel, Mumbai 400013' },
  ]);
  const [newAddrType, setNewAddrType] = useState('Home');
  const [newAddrLine, setNewAddrLine] = useState('');

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

  const handleAddAddress = () => {
    if (!newAddrLine.trim()) {
      Alert.alert('Required', 'Please enter complete address.');
      return;
    }
    setAddresses(prev => [...prev, { id: String(Date.now()), type: newAddrType, line: newAddrLine.trim() }]);
    setNewAddrLine('');
    Alert.alert('Address Saved', `${newAddrType} address added to your profile.`);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
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
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            <View style={styles.modalTopBar}>
              <View>
                <Text style={[styles.modalHeading, { color: theme.text }]}>Saved Addresses</Text>
                <Text style={[styles.modalSubheading, { color: theme.textSecondary }]}>Doorstep pickup & delivery locations</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAddressModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              {addresses.map(a => (
                <View key={a.id} style={[styles.addrItem, { borderColor: theme.cardBorder, backgroundColor: theme.background }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.addrTag, { color: theme.primary }]}>{a.type}</Text>
                    <Text style={[styles.addrText, { color: theme.textSecondary }]}>{a.line}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteAddress(a.id)} style={{ padding: 4 }}>
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.addAddrBox}>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                {['Home', 'Office', 'Other'].map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setNewAddrType(t)}
                    style={[
                      styles.typeChip, 
                      { borderColor: theme.cardBorder },
                      newAddrType === t && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                    ]}
                  >
                    <Text style={[styles.typeChipText, { color: newAddrType === t ? theme.primary : theme.textSecondary }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text, marginBottom: 8 }]}
                value={newAddrLine}
                onChangeText={setNewAddrLine}
                placeholder="Enter flat, building, landmark, pincode..."
                placeholderTextColor={theme.textMuted}
              />

              <TouchableOpacity style={styles.addAddrBtn} onPress={handleAddAddress}>
                <Text style={styles.addAddrBtnText}>+ Add Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  addrItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  addrTag: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  addrText: {
    fontSize: 12,
  },
  addAddrBox: {
    marginTop: 10,
    paddingTop: 10,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addAddrBtn: {
    backgroundColor: '#0284c7',
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAddrBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
