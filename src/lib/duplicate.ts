import { digitsOnly } from './masks';
import type { Cadastro } from './types';

export function findSameCpf(items: Cadastro[], cpf: string): Cadastro | null {
  const digits = digitsOnly(cpf);
  if (digits.length !== 11) return null;
  return items.find((item) => digitsOnly(item.payload.cpf) === digits) ?? null;
}
