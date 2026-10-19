import { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secure?: boolean;
  multiline?: boolean;
  keyboard?: TextInputProps['keyboardType'];
};

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {children}
      {required ? <Text style={styles.star}> *</Text> : null}
    </Text>
  );
}

export function TextField({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  secure,
  multiline,
  keyboard,
}: Props) {
  return (
    <>
      <FieldLabel required={required}>{label}</FieldLabel>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedSubtle}
        secureTextEntry={secure}
        multiline={multiline}
        keyboardType={keyboard}
        style={[styles.input, multiline ? styles.area : null]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: -4,
  },
  star: {
    color: colors.accent,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  area: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
