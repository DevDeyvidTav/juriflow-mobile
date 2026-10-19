import { digitsOnly } from './masks';
import { toCaptureDate, toIsoDateTime } from './dates';
import { firstMissingField, isFieldRequired } from './required';
import type { FormState } from './types';

const DATE_KEYS = ['periciaScheduledAt', 'avaliacaoSocialScheduledAt', 'audienciaScheduledAt'] as const;

export function validateForm(
  form: FormState,
  kanbanId: string,
  requiredFields: string[] | undefined,
): string | null {
  if (!kanbanId) return 'Selecione o kanban em que o cliente será cadastrado.';
  if (isFieldRequired(requiredFields, 'cpf') && digitsOnly(form.cpf).length !== 11) {
    return 'CPF é obrigatório neste kanban.';
  }
  const missing = firstMissingField(requiredFields, form);
  if (missing) return missing;
  if (form.captureDate.trim()) {
    try {
      toCaptureDate(form.captureDate);
    } catch (error) {
      return error instanceof Error ? error.message : 'Data da captação inválida.';
    }
  }
  for (const key of DATE_KEYS) {
    if (!form[key].trim()) continue;
    try {
      toIsoDateTime(form[key]);
    } catch (error) {
      return error instanceof Error ? error.message : 'Data/hora de agendamento inválida.';
    }
  }
  return null;
}
