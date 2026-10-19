import type { Cadastro, CadastroStore } from '../lib/types';

export function createMemoryStore(seed: Cadastro[] = []): CadastroStore {
  const rows = new Map<string, Cadastro>(seed.map((item) => [item.id, item]));
  return {
    async list() {
      return [...rows.values()].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
    },
    async get(id) {
      return rows.get(id) ?? null;
    },
    async save(item) {
      rows.set(item.id, item);
    },
    async remove(id) {
      rows.delete(id);
    },
  };
}
