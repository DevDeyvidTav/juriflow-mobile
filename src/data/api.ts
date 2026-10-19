import { ApiError } from '../lib/api-error';
import { withRetry } from '../lib/retry';
import type { BenefitType, Catalog, ClientApi, CloudClient, KanbanBoard, LocalFile, Session } from '../lib/types';
import { readUpdate, type AppUpdate } from '../lib/version';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
export const VERSION_URL = process.env.EXPO_PUBLIC_VERSION_URL || '';

async function errorFrom(response: Response): Promise<ApiError> {
  if (response.status === 413) {
    return new ApiError('Arquivo excede o tamanho máximo permitido.', 413);
  }
  const body = await response.json().catch(() => ({ message: 'Erro na requisição' }));
  const raw = Array.isArray(body.message) ? body.message.join(', ') : body.message;
  return new ApiError(raw || 'Erro na requisição', response.status);
}

async function request<T>(path: string, token: string | null, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) throw await errorFrom(response);
  return response.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<Session> {
  const data = await request<{
    access_token: string;
    user: Session['user'];
  }>('/auth/login', null, {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  return {
    token: data.access_token,
    user: {
      ...data.user,
      screenPermissions: data.user.screenPermissions ?? [],
    },
  };
}

export async function fetchCatalog(token: string): Promise<Catalog> {
  const [kanbans, benefits] = await Promise.all([
    request<KanbanBoard[]>('/kanban-boards', token),
    request<BenefitType[]>('/benefits', token),
  ]);
  return {
    kanbans: Array.isArray(kanbans) ? kanbans : [],
    benefits: Array.isArray(benefits) ? benefits : [],
  };
}

export async function fetchHistory(token: string): Promise<CloudClient[]> {
  const data = await request<CloudClient[]>('/clients?scope=historico', token);
  return Array.isArray(data) ? data : [];
}

export function createClientApi(token: string): ClientApi {
  return {
    createClient(payload) {
      return request<{ id: string }>('/clients', token, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    uploadFile(clientId, file) {
      return withRetry(() => postFile(token, clientId, file));
    },
  };
}

async function postFile(token: string, clientId: string, file: LocalFile): Promise<{ id: string }> {
  const body = new FormData();
  body.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mime,
  } as unknown as Blob);
  if (file.label) body.append('documentLabel', file.label);
  return request<{ id: string }>(`/clients/${clientId}/attachments`, token, {
    method: 'POST',
    body,
  });
}

export async function fetchUpdate(localVersion: string): Promise<AppUpdate | null> {
  if (!VERSION_URL) return null;
  try {
    const response = await fetch(VERSION_URL);
    if (!response.ok) return null;
    return readUpdate(await response.json(), localVersion);
  } catch {
    return null;
  }
}
