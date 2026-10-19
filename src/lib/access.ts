import type { SessionUser } from './types';

export function canRegister(user: SessionUser): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'EXTERNAL') return true;
  return user.screenPermissions.includes('cadastro');
}
