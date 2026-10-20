import { filledForm } from './helpers';
import { maskCpf, maskDate, maskDateTime, maskPhone } from '../../src/lib/masks';
import { formatWhen, toCaptureDate, toIsoDateTime } from '../../src/lib/dates';
import { isFieldRequired } from '../../src/lib/required';
import { canRegister } from '../../src/lib/access';
import { isNewerVersion, readUpdate } from '../../src/lib/version';
import { statusLabel } from '../../src/lib/status';
import { validateForm } from '../../src/lib/validate';
import { buildPayload } from '../../src/lib/payload';
import { findSameCpf } from '../../src/lib/duplicate';
import { fileProblem, isOtherDocuments, matchBenefits, visibleBenefitFiles } from '../../src/lib/benefits';
import { withRetry } from '../../src/lib/retry';
import { ApiError } from '../../src/lib/api-error';
import { createMemoryStore } from '../../src/data/memory-store';
import type { Cadastro } from '../../src/lib/types';

describe('máscaras e datas', () => {
  it('formata cpf, telefone e data', () => {
    expect(maskCpf('12345678909')).toBe('123.456.789-09');
    expect(maskPhone('81999990000')).toBe('(81) 99999-0000');
    expect(maskDate('18102026')).toBe('18/10/2026');
    expect(maskDateTime('181020261430')).toBe('18/10/2026 14:30');
  });

  it('converte captação e agendamento', () => {
    expect(toCaptureDate('18/10/2026')).toBe('2026-10-18');
    expect(toIsoDateTime('')).toBeNull();
    expect(toIsoDateTime('18/10/2026 14:30')).toContain('2026-10-18');
    expect(formatWhen('2026-10-18T17:30:00.000Z').length).toBeGreaterThan(8);
  });

  it('rejeita data impossível', () => {
    expect(() => toCaptureDate('31/02/2026')).toThrow('Data da captação inválida.');
  });
});

describe('regras do cadastro', () => {
  it('nome e cpf são sempre obrigatórios', () => {
    expect(isFieldRequired([], 'name')).toBe(true);
    expect(isFieldRequired([], 'cpf')).toBe(true);
    expect(isFieldRequired([], 'gender')).toBe(false);
  });

  it('aceita o formulário padrão e monta o payload da api', () => {
    const form = filledForm();
    expect(validateForm(form, 'kanban-1', undefined)).toBeNull();
    const payload = buildPayload(form, 'kanban-1', 'local-1');
    expect(payload.clientRequestId).toBe('local-1');
    expect(payload.captureDate).toBe('2026-10-18');
    expect(payload.diseaseDetails).toBeUndefined();
    expect(payload.periciaScheduledAt).toBeNull();
  });

  it('exige doença quando o kanban pede e aninha benefício de saúde', () => {
    const form = filledForm({ targetBenefit: 'Auxílio-doença', diseases: '' });
    expect(validateForm(form, 'kanban-1', ['name', 'cpf', 'diseases'])).toMatch(/Doenças/);
    const ready = filledForm({ targetBenefit: 'Auxílio-doença', diseases: 'CID M54' });
    expect(buildPayload(ready, 'kanban-1', 'local-2').diseaseDetails?.diseases).toBe('CID M54');
  });

  it('bloqueia o mesmo cpf já guardado no aparelho', async () => {
    const payload = buildPayload(filledForm(), 'kanban-1', 'local-1');
    const item: Cadastro = {
      id: 'local-1',
      status: 'pending',
      userId: 'user-1',
      userName: 'Captador',
      savedAt: '2026-10-18T12:00:00.000Z',
      kanbanId: 'kanban-1',
      kanbanName: 'Principal',
      payload,
      files: [],
    };
    const store = createMemoryStore([item]);
    expect(findSameCpf(await store.list(), '12345678909')?.id).toBe('local-1');
  });

  it('ignora o rótulo de outros documentos e recusa arquivo inválido', () => {
    const files = visibleBenefitFiles({
      id: 'b1',
      name: 'BPC',
      order: 0,
      requiredFiles: [
        { id: '1', label: 'RG', acceptedTypes: 'pdf', order: 0 },
        { id: '2', label: 'Outros documentos', acceptedTypes: 'pdf', order: 1 },
      ],
    });
    expect(matchBenefits(
      [
        { id: '1', name: 'Auxílio-doença', order: 0, requiredFiles: [] },
        { id: '2', name: 'Aposentadoria', order: 1, requiredFiles: [] },
      ],
      'aux',
    ).map((item) => item.name)).toEqual(['Auxílio-doença']);
    expect(files.map((file) => file.label)).toEqual(['RG']);
    expect(isOtherDocuments('Outro documento extra')).toBe(true);
    expect(fileProblem('text/plain', 10)).toMatch(/Formato/);
    expect(fileProblem('application/pdf', 0)).toMatch(/vazio/);
  });
});

describe('acesso, versão e status', () => {
  it('libera captador e admin, e interno só com a tela extra', () => {
    expect(canRegister({ id: '1', name: 'A', email: 'a@a.com', role: 'EXTERNAL', screenPermissions: [] })).toBe(true);
    expect(canRegister({ id: '2', name: 'B', email: 'b@b.com', role: 'ADMIN', screenPermissions: [] })).toBe(true);
    expect(canRegister({ id: '3', name: 'C', email: 'c@c.com', role: 'INTERNAL', screenPermissions: [] })).toBe(false);
    expect(canRegister({ id: '3', name: 'C', email: 'c@c.com', role: 'INTERNAL', screenPermissions: ['cadastro'] })).toBe(true);
  });

  it('só avisa atualização quando a versão remota é maior', () => {
    expect(isNewerVersion('1.0.1', '1.0.0')).toBe(true);
    expect(isNewerVersion('1.0.0', '1.0.0')).toBe(false);
    expect(readUpdate({ version: '1.2.0', apkUrl: 'https://cdn/app.apk', notes: 'fila' }, '1.0.0')).toEqual({
      version: '1.2.0',
      apkUrl: 'https://cdn/app.apk',
      notes: 'fila',
    });
    expect(readUpdate({ version: '1.0.0', apkUrl: 'https://cdn/app.apk' }, '1.0.0')).toBeNull();
  });

  it('traduz o status da fila', () => {
    expect(statusLabel('pending')).toBe('Pendente');
    expect(statusLabel('syncing')).toBe('Sincronizando');
    expect(statusLabel('synced')).toBe('Sincronizado');
    expect(statusLabel('error')).toBe('Com erro');
  });
});

describe('repetição de envio', () => {
  it('repete falha de rede e para em erro de validação', async () => {
    let calls = 0;
    const waits: number[] = [];
    await withRetry(
      async () => {
        calls += 1;
        if (calls < 3) throw new Error('rede');
        return 'ok';
      },
      3,
      async (ms) => {
        waits.push(ms);
      },
    );
    expect(calls).toBe(3);
    expect(waits).toEqual([1000, 2000]);

    await expect(
      withRetry(async () => {
        throw new ApiError('grande', 413);
      }, 3, async () => undefined),
    ).rejects.toThrow('grande');
  });
});
