import { isHealthBenefit } from './benefits';
import { toCaptureDate, toIsoDateTime } from './dates';
import type { ClientPayload, FormState } from './types';

export function buildPayload(form: FormState, kanbanId: string, requestId: string): ClientPayload {
  const payload: ClientPayload = {
    ...form,
    captureDate: toCaptureDate(form.captureDate),
    periciaScheduledAt: toIsoDateTime(form.periciaScheduledAt),
    avaliacaoSocialScheduledAt: toIsoDateTime(form.avaliacaoSocialScheduledAt),
    audienciaScheduledAt: toIsoDateTime(form.audienciaScheduledAt),
    kanbanId,
    clientRequestId: requestId,
  };
  if (isHealthBenefit(form.targetBenefit)) {
    payload.diseaseDetails = {
      diseases: form.diseases,
      sinceWhen: form.sinceWhen,
      symptoms: form.symptoms,
    };
  }
  return payload;
}
