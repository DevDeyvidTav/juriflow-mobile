export const SIGNUP_FIELDS: { key: string; label: string }[] = [
  { key: 'name', label: 'Nome completo' },
  { key: 'nickname', label: 'Apelido' },
  { key: 'legalRepresentative', label: 'Representante legal' },
  { key: 'cpf', label: 'CPF' },
  { key: 'maritalStatus', label: 'Estado civil' },
  { key: 'gender', label: 'Sexo / Gênero' },
  { key: 'address', label: 'Endereço' },
  { key: 'city', label: 'Cidade' },
  { key: 'accessMethod', label: 'Forma de acesso' },
  { key: 'referencePoint', label: 'Ponto de referência' },
  { key: 'primaryContact', label: 'Contato principal' },
  { key: 'primaryPhoneOwner', label: 'Proprietário telefone principal' },
  { key: 'secondaryContact', label: 'Telefone secundário' },
  { key: 'secondaryPhoneOwner', label: 'Proprietário telefone secundário' },
  { key: 'govPassword', label: 'Senha Gov.br' },
  { key: 'hasINSSRequest', label: 'Já deu entrada no INSS?' },
  { key: 'hasJusticeRequest', label: 'Já deu entrada na justiça?' },
  { key: 'targetBenefit', label: 'Tipo de benefício' },
  { key: 'diseases', label: 'Doenças' },
  { key: 'sinceWhen', label: 'Desde quando' },
  { key: 'symptoms', label: 'Observações' },
  { key: 'periciaScheduledAt', label: 'Agendamento de perícia' },
  { key: 'avaliacaoSocialScheduledAt', label: 'Agendamento avaliação social' },
  { key: 'audienciaScheduledAt', label: 'Agendamento de audiência' },
  { key: 'indication', label: 'Indicação' },
  { key: 'captureDate', label: 'Data da captação' },
];

export const DEFAULT_REQUIRED_FIELDS = [
  'name',
  'cpf',
  'maritalStatus',
  'address',
  'city',
  'accessMethod',
  'referencePoint',
  'primaryContact',
  'hasINSSRequest',
  'hasJusticeRequest',
  'targetBenefit',
  'indication',
  'captureDate',
];

const CHECKED_ON_SUBMIT = [
  'name',
  'maritalStatus',
  'gender',
  'address',
  'city',
  'accessMethod',
  'referencePoint',
  'primaryContact',
  'primaryPhoneOwner',
  'secondaryContact',
  'secondaryPhoneOwner',
  'govPassword',
  'targetBenefit',
  'diseases',
  'sinceWhen',
  'symptoms',
  'periciaScheduledAt',
  'avaliacaoSocialScheduledAt',
  'audienciaScheduledAt',
  'indication',
  'captureDate',
  'nickname',
  'legalRepresentative',
];

export function fieldLabel(key: string): string {
  return SIGNUP_FIELDS.find((field) => field.key === key)?.label ?? key;
}

export function isFieldRequired(requiredFields: string[] | undefined, key: string): boolean {
  if (key === 'name' || key === 'cpf') return true;
  return (requiredFields ?? DEFAULT_REQUIRED_FIELDS).includes(key);
}

export function firstMissingField(
  requiredFields: string[] | undefined,
  values: Record<string, string>,
): string | null {
  for (const key of CHECKED_ON_SUBMIT) {
    if (!isFieldRequired(requiredFields, key)) continue;
    if (!String(values[key] ?? '').trim()) {
      return `${fieldLabel(key)} é obrigatório neste kanban.`;
    }
  }
  return null;
}
