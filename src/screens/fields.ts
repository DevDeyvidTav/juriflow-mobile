import type { FormState } from '../lib/types';

export const MARITAL_OPTIONS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'];
export const GENDER_OPTIONS = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'];

type TextKey = keyof FormState;

export type FormField =
  | { key: TextKey; label: string; kind: 'text'; placeholder?: string }
  | { key: TextKey; label: string; kind: 'area'; placeholder?: string }
  | { key: TextKey; label: string; kind: 'select'; options: string[] };

export type FormSection = {
  title: string;
  fields: FormField[];
};

export const BEFORE_BENEFIT: FormSection[] = [
  {
    title: 'Dados do Cliente',
    fields: [
      { key: 'name', label: 'Nome completo', kind: 'text', placeholder: 'Nome do cliente' },
      { key: 'nickname', label: 'Apelido', kind: 'text', placeholder: 'Apelido (opcional)' },
      { key: 'legalRepresentative', label: 'Representante legal', kind: 'text', placeholder: 'Opcional' },
      { key: 'cpf', label: 'CPF', kind: 'text', placeholder: '000.000.000-00' },
      { key: 'maritalStatus', label: 'Estado civil', kind: 'select', options: MARITAL_OPTIONS },
      { key: 'gender', label: 'Sexo / Gênero', kind: 'select', options: GENDER_OPTIONS },
    ],
  },
  {
    title: 'Localização',
    fields: [
      { key: 'address', label: 'Endereço', kind: 'text', placeholder: 'Rua, número, bairro' },
      { key: 'city', label: 'Cidade', kind: 'text', placeholder: 'Cidade' },
      { key: 'accessMethod', label: 'Forma de acesso', kind: 'text', placeholder: 'Ex: Ônibus, carro, moto' },
      { key: 'referencePoint', label: 'Ponto de referência', kind: 'text', placeholder: 'Próximo a...' },
    ],
  },
  {
    title: 'Contatos',
    fields: [
      { key: 'primaryContact', label: 'Contato principal', kind: 'text', placeholder: '(00) 00000-0000' },
      { key: 'primaryPhoneOwner', label: 'Proprietário telefone principal', kind: 'text', placeholder: 'Quem atende este telefone' },
      { key: 'secondaryContact', label: 'Telefone secundário', kind: 'text', placeholder: '(00) 00000-0000' },
      { key: 'secondaryPhoneOwner', label: 'Proprietário telefone secundário', kind: 'text', placeholder: 'Quem atende este telefone' },
      { key: 'govPassword', label: 'Senha Gov.br / Meu INSS', kind: 'text', placeholder: 'Senha do portal' },
    ],
  },
];

export const AFTER_BENEFIT: FormSection[] = [
  {
    title: 'Doenças, tempo e observações',
    fields: [
      { key: 'diseases', label: 'Doenças', kind: 'text', placeholder: 'CID ou descrição' },
      { key: 'sinceWhen', label: 'Desde quando', kind: 'text', placeholder: 'Mês/Ano ou período' },
      { key: 'symptoms', label: 'Observações', kind: 'area', placeholder: 'Descreva as observações principais' },
    ],
  },
  {
    title: 'Agendamentos',
    fields: [
      { key: 'periciaScheduledAt', label: 'Agendamento de perícia', kind: 'text', placeholder: 'DD/MM/AAAA HH:mm' },
      { key: 'avaliacaoSocialScheduledAt', label: 'Agendamento avaliação social', kind: 'text', placeholder: 'DD/MM/AAAA HH:mm' },
      { key: 'audienciaScheduledAt', label: 'Agendamento de audiência', kind: 'text', placeholder: 'DD/MM/AAAA HH:mm' },
    ],
  },
  {
    title: 'Origem do Cliente',
    fields: [
      { key: 'indication', label: 'Indicação', kind: 'text', placeholder: 'Quem indicou?' },
      { key: 'captureDate', label: 'Data da captação', kind: 'text', placeholder: 'DD/MM/AAAA' },
    ],
  },
];

const OPTION_LABEL: Record<string, string> = {
  NAO: 'Não',
  SIM: 'Sim',
  NAO_SABE: 'Não sabe informar',
};

export function optionLabel(value: string): string {
  return OPTION_LABEL[value] ?? value;
}
