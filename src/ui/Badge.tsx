import { StyleSheet, Text, View } from 'react-native';
import { statusColor, statusLabel } from '../lib/status';
import type { SyncStatus } from '../lib/types';

export function Badge({ status }: { status: SyncStatus }) {
  const color = statusColor(status);
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{statusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
