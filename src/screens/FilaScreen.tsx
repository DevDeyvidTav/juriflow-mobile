import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatDate, formatTime } from '../lib/dates';
import { buildHistory, filterHistory, type HistoryRow } from '../lib/history';
import { useQueue } from '../state/queue';
import { colors } from '../theme/colors';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SelectField } from '../ui/SelectField';

export function FilaScreen({ onOpen }: { onOpen: (row: HistoryRow) => void }) {
  const { items, history, catalog } = useQueue();
  const [search, setSearch] = useState('');
  const [kanbanId, setKanbanId] = useState('all');
  const rows = filterHistory(buildHistory(items, history), search, kanbanId);
  const total = buildHistory(items, history).length;

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => row.key}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Meu Histórico</Text>
          <Text style={styles.subtitle}>
            {total} cadastro{total === 1 ? '' : 's'} realizado{total === 1 ? '' : 's'} por você
          </Text>
          <SelectField
            label="Kanban"
            value={kanbanId}
            options={[
              { value: 'all', label: 'Todos os kanbans' },
              { value: 'none', label: 'Sem kanban' },
              ...catalog.kanbans.map((board) => ({ value: board.id, label: board.name })),
            ]}
            onChange={setKanbanId}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome ou cidade..."
            placeholderTextColor={colors.mutedSubtle}
            style={styles.search}
          />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Nenhum cadastro encontrado</Text>
          <Text style={styles.subtitle}>
            {search ? 'Tente outra busca' : 'Seus cadastros aparecerão aqui'}
          </Text>
        </View>
      }
      renderItem={({ item }) => <Row item={item} onOpen={onOpen} />}
    />
  );
}

function Row({ item, onOpen }: { item: HistoryRow; onOpen: (row: HistoryRow) => void }) {
  const initial = item.name.trim().charAt(0).toUpperCase() || '?';
  return (
    <Pressable style={styles.row} onPress={() => onOpen(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.city || '—'} · {item.kanbanName || 'Sem kanban'}</Text>
        <Text style={styles.meta}>{formatDate(item.when)} · {formatTime(item.when)}</Text>
      </View>
      <Badge status={item.status} />
    </Pressable>
  );
}

export function CloudDetail({ row, onBack }: { row: HistoryRow; onBack: () => void }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.title}>{row.name}</Text>
      <Badge status={row.status} />
      <Text style={styles.meta}>Cidade: {row.city || '—'}</Text>
      <Text style={styles.meta}>Kanban: {row.kanbanName || 'Sem kanban'}</Text>
      <Text style={styles.meta}>Data: {formatDate(row.when)}</Text>
      <Text style={styles.meta}>Hora: {formatTime(row.when)}</Text>
      <Text style={styles.subtitle}>Este cadastro já está na nuvem.</Text>
      <Button label="Voltar" tone="ghost" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 10,
    paddingBottom: 32,
  },
  header: {
    gap: 10,
    marginBottom: 8,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
  },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  emptyBox: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 28,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '700',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
  },
  detail: {
    padding: 16,
    gap: 12,
  },
});
