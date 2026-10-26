import type { BenefitFile, BenefitType } from './types';

const HEALTH = /(doença|doenca|auxílio|auxilio|incapacidade|bpc|saúde|saude|invalidez|médico|medico|cid|loas|deficien)/i;
const OTHER_DOCS = /^outros?\s+documentos?\b/;

export function isHealthBenefit(name: string): boolean {
  return HEALTH.test(name);
}

export function isOtherDocuments(label: string): boolean {
  const normalized = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return OTHER_DOCS.test(normalized);
}

export function visibleBenefitFiles(benefit: BenefitType | null): BenefitFile[] {
  if (!benefit) return [];
  return (benefit.requiredFiles ?? []).filter((file) => !isOtherDocuments(file.label));
}

export const GENERIC_ATTACHMENT: BenefitFile = {
  id: 'generic',
  label: 'Documento',
  acceptedTypes: 'jpg, png, pdf',
  order: 0,
};

export function attachmentSlots(benefits: BenefitType[], selected: BenefitType | null): BenefitFile[] {
  if (benefits.length === 0) return [GENERIC_ATTACHMENT];
  return visibleBenefitFiles(selected);
}

export function matchBenefits(benefits: BenefitType[], query: string): BenefitType[] {
  const term = query.trim().toLowerCase();
  if (!term) return benefits;
  return benefits.filter((item) => item.name.toLowerCase().includes(term));
}

export function mimeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'pdf') return 'application/pdf';
  return 'application/octet-stream';
}

export const MAX_FILE_BYTES = 100 * 1024 * 1024;

export function fileProblem(mime: string, size: number): string | null {
  if (mime !== 'image/jpeg' && mime !== 'image/png' && mime !== 'application/pdf') {
    return 'Formato não suportado. Use JPG, PNG ou PDF.';
  }
  if (size > MAX_FILE_BYTES) return 'Arquivo excede o limite de 100 MB.';
  if (size <= 0) return 'O arquivo parece vazio.';
  return null;
}
