import type { Cadastro, CadastroStore, ClientApi } from './types';

function errorText(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Falha ao sincronizar.';
}

export async function recoverStuck(store: CadastroStore): Promise<void> {
  const items = await store.list();
  for (const item of items) {
    if (item.status === 'syncing') {
      await store.save({ ...item, status: 'pending' });
    }
  }
}

export async function syncById(
  store: CadastroStore,
  api: ClientApi,
  id: string,
  onUpdate?: () => Promise<void>,
): Promise<void> {
  const start = await store.get(id);
  if (!start || start.status === 'synced') return;

  await store.save({ ...start, status: 'syncing', error: undefined });
  await onUpdate?.();

  let remoteId = start.remoteId;
  try {
    if (!remoteId) {
      const created = await api.createClient(start.payload);
      remoteId = created.id;
      const current = await store.get(id);
      if (!current) return;
      await store.save({ ...current, status: 'syncing', remoteId, error: undefined });
      await onUpdate?.();
    }

    const withRemote = await store.get(id);
    if (!withRemote) return;
    for (const file of withRemote.files) {
      if (file.remoteId) continue;
      const uploaded = await api.uploadFile(remoteId, file);
      const latest = await store.get(id);
      if (!latest) return;
      const files = latest.files.map((item) =>
        item.id === file.id ? { ...item, remoteId: uploaded.id } : item,
      );
      await store.save({ ...latest, files, status: 'syncing', remoteId, error: undefined });
      await onUpdate?.();
    }

    const done = await store.get(id);
    if (!done) return;
    await store.save({ ...done, status: 'synced', remoteId, error: undefined });
    await onUpdate?.();
  } catch (error) {
    const latest = await store.get(id);
    if (!latest) return;
    await store.save({
      ...latest,
      status: 'error',
      remoteId: latest.remoteId ?? remoteId,
      error: errorText(error),
    });
    await onUpdate?.();
  }
}

export async function syncAll(
  store: CadastroStore,
  api: ClientApi,
  online: boolean,
  userId: string,
  onUpdate?: () => Promise<void>,
): Promise<void> {
  if (!online) return;
  const items = await store.list();
  for (const item of items) {
    if (item.userId !== userId) continue;
    if (item.status === 'synced') continue;
    await syncById(store, api, item.id, onUpdate);
  }
}

export function countByStatus(items: Cadastro[]) {
  return {
    pending: items.filter((item) => item.status === 'pending').length,
    syncing: items.filter((item) => item.status === 'syncing').length,
    synced: items.filter((item) => item.status === 'synced').length,
    error: items.filter((item) => item.status === 'error').length,
  };
}
