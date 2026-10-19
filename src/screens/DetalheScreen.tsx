import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatWhen } from '../lib/dates';
import { useQueue } from '../state/queue';
import { colors } from '../theme/colors';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Notice } from '../ui/Notice';

const LINES: { key: 'name' | 'cpf' | 'city' | 'targetBenefit' | 'indication' | 'captureDate'; label: string }[] = [
  { key: 'name', label: 'Nome' },
  { key: 'cpf', label: 'CPF' },
  { key: 'city', label: 'Cidade' },
  { key: 'targetBenefit', label: 'Benefício' },
  { key: 'indication', label: 'Indicação' },
  { key: 'captureDate', label: 'Captação' },
];

export function DetalheScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const queue = useQueue();
  const item = queue.items.find((entry) => entry.id === id);

  if (!item) {
    return (
      <View style={styles.pad}>
        <Notice text="Cadastro não encontrado." tone="error" />
        <Button label="Voltar" tone="ghost" onPress={onBack} />
      </View>
    );
  }

  const canRetry = item.status === 'error' || item.status === 'pending';
  const canDelete = item.status !== 'synced' && item.status !== 'syncing';

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.title}>{item.payload.name}</Text>
      <Badge status={item.status} />
      <Text style={styles.meta}>Kanban: {item.kanbanName}</Text>
      <Text style={styles.meta}>Colaborador: {item.userName}</Text>
      <Text style={styles.meta}>Guardado em: {formatWhen(item.savedAt)}</Text>
      {item.remoteId ? <Text style={styles.meta}>Id na nuvem: {item.remoteId}</Text> : null}
      {item.error ? <Notice text={item.error} tone="error" /> : null}
      {LINES.map((line) => (
        <View key={line.key} style={styles.line}>
          <Text style={styles.label}>{line.label}</Text>
          <Text style={styles.value}>{item.payload[line.key] || '—'}</Text>
        </View>
      ))}
      <Text style={styles.label}>Anexos ({item.files.length})</Text>
      {item.files.length === 0 ? <Text style={styles.meta}>Nenhum arquivo.</Text> : null}
      {item.files.map((file) => (
        <Text key={file.id} style={styles.value}>
          {file.label}: {file.name} {file.remoteId ? '· enviado' : '· local'}
        </Text>
      ))}
      {canRetry ? (
        <Button
          label={queue.online ? 'Tentar sincronizar' : 'Sem internet para sincronizar'}
          onPress={() => queue.syncOne(item.id)}
          disabled={!queue.online || queue.syncing}
        />
      ) : null}
      {canDelete ? (
        <Button
          label="Excluir deste aparelho"
          tone="danger"
          onPress={async () => {
            await queue.remove(item.id);
            onBack();
          }}
        />
      ) : null}
      <Button label="Voltar" tone="ghost" onPress={onBack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  line: {
    gap: 2,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
  },
  value: {
    color: colors.text,
    fontSize: 15,
  },
});
