import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { canAddFile, folderLimit } from '../lib/benefits';
import type { BenefitFile } from '../lib/types';
import { colors } from '../theme/colors';

type Draft = { name: string };

type Props = {
  folders: BenefitFile[];
  files: Record<string, Draft[]>;
  onAdd: (folder: BenefitFile, source: 'camera' | 'library' | 'file') => void;
  onRemove: (label: string, index: number) => void;
};

export function FileFolders({ folders, files, onAdd, onRemove }: Props) {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const term = query.trim().toLowerCase();
  const visible = folders.filter((folder) => {
    if (!term) return true;
    if (folder.label.toLowerCase().includes(term)) return true;
    return (files[folder.label] ?? []).some((file) => file.name.toLowerCase().includes(term));
  });
  const total = folders.reduce((sum, folder) => sum + (files[folder.label]?.length ?? 0), 0);
  const open = folders.find((folder) => folder.id === openId) ?? null;
  const openFiles = open ? files[open.label] ?? [] : [];
  const limit = open ? folderLimit(open) : null;

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Arquivos do cliente</Text>
      <Text style={styles.muted}>
        {total} {total === 1 ? 'arquivo' : 'arquivos'} em {folders.length} {folders.length === 1 ? 'pasta' : 'pastas'}. O anexo é opcional.
      </Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar arquivo ou pasta..."
        placeholderTextColor={colors.mutedSubtle}
        style={styles.search}
      />
      <View style={styles.grid}>
        {visible.map((folder) => {
          const count = files[folder.label]?.length ?? 0;
          const selected = folder.id === openId;
          const max = folderLimit(folder);
          return (
            <Pressable
              key={folder.id}
              onPress={() => setOpenId(selected ? null : folder.id)}
              style={[styles.card, selected ? styles.cardOn : null]}
            >
              <Ionicons name="folder-outline" size={22} color={colors.accent} />
              <View style={styles.cardText}>
                <Text style={styles.name} numberOfLines={1}>{folder.label}</Text>
                <Text style={styles.muted}>
                  {count} {count === 1 ? 'arquivo' : 'arquivos'}
                  {max != null ? ` · até ${max}` : ''}
                </Text>
              </View>
              <Ionicons name={selected ? 'chevron-down' : 'chevron-forward'} size={16} color={colors.muted} />
            </Pressable>
          );
        })}
      </View>
      {open ? (
        <View style={styles.open}>
          <Text style={styles.openTitle}>
            {open.label}{limit != null ? ` · até ${limit}` : ''}
          </Text>
          {openFiles.length === 0 ? (
            <Text style={styles.muted}>Pasta vazia. Pode anexar agora ou depois.</Text>
          ) : (
            openFiles.map((file, index) => (
              <View key={`${file.name}-${index}`} style={styles.fileRow}>
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <Pressable onPress={() => onRemove(open.label, index)}>
                  <Text style={styles.remove}>Remover</Text>
                </Pressable>
              </View>
            ))
          )}
          <View style={styles.actions}>
            <AddButton label="Câmera" disabled={!canAddFile(openFiles.length, limit)} onPress={() => onAdd(open, 'camera')} />
            <AddButton label="Galeria" disabled={!canAddFile(openFiles.length, limit)} onPress={() => onAdd(open, 'library')} />
            <AddButton label="Arquivo" disabled={!canAddFile(openFiles.length, limit)} onPress={() => onAdd(open, 'file')} />
          </View>
        </View>
      ) : (
        <Text style={styles.muted}>Clique em uma pasta para visualizar os arquivos.</Text>
      )}
    </View>
  );
}

function AddButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.add, disabled ? styles.addOff : null]}>
      <Text style={styles.addText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  title: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  muted: {
    color: colors.muted,
    fontSize: 12,
  },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  grid: {
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  cardOn: {
    borderColor: colors.accent,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  open: {
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
  },
  openTitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },
  remove: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  add: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 8,
  },
  addOff: {
    opacity: 0.45,
  },
  addText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
});
