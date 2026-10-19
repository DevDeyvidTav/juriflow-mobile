import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  name: string;
  online: boolean;
  syncing: boolean;
  onSync: () => void;
  onLogout: () => void;
};

export function Header({ name, online, syncing, onSync, onLogout }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.titles}>
        <Text style={styles.brand}>JuriFlow</Text>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
      </View>
      <View style={styles.actions}>
        <View style={styles.pill}>
          <View style={[styles.dot, { backgroundColor: online ? colors.success : colors.warning }]} />
          <Text style={styles.pillText}>{online ? 'Online' : 'Offline'}</Text>
        </View>
        <Pressable onPress={onSync} disabled={!online || syncing} style={styles.link}>
          <Text style={[styles.linkText, !online || syncing ? styles.off : null]}>
            {syncing ? 'Enviando…' : 'Sincronizar'}
          </Text>
        </Pressable>
        <Pressable onPress={onLogout} style={styles.link}>
          <Text style={styles.linkText}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titles: {
    gap: 2,
  },
  brand: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  name: {
    color: colors.muted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  link: {
    paddingVertical: 6,
  },
  linkText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  off: {
    color: colors.mutedSubtle,
  },
});
