import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createClientApi, fetchCatalog, fetchHistory } from '../data/api';
import { deleteCadastroFiles } from '../data/files';
import { openStore, type AppStore } from '../data/sqlite-store';
import { recoverStuck, syncAll, syncById } from '../lib/sync';
import type { Cadastro, Catalog, CloudClient, Session } from '../lib/types';
import { useOnline } from './useOnline';

const EMPTY_CATALOG: Catalog = { kanbans: [], benefits: [] };

type QueueApi = {
  ready: boolean;
  online: boolean;
  syncing: boolean;
  items: Cadastro[];
  history: CloudClient[];
  catalog: Catalog;
  save: (item: Cadastro) => Promise<void>;
  remove: (id: string) => Promise<void>;
  syncNow: () => Promise<void>;
  syncOne: (id: string) => Promise<void>;
};

const QueueContext = createContext<QueueApi | null>(null);

export function QueueProvider({ session, children }: { session: Session; children: ReactNode }) {
  const online = useOnline();
  const [store, setStore] = useState<AppStore | null>(null);
  const [items, setItems] = useState<Cadastro[]>([]);
  const [history, setHistory] = useState<CloudClient[]>([]);
  const [catalog, setCatalog] = useState<Catalog>(EMPTY_CATALOG);
  const [syncing, setSyncing] = useState(false);
  const running = useRef(false);
  const storeRef = useRef<AppStore | null>(null);

  const reload = useCallback(async (current: AppStore) => {
    const all = await current.list();
    setItems(all.filter((item) => item.userId === session.user.id));
  }, [session.user.id]);

  useEffect(() => {
    let alive = true;
    openStore().then(async (opened) => {
      await recoverStuck(opened);
      if (!alive) return;
      storeRef.current = opened;
      setStore(opened);
      await reload(opened);
      const [cached, cachedHistory] = await Promise.all([opened.readCatalog(), opened.readHistory()]);
      if (!alive) return;
      if (cached) setCatalog(cached);
      setHistory(cachedHistory);
    });
    return () => {
      alive = false;
    };
  }, [reload]);

  useEffect(() => {
    if (!store || !online) return;
    let alive = true;
    fetchCatalog(session.token)
      .then(async (fresh) => {
        await store.saveCatalog(fresh);
        if (alive) setCatalog(fresh);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [store, online, session.token]);

  const refreshHistory = useCallback(async (current: AppStore) => {
    if (!online) return;
    try {
      const fresh = await fetchHistory(session.token);
      await current.saveHistory(fresh);
      setHistory(fresh);
    } catch {
      const cached = await current.readHistory();
      setHistory(cached);
    }
  }, [online, session.token]);

  useEffect(() => {
    if (!store || !online) return;
    void refreshHistory(store);
  }, [store, online, refreshHistory]);

  const syncNow = useCallback(async () => {
    const current = storeRef.current;
    if (!current || running.current || !online) return;
    running.current = true;
    setSyncing(true);
    try {
      await syncAll(current, createClientApi(session.token), true, session.user.id, () => reload(current));
      await refreshHistory(current);
    } finally {
      running.current = false;
      setSyncing(false);
      await reload(current);
    }
  }, [online, refreshHistory, reload, session.token, session.user.id]);

  useEffect(() => {
    if (store && online) void syncNow();
  }, [store, online, syncNow]);

  async function syncOne(id: string) {
    const current = storeRef.current;
    if (!current || running.current || !online) return;
    running.current = true;
    setSyncing(true);
    try {
      await syncById(current, createClientApi(session.token), id, () => reload(current));
      await refreshHistory(current);
    } finally {
      running.current = false;
      setSyncing(false);
      await reload(current);
    }
  }

  async function save(item: Cadastro) {
    const current = storeRef.current;
    if (!current) throw new Error('Armazenamento ainda não está pronto.');
    await current.save(item);
    await reload(current);
  }

  async function remove(id: string) {
    const current = storeRef.current;
    if (!current) return;
    await current.remove(id);
    await deleteCadastroFiles(id);
    await reload(current);
  }

  return (
    <QueueContext.Provider
      value={{
        ready: Boolean(store),
        online,
        syncing,
        items,
        history,
        catalog,
        save,
        remove,
        syncNow,
        syncOne,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue(): QueueApi {
  const value = useContext(QueueContext);
  if (!value) throw new Error('Fila indisponível.');
  return value;
}
