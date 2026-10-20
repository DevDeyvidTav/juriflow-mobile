import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { FieldLabel } from './TextField';

type Option = { value: string; label: string };

type Props = {
  label: string;
  required?: boolean;
  value: string;
  options: Option[];
  placeholder?: string;
  searchable?: boolean;
  onChange: (value: string) => void;
};

export function SelectField({ label, required, value, options, placeholder, searchable, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);
  const term = query.trim().toLowerCase();
  const shown = term ? options.filter((option) => option.label.toLowerCase().includes(term)) : options;

  return (
    <>
      <FieldLabel required={required}>{label}</FieldLabel>
      <Pressable
        style={styles.input}
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}
      >
        <Text style={selected ? styles.value : styles.placeholder}>
          {selected?.label || placeholder || 'Selecione'}
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            {searchable ? (
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar benefício"
                placeholderTextColor={colors.mutedSubtle}
                style={styles.search}
                autoCorrect={false}
              />
            ) : null}
            <FlatList
              data={shown}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item.value || item.label}
              ListEmptyComponent={
                searchable ? <Text style={styles.empty}>Nenhum benefício encontrado.</Text> : null
              }
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  value: {
    color: colors.text,
    fontSize: 14,
  },
  placeholder: {
    color: colors.mutedSubtle,
    fontSize: 14,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 8,
  },
  sheetTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  search: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  empty: {
    color: colors.muted,
    fontSize: 14,
    paddingVertical: 16,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
  },
});
