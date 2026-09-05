import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, ShoppingCart, Smartphone, Clock, CheckCircle,
  Truck, XCircle, Phone, Mail, MapPin, CreditCard, User,
  Package
} from 'lucide-react-native';
import { api, ApiPhoneBuyRequest } from '../lib/api';
import { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

const STATUS_CONFIG: Record<string, { label: string; color: string; darkColor: string; bg: string; darkBg: string; icon: any }> = {
  pending: { label: 'Pending', color: '#92400e', darkColor: '#fbbf24', bg: '#fef3c7', darkBg: '#78350f', icon: Clock },
  confirmed: { label: 'Confirmed', color: '#1e40af', darkColor: '#60a5fa', bg: '#dbeafe', darkBg: '#1e3a5f', icon: CheckCircle },
  delivered: { label: 'Delivered', color: '#166534', darkColor: '#34d399', bg: '#dcfce7', darkBg: '#064e3b', icon: Truck },
  cancelled: { label: 'Cancelled', color: '#dc2626', darkColor: '#fca5a5', bg: '#fef2f2', darkBg: '#7f1d1d', icon: XCircle },
};

const STATUS_ORDER = ['pending', 'confirmed', 'delivered', 'cancelled'];

function inr(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminBuyRequestsScreen({ navigation }: RootStackScreenProps<'AdminBuyRequests'>) {
  const { theme, isDark } = useTheme();

  const [requests, setRequests] = useState<ApiPhoneBuyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.getBuyRequests();
      if (res.success && Array.isArray(res.requests)) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.warn('Failed to fetch buy requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const filteredRequests = filterStatus === 'all'
    ? requests
    : requests.filter(r => r.status === filterStatus);

  const handleStatusChange = (req: ApiPhoneBuyRequest, newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Change status from "${STATUS_CONFIG[req.status]?.label}" to "${STATUS_CONFIG[newStatus]?.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            const res = await api.updateBuyRequestStatus(req.id, newStatus);
            if (res.success) {
              fetchRequests();
            } else {
              Alert.alert('Error', res.error || 'Failed to update status.');
            }
          },
        },
      ]
    );
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const confirmedCount = requests.filter(r => r.status === 'confirmed').length;
  const deliveredCount = requests.filter(r => r.status === 'delivered').length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Buy Requests</Text>
        <ShoppingCart size={22} color={theme.primary} />
      </View>

      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: theme.primarySoft, borderBottomColor: theme.cardBorder }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{requests.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>{pendingCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#3b82f6' }]}>{confirmedCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Confirmed</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#16a34a' }]}>{deliveredCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Delivered</Text>
        </View>
      </View>

      {/* Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {['all', ...STATUS_ORDER].map(status => {
          const isActive = filterStatus === status;
          const config = STATUS_CONFIG[status];
          const label = status === 'all' ? 'All' : config?.label || status;
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterPill,
                { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setFilterStatus(status)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterPillText,
                { color: theme.textSecondary },
                isActive && { color: '#fff', fontWeight: '700' },
              ]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Request Cards */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading requests...</Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.centerBox}>
            <Package size={56} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Requests Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {filterStatus === 'all'
                ? 'No buy requests have been submitted yet.'
                : `No "${STATUS_CONFIG[filterStatus]?.label}" requests found.`}
            </Text>
          </View>
        ) : (
          <View style={styles.requestList}>
            {filteredRequests.map((req) => {
              const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;
              const phone = req.used_phone;

              return (
                <View
                  key={req.id}
                  style={[styles.requestCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                >
                  {/* Status Badge + Date */}
                  <View style={styles.cardHeaderRow}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: isDark ? statusCfg.darkBg : statusCfg.bg }
                    ]}>
                      <StatusIcon size={14} color={isDark ? statusCfg.darkColor : statusCfg.color} />
                      <Text style={[styles.statusBadgeText, { color: isDark ? statusCfg.darkColor : statusCfg.color }]}>
                        {statusCfg.label}
                      </Text>
                    </View>
                    <Text style={[styles.requestDate, { color: theme.textMuted }]}>
                      {formatDate(req.created_at)}
                    </Text>
                  </View>

                  {/* Phone Info */}
                  {phone && (
                    <View style={[styles.phoneInfoRow, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                      <Smartphone size={22} color={theme.primary} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.phoneInfoName, { color: theme.text }]}>
                          {phone.brand} {phone.model}
                        </Text>
                        <Text style={[styles.phoneInfoSpecs, { color: theme.textSecondary }]}>
                          {phone.storage} • {phone.color} • {phone.condition}
                        </Text>
                      </View>
                      <Text style={[styles.phoneInfoPrice, { color: theme.primary }]}>
                        {inr(req.total_amount)}
                      </Text>
                    </View>
                  )}

                  {/* Customer Info */}
                  <View style={styles.customerSection}>
                    <View style={styles.customerRow}>
                      <User size={14} color={theme.textSecondary} />
                      <Text style={[styles.customerText, { color: theme.text }]}>{req.customer_name}</Text>
                    </View>
                    {req.customer_phone && (
                      <View style={styles.customerRow}>
                        <Phone size={14} color={theme.textSecondary} />
                        <Text style={[styles.customerText, { color: theme.text }]}>{req.customer_phone}</Text>
                      </View>
                    )}
                    {req.customer_email && (
                      <View style={styles.customerRow}>
                        <Mail size={14} color={theme.textSecondary} />
                        <Text style={[styles.customerText, { color: theme.text }]}>{req.customer_email}</Text>
                      </View>
                    )}
                    {req.address && (
                      <View style={styles.customerRow}>
                        <MapPin size={14} color={theme.textSecondary} />
                        <Text style={[styles.customerText, { color: theme.text }]} numberOfLines={2}>{req.address}</Text>
                      </View>
                    )}
                    <View style={styles.customerRow}>
                      <CreditCard size={14} color={theme.textSecondary} />
                      <Text style={[styles.customerText, { color: theme.text }]}>
                        {(req.payment_method || 'upi').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Status Change Buttons */}
                  {req.status !== 'delivered' && req.status !== 'cancelled' && (
                    <View style={styles.statusActions}>
                      {req.status === 'pending' && (
                        <>
                          <TouchableOpacity
                            style={[styles.statusActionBtn, { backgroundColor: isDark ? '#1e3a5f' : '#dbeafe' }]}
                            onPress={() => handleStatusChange(req, 'confirmed')}
                            activeOpacity={0.7}
                          >
                            <CheckCircle size={16} color={isDark ? '#60a5fa' : '#1e40af'} />
                            <Text style={[styles.statusActionText, { color: isDark ? '#60a5fa' : '#1e40af' }]}>Confirm</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.statusActionBtn, { backgroundColor: isDark ? '#7f1d1d' : '#fef2f2' }]}
                            onPress={() => handleStatusChange(req, 'cancelled')}
                            activeOpacity={0.7}
                          >
                            <XCircle size={16} color={isDark ? '#fca5a5' : '#dc2626'} />
                            <Text style={[styles.statusActionText, { color: isDark ? '#fca5a5' : '#dc2626' }]}>Cancel</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {req.status === 'confirmed' && (
                        <>
                          <TouchableOpacity
                            style={[styles.statusActionBtn, { backgroundColor: isDark ? '#064e3b' : '#dcfce7' }]}
                            onPress={() => handleStatusChange(req, 'delivered')}
                            activeOpacity={0.7}
                          >
                            <Truck size={16} color={isDark ? '#34d399' : '#166534'} />
                            <Text style={[styles.statusActionText, { color: isDark ? '#34d399' : '#166534' }]}>Mark Delivered</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.statusActionBtn, { backgroundColor: isDark ? '#7f1d1d' : '#fef2f2' }]}
                            onPress={() => handleStatusChange(req, 'cancelled')}
                            activeOpacity={0.7}
                          >
                            <XCircle size={16} color={isDark ? '#fca5a5' : '#dc2626'} />
                            <Text style={[styles.statusActionText, { color: isDark ? '#fca5a5' : '#dc2626' }]}>Cancel</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  statsBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: 12, borderBottomWidth: 1,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 28 },
  filterScroll: { paddingVertical: 12 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, marginRight: 8,
  },
  filterPillText: { fontSize: 13, fontWeight: '600' },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 14, marginTop: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptySubtitle: { fontSize: 14, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
  requestList: { gap: 14 },
  requestCard: {
    borderRadius: 20, borderWidth: 1.5, padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  requestDate: { fontSize: 12, fontWeight: '500' },
  phoneInfoRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 12,
  },
  phoneInfoName: { fontSize: 15, fontWeight: '700' },
  phoneInfoSpecs: { fontSize: 12, marginTop: 2 },
  phoneInfoPrice: { fontSize: 16, fontWeight: '800' },
  customerSection: { gap: 6, marginBottom: 12 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customerText: { fontSize: 13, fontWeight: '500', flex: 1 },
  statusActions: {
    flexDirection: 'row', gap: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.15)',
    paddingTop: 12,
  },
  statusActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
  },
  statusActionText: { fontSize: 13, fontWeight: '700' },
});
