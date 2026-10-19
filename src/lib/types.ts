export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';

export type UserRole = 'EXTERNAL' | 'INTERNAL' | 'ADVOGADO' | 'ADMIN';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  screenPermissions: string[];
};

export type Session = {
  token: string;
  user: SessionUser;
};

export type FormState = {
  name: string;
  nickname: string;
  legalRepresentative: string;
  cpf: string;
  maritalStatus: string;
  gender: string;
  address: string;
  city: string;
  accessMethod: string;
  referencePoint: string;
  primaryContact: string;
  primaryPhoneOwner: string;
  secondaryContact: string;
  secondaryPhoneOwner: string;
  hasINSSRequest: 'SIM' | 'NAO';
  hasJusticeRequest: 'SIM' | 'NAO' | 'NAO_SABE';
  targetBenefit: string;
  diseases: string;
  sinceWhen: string;
  symptoms: string;
  govPassword: string;
  indication: string;
  captureDate: string;
  periciaScheduledAt: string;
  avaliacaoSocialScheduledAt: string;
  audienciaScheduledAt: string;
};

export type ClientPayload = {
  name: string;
  nickname: string;
  legalRepresentative: string;
  cpf: string;
  maritalStatus: string;
  gender: string;
  address: string;
  city: string;
  accessMethod: string;
  referencePoint: string;
  primaryContact: string;
  primaryPhoneOwner: string;
  secondaryContact: string;
  secondaryPhoneOwner: string;
  hasINSSRequest: 'SIM' | 'NAO';
  hasJusticeRequest: 'SIM' | 'NAO' | 'NAO_SABE';
  targetBenefit: string;
  diseases: string;
  sinceWhen: string;
  symptoms: string;
  govPassword: string;
  indication: string;
  captureDate: string;
  periciaScheduledAt: string | null;
  avaliacaoSocialScheduledAt: string | null;
  audienciaScheduledAt: string | null;
  kanbanId: string;
  clientRequestId: string;
  diseaseDetails?: {
    diseases: string;
    sinceWhen: string;
    symptoms: string;
  };
};

export type LocalFile = {
  id: string;
  label: string;
  name: string;
  mime: string;
  uri: string;
  remoteId?: string;
};

export type Cadastro = {
  id: string;
  status: SyncStatus;
  error?: string;
  remoteId?: string;
  userId: string;
  userName: string;
  savedAt: string;
  kanbanId: string;
  kanbanName: string;
  payload: ClientPayload;
  files: LocalFile[];
};

export type CadastroStore = {
  list(): Promise<Cadastro[]>;
  get(id: string): Promise<Cadastro | null>;
  save(item: Cadastro): Promise<void>;
  remove(id: string): Promise<void>;
};

export type ClientApi = {
  createClient(payload: ClientPayload): Promise<{ id: string }>;
  uploadFile(clientId: string, file: LocalFile): Promise<{ id: string }>;
};

export type KanbanBoard = {
  id: string;
  name: string;
  slug: string;
  requiredFields?: string[];
};

export type BenefitFile = {
  id: string;
  label: string;
  acceptedTypes: string;
  order: number;
};

export type BenefitType = {
  id: string;
  name: string;
  order: number;
  requiredFiles: BenefitFile[];
};

export type Catalog = {
  kanbans: KanbanBoard[];
  benefits: BenefitType[];
};

export type CloudClient = {
  id: string;
  name: string;
  city: string;
  createdAt: string;
  kanbanId?: string | null;
  kanbanName?: string | null;
};

export const emptyForm = (): FormState => ({
  name: '',
  nickname: '',
  legalRepresentative: '',
  cpf: '',
  maritalStatus: '',
  gender: '',
  address: '',
  city: '',
  accessMethod: '',
  referencePoint: '',
  primaryContact: '',
  primaryPhoneOwner: '',
  secondaryContact: '',
  secondaryPhoneOwner: '',
  hasINSSRequest: 'NAO',
  hasJusticeRequest: 'NAO_SABE',
  targetBenefit: '',
  diseases: '',
  sinceWhen: '',
  symptoms: '',
  govPassword: '',
  indication: '',
  captureDate: '',
  periciaScheduledAt: '',
  avaliacaoSocialScheduledAt: '',
  audienciaScheduledAt: '',
});
