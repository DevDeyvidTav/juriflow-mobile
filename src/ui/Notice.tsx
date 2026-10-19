import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function Notice({ text, tone = 'info' }: { text: string; tone?: 'info' | 'error' }) {
  return (
    <View style={[styles.box, tone === 'error' ? styles.error : styles.info]}>
      <Text style={[styles.text, tone === 'error' ? styles.errorText : styles.infoText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  info: {
    backgroundColor: '#3B82F620',
    borderColor: '#3B82F640',
  },
  error: {
    backgroundColor: '#EF444420',
    borderColor: '#EF444480',
  },
  text: {
    fontSize: 13,
  },
  infoText: {
    color: colors.accent,
  },
  errorText: {
    color: colors.danger,
  },
});
