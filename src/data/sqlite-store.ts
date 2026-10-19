import * as SQLite from 'expo-sqlite';
import type { Cadastro, CadastroStore, Catalog, CloudClient } from '../lib/types';

const CATALOG_KEY = 'catalog';
const HISTORY_KEY = 'history';

export type AppStore = CadastroStore & {
  readCatalog(): Promise<Catalog | null>;
  saveCatalog(catalog: Catalog): Promise<void>;
  readHistory(): Promise<CloudClient[]>;
  saveHistory(items: CloudClient[]): Promise<void>;
};

export async function openStore(): Promise<AppStore> {
  const db = await SQLite.openDatabaseAsync('juriflow.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cadastros (
      id TEXT PRIMARY KEY NOT NULL,
      json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  async function readMeta<T>(key: string): Promise<T | null> {
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', key);
    if (!row) return null;
    try {
      return JSON.parse(row.value) as T;
    } catch {
      return null;
    }
  }

  async function writeMeta(key: string, value: unknown): Promise<void> {
    await db.runAsync(
      'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      key,
      JSON.stringify(value),
    );
  }

  return {
    async list() {
      const rows = await db.getAllAsync<{ json: string }>('SELECT json FROM cadastros');
      const items = rows.map((row) => JSON.parse(row.json) as Cadastro);
      items.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
      return items;
    },
    async get(id) {
      const row = await db.getFirstAsync<{ json: string }>(
        'SELECT json FROM cadastros WHERE id = ?',
        id,
      );
      return row ? (JSON.parse(row.json) as Cadastro) : null;
    },
    async save(item) {
      await db.runAsync(
        'INSERT INTO cadastros (id, json) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json',
        item.id,
        JSON.stringify(item),
      );
    },
    async remove(id) {
      await db.runAsync('DELETE FROM cadastros WHERE id = ?', id);
    },
    async readCatalog() {
      return readMeta<Catalog>(CATALOG_KEY);
    },
    async saveCatalog(catalog) {
      await writeMeta(CATALOG_KEY, catalog);
    },
    async readHistory() {
      const saved = await readMeta<CloudClient[]>(HISTORY_KEY);
      return Array.isArray(saved) ? saved : [];
    },
    async saveHistory(items) {
      await writeMeta(HISTORY_KEY, items);
    },
  };
}
