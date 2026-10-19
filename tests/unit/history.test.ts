import { buildHistory, filterHistory } from '../../src/lib/history';
import type { Cadastro, CloudClient } from '../../src/lib/types';
import { filledForm } from './helpers';
import { buildPayload } from '../../src/lib/payload';

function local(id: string, status: Cadastro['status'], remoteId?: string): Cadastro {
  return {
    id,
    status,
    remoteId,
    userId: 'user-1',
    userName: 'Captador',
    savedAt: '2026-10-18T15:00:00.000Z',
    kanbanId: 'kanban-1',
    kanbanName: 'Principal',
    payload: buildPayload(filledForm({ name: 'Maria Silva', city: 'Recife' }), 'kanban-1', id),
    files: [],
  };
}

const cloud: CloudClient = {
  id: 'remote-1',
  name: 'João Souza',
  city: 'Olinda',
  createdAt: '2026-10-17T12:00:00.000Z',
  kanbanId: 'kanban-2',
  kanbanName: 'Trabalhista',
};

describe('histórico', () => {
  it('mostra o pendente do aparelho e o cadastro já existente na nuvem', () => {
    const rows = buildHistory([local('local-1', 'pending')], [cloud]);
    expect(rows.map((row) => [row.name, row.status])).toEqual([
      ['Maria Silva', 'pending'],
      ['João Souza', 'synced'],
    ]);
  });

  it('não repete o cadastro que este aparelho já enviou', () => {
    const rows = buildHistory([local('local-1', 'synced', 'remote-1')], [cloud]);
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('synced');
    expect(rows[0].localId).toBe('local-1');
  });

  it('filtra por nome, cidade e kanban', () => {
    const rows = buildHistory([local('local-1', 'error')], [cloud]);
    expect(filterHistory(rows, 'olinda', 'all').map((row) => row.name)).toEqual(['João Souza']);
    expect(filterHistory(rows, '', 'kanban-1').map((row) => row.name)).toEqual(['Maria Silva']);
    expect(filterHistory(rows, 'maria', 'kanban-2')).toEqual([]);
  });
});
