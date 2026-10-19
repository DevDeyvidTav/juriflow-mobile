import type { Cadastro, CloudClient, SyncStatus } from './types';

export type HistoryRow = {
  key: string;
  name: string;
  city: string;
  when: string;
  kanbanId: string | null;
  kanbanName: string;
  status: SyncStatus;
  localId?: string;
};

export function buildHistory(local: Cadastro[], cloud: CloudClient[]): HistoryRow[] {
  const sent = new Set(local.map((item) => item.remoteId).filter((id): id is string => Boolean(id)));
  const rows: HistoryRow[] = local.map((item) => ({
    key: item.id,
    name: item.payload.name,
    city: item.payload.city,
    when: item.savedAt,
    kanbanId: item.kanbanId,
    kanbanName: item.kanbanName,
    status: item.status,
    localId: item.id,
  }));

  for (const client of cloud) {
    if (sent.has(client.id)) continue;
    rows.push({
      key: `cloud-${client.id}`,
      name: client.name,
      city: client.city,
      when: client.createdAt,
      kanbanId: client.kanbanId ?? null,
      kanbanName: client.kanbanName ?? '',
      status: 'synced',
    });
  }

  return rows.sort((a, b) => (a.when < b.when ? 1 : -1));
}

export function filterHistory(rows: HistoryRow[], search: string, kanbanId: string): HistoryRow[] {
  const query = search.trim().toLowerCase();
  return rows.filter((row) => {
    const matchesText =
      !query ||
      row.name.toLowerCase().includes(query) ||
      row.city.toLowerCase().includes(query);
    const matchesKanban =
      kanbanId === 'all' ||
      (kanbanId === 'none' && !row.kanbanId) ||
      row.kanbanId === kanbanId;
    return matchesText && matchesKanban;
  });
}
