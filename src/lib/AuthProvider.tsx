'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; 
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{user: User | null, session: Session | null, profile: any | null, loading: boolean}>({
    user: null,
    session: null,
    profile: null,
    loading: true
  });

  const fetchProfile = async (userId: string, role?: string) => {
    const isTeacher = role === 'teacher' || role === 'admin';
    const table = isTeacher ? 'teachers' : 'profiles';
    const { data: profile } = await supabase.from(table)
      .select('id, name, email, institution, course, is_financial_aid_eligible')
      .eq('id', userId)
      .maybeSingle();
    return profile;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await fetchProfile(session.user.id, session.user.user_metadata?.role);
        setState({ session, user: session.user, profile, loading: false });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session) {
        const profile = await fetchProfile(session.user.id, session.user.user_metadata?.role);
        setState({ session, user: session.user, profile, loading: false });
      } else if (event === 'SIGNED_OUT') {
        setState({ session: null, user: null, profile: null, loading: false });
      } else {
        setState(prev => ({ ...prev, session, user: session?.user ?? null, loading: false }));
      }
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
  }), [state.user?.id, state.session?.access_token, state.profile, state.loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
