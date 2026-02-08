'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; 
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{user: User | null, session: Session | null, loading: boolean}>({
    user: null,
    session: null,
    loading: true
  });

  useEffect(() => {
    // TURBO: Recuperação de sessão prioritária
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setState({ session, user: session.user, loading: false });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      // TURBO: Evita re-renders se os dados forem idênticos (previne o "agarrar")
      setState(prev => {
        if (prev.user?.id === session?.user?.id && prev.session?.access_token === session?.access_token && !prev.loading) {
          return prev;
        }
        return {
          session,
          user: session?.user ?? null,
          loading: false
        };
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const contextValue = useMemo(() => ({
    ...state,
    signOut
  }), [state.user?.id, state.session?.access_token, state.loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
