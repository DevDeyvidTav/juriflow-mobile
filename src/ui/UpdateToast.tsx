import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  version: string;
  notes?: string;
  onDownload: () => void;
};

export function UpdateToast({ version, notes, onDownload }: Props) {
  const text = `Nova versão ${version} disponível.${notes ? ` ${notes}` : ''}`;
  return (
    <View style={styles.toast}>
      <Text style={styles.text}>{text}</Text>
      <Pressable
        onPress={onDownload}
        android_ripple={{ color: '#FFFFFF40' }}
        style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
      >
        <Ionicons name="download" size={18} color={colors.white} />
        <Text style={styles.buttonText}>Baixar atualização</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#13284A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: 12,
    gap: 10,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
