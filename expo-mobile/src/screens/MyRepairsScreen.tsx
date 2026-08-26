import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone } from 'lucide-react-native';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { repairs, CUSTOMER_NAME, inr } from '../lib/data';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

export default function MyRepairsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme, isDark } = useTheme();

  const myRepairs = repairs.filter(r => r.customer === CUSTOMER_NAME || r.customer === "Rahul Sharma");
  const activeRepairs = myRepairs.filter(r => r.status !== "Completed" && r.status !== "Cancelled");
  const pastRepairs = myRepairs.filter(r => r.status === "Completed" || r.status === "Cancelled");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Repairs</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Active Repairs */}
        {activeRepairs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Repairs</Text>
            {activeRepairs.map((r) => (
              <TouchableOpacity 
                key={r.id} 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('RepairDetails', { repairId: r.id })}
              >
                <Card style={styles.repairCard}>
                  <View style={[styles.iconContainerActive, { backgroundColor: theme.primarySoft }]}>
                    <Smartphone size={22} color={theme.primary} />
                  </View>
                  <View style={styles.repairInfo}>
                    <Text style={[styles.repairDevice, { color: theme.text }]} numberOfLines={1}>{r.device}</Text>
                    <Text style={[styles.repairService, { color: theme.textSecondary }]}>{r.service}</Text>
                  </View>
                  <View style={styles.statusCol}>
                    <StatusBadge status={r.status} />
                    <Text style={[styles.dateText, { color: theme.textMuted }]}>{r.appointment}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Past Repairs */}
        {pastRepairs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Past Repairs</Text>
            {pastRepairs.map((r) => (
              <TouchableOpacity 
                key={r.id} 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('RepairDetails', { repairId: r.id })}
              >
                <Card style={styles.repairCard}>
                  <View style={[styles.iconContainerPast, { backgroundColor: theme.background }]}>
                    <Smartphone size={22} color={theme.textMuted} />
                  </View>
                  <View style={styles.repairInfo}>
                    <Text style={[styles.repairDevice, { color: theme.text }]} numberOfLines={1}>{r.device}</Text>
                    <Text style={[styles.repairService, { color: theme.textSecondary }]}>{r.service}</Text>
                  </View>
                  <View style={styles.statusCol}>
                    <StatusBadge status={r.status} />
                    <Text style={[styles.estimateText, { color: theme.text }]}>{inr(r.estimate)}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeRepairs.length === 0 && pastRepairs.length === 0 && (
          <View style={styles.emptyState}>
            <Smartphone size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Repairs Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>You haven't booked any phone repairs yet.</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  repairCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginVertical: 6,
  },
  iconContainerActive: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconContainerPast: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  repairInfo: {
    flex: 1,
    marginRight: 8,
  },
  repairDevice: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  repairService: {
    fontSize: 13,
  },
  statusCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  estimateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
