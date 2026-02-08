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
    // OTIMIZAÇÃO TURBO: Recuperação de sessão ultra-rápida
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setState({
        session,
        user: session?.user ?? null,
        loading: false
      });
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setState(prev => {
        // Só atualiza se houver mudança real para evitar re-renders
        if (prev.user?.id === session?.user?.id && prev.loading === false) return prev;
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

  // Memoiza o valor do contexto para evitar re-render em todos os filhos quando o estado não muda
  const contextValue = useMemo(() => ({
    ...state,
    signOut
  }), [state]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
