import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{children}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
});
