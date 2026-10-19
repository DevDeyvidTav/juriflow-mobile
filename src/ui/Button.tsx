import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'ghost' | 'danger';
};

export function Button({ label, onPress, disabled, tone = 'primary' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, styles[tone], disabled ? styles.disabled : null]}
    >
      <Text style={[styles.label, tone === 'ghost' ? styles.ghostLabel : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  } as ViewStyle,
  primary: {
    backgroundColor: colors.secondary,
  },
  ghost: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  ghostLabel: {
    color: colors.muted,
  },
});
