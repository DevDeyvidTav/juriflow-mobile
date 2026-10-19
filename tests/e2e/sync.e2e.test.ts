import { filledForm } from '../unit/helpers';
import { createMemoryStore } from '../../src/data/memory-store';
import { buildPayload } from '../../src/lib/payload';
import { recoverStuck, syncAll, syncById } from '../../src/lib/sync';
import type { Cadastro, ClientApi, LocalFile } from '../../src/lib/types';

function file(id: string): LocalFile {
  return { id, label: 'RG', name: `${id}.pdf`, mime: 'application/pdf', uri: `file://${id}.pdf` };
}

function item(id: string, extra: Partial<Cadastro> = {}): Cadastro {
  return {
    id,
    status: 'pending',
    userId: 'user-1',
    userName: 'Captador',
    savedAt: '2026-10-18T15:00:00.000Z',
    kanbanId: 'kanban-1',
    kanbanName: 'Principal',
    payload: buildPayload(filledForm(), 'kanban-1', id),
    files: [file('a'), file('b')],
    ...extra,
  };
}

function server() {
  const clients = new Map<string, string>();
  const uploads: string[] = [];
  let dropNextCreate = false;
  let failFileId = '';
  const api: ClientApi = {
    async createClient(payload) {
      const known = clients.get(payload.clientRequestId);
      if (known) return { id: known };
      const remoteId = `remote-${payload.clientRequestId}`;
      clients.set(payload.clientRequestId, remoteId);
      if (dropNextCreate) {
        dropNextCreate = false;
        throw new Error('resposta perdida');
      }
      return { id: remoteId };
    },
    async uploadFile(_clientId, current) {
      if (current.id === failFileId) throw new Error('falha no arquivo');
      uploads.push(current.id);
      return { id: `att-${current.id}` };
    },
  };
  return {
    api,
    clients,
    uploads,
    dropNext() {
      dropNextCreate = true;
    },
    failFile(id: string) {
      failFileId = id;
    },
  };
}

describe('fila de sincronização', () => {
  it('não envia enquanto está offline', async () => {
    const store = createMemoryStore([item('local-1')]);
    const fake = server();
    await syncAll(store, fake.api, false, 'user-1');
    expect(fake.clients.size).toBe(0);
    expect((await store.get('local-1'))?.status).toBe('pending');
  });

  it('envia o cliente e os anexos uma vez e ignora o segundo ciclo', async () => {
    const store = createMemoryStore([item('local-1', { files: [file('a'), file('b')] })]);
    const fake = server();
    await syncAll(store, fake.api, true, 'user-1');
    await syncAll(store, fake.api, true, 'user-1');
    const saved = await store.get('local-1');
    expect(saved?.status).toBe('synced');
    expect(saved?.remoteId).toBe('remote-local-1');
    expect(fake.clients.size).toBe(1);
    expect(fake.uploads).toEqual(['a', 'b']);
    expect(saved?.files.every((entry) => entry.remoteId)).toBe(true);
  });

  it('não recria o cliente quando a resposta do primeiro envio se perde', async () => {
    const store = createMemoryStore([item('local-1', { files: [] })]);
    const fake = server();
    fake.dropNext();
    await syncById(store, fake.api, 'local-1');
    expect((await store.get('local-1'))?.status).toBe('error');
    expect((await store.get('local-1'))?.remoteId).toBeUndefined();

    await syncById(store, fake.api, 'local-1');
    expect(fake.clients.size).toBe(1);
    expect((await store.get('local-1'))?.remoteId).toBe('remote-local-1');
    expect((await store.get('local-1'))?.status).toBe('synced');
  });

  it('continua só os anexos que faltam depois de um erro', async () => {
    const store = createMemoryStore([item('local-1')]);
    const fake = server();
    fake.failFile('b');
    await syncById(store, fake.api, 'local-1');
    const failed = await store.get('local-1');
    expect(failed?.status).toBe('error');
    expect(failed?.remoteId).toBe('remote-local-1');
    expect(failed?.files.find((entry) => entry.id === 'a')?.remoteId).toBe('att-a');
    expect(failed?.error).toBe('falha no arquivo');

    fake.failFile('');
    await syncById(store, fake.api, 'local-1');
    const done = await store.get('local-1');
    expect(done?.status).toBe('synced');
    expect(fake.clients.size).toBe(1);
    expect(fake.uploads).toEqual(['a', 'b']);
  });

  it('retoma um envio interrompido sem criar outro cliente', async () => {
    const store = createMemoryStore([
      item('local-1', { status: 'syncing', remoteId: 'remote-local-1', files: [file('a')] }),
    ]);
    await recoverStuck(store);
    expect((await store.get('local-1'))?.status).toBe('pending');
    const fake = server();
    fake.clients.set('local-1', 'remote-local-1');
    await syncAll(store, fake.api, true, 'user-1');
    expect(fake.uploads).toEqual(['a']);
    expect((await store.get('local-1'))?.status).toBe('synced');
  });

  it('não envia cadastro de outro colaborador', async () => {
    const store = createMemoryStore([item('local-1', { userId: 'user-2' })]);
    const fake = server();
    await syncAll(store, fake.api, true, 'user-1');
    expect(fake.clients.size).toBe(0);
    expect((await store.get('local-1'))?.status).toBe('pending');
  });
});
