import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RepairStatus } from '../lib/data';
import { useTheme } from '../context/ThemeContext';

interface StatusBadgeProps {
  status: RepairStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { isDark } = useTheme();

  const getStatusColor = (status: RepairStatus) => {
    if (isDark) {
      switch (status) {
        case 'Completed':
        case 'Delivered':
          return { bg: '#14532d', text: '#86efac' };
        case 'Repairing':
        case 'Quality Check':
          return { bg: '#1e1b4b', text: '#a5b4fc' };
        case 'Cancelled':
          return { bg: '#7f1d1d', text: '#fca5a5' };
        default:
          return { bg: '#334155', text: '#cbd5e1' };
      }
    }

    switch (status) {
      case 'Completed':
      case 'Delivered':
        return { bg: '#dcfce7', text: '#166534' };
      case 'Repairing':
      case 'Quality Check':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'Cancelled':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const colors = getStatusColor(status);

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
