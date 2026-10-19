import { emptyForm, type FormState } from '../../src/lib/types';

export function filledForm(extra: Partial<FormState> = {}): FormState {
  return {
    ...emptyForm(),
    name: 'Maria Silva',
    cpf: '123.456.789-09',
    maritalStatus: 'Solteiro(a)',
    address: 'Rua A, 10',
    city: 'Recife',
    accessMethod: 'Ônibus',
    referencePoint: 'Praça',
    primaryContact: '(81) 99999-0000',
    targetBenefit: 'Aposentadoria',
    indication: 'Vizinho',
    captureDate: '18/10/2026',
    ...extra,
  };
}
