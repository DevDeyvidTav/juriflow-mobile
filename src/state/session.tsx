import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { login } from '../data/api';
import { clearSession, readSession, saveSession } from '../data/session';
import { canRegister } from '../lib/access';
import type { Session } from '../lib/types';

type SessionApi = {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readSession()
      .then(setSession)
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email: string, password: string) {
    const next = await login(email, password);
    if (!canRegister(next.user)) {
      throw new Error('Seu usuário não tem acesso ao cadastro.');
    }
    await saveSession(next);
    setSession(next);
  }

  async function signOut() {
    await clearSession();
    setSession(null);
  }

  return (
    <SessionContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionApi {
  const value = useContext(SessionContext);
  if (!value) throw new Error('Sessão indisponível.');
  return value;
}
