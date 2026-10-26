import { Ionicons } from '@expo/vector-icons';
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
  const syncDisabled = !online || syncing;
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
        <ActionButton
          icon="sync"
          label={syncing ? 'Enviando…' : 'Sincronizar'}
          disabled={syncDisabled}
          onPress={onSync}
        />
        <ActionButton icon="log-out-outline" label="Sair" onPress={onLogout} />
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const color = disabled ? colors.mutedSubtle : colors.accent;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: '#60A5FA40' }}
      style={({ pressed }) => [
        styles.action,
        pressed && !disabled ? styles.actionPressed : null,
        disabled ? styles.actionOff : null,
      ]}
    >
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </Pressable>
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
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
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
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionPressed: {
    borderColor: colors.accent,
    backgroundColor: '#1A3050',
  },
  actionOff: {
    opacity: 0.55,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
