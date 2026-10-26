import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
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
  const [hidden, setHidden] = useState(true);
  return (
    <>
      <FieldLabel required={required}>{label}</FieldLabel>
      <View style={styles.field}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedSubtle}
          secureTextEntry={secure ? hidden : false}
          autoCapitalize={secure ? 'none' : undefined}
          autoCorrect={secure ? false : undefined}
          multiline={multiline}
          keyboardType={keyboard}
          style={[styles.input, multiline ? styles.area : null, secure ? styles.inputSecure : null]}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden((current) => !current)}
            style={styles.eye}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.accent} />
          </Pressable>
        ) : null}
      </View>
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
  field: {
    justifyContent: 'center',
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
  inputSecure: {
    paddingRight: 44,
  },
  eye: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  area: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
