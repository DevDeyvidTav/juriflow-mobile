import type { SyncStatus } from './types';

const LABELS: Record<SyncStatus, string> = {
  pending: 'Pendente',
  syncing: 'Sincronizando',
  synced: 'Sincronizado',
  error: 'Com erro',
};

const COLORS: Record<SyncStatus, string> = {
  pending: '#F59E0B',
  syncing: '#60A5FA',
  synced: '#10B981',
  error: '#EF4444',
};

export function statusLabel(status: SyncStatus): string {
  return LABELS[status];
}

export function statusColor(status: SyncStatus): string {
  return COLORS[status];
}
