'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAppUser(sbUser: SupabaseUser, profile?: { role: string } | null): User {
  return {
    id: sbUser.id,
    name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || '',
    email: sbUser.email || '',
    isAdmin: profile?.role === 'admin',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (sbUser: SupabaseUser): Promise<User> => {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', sbUser.id)
      .maybeSingle();

    return toAppUser(sbUser, profile);
  }, []);

  const fetchUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }
    const appUser = await fetchProfile(session.user);
    setUser(appUser);
    setLoading(false);
  }, [fetchProfile]);

  useEffect(() => {
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const appUser = await fetchProfile(session.user);
        setUser(appUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUser, fetchProfile]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      const appUser = await fetchProfile(data.user);
      setUser(appUser);
    }
  };

  const register = async (name: string, email: string, password: string, _passwordConfirmation: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    if (data.user) {
      const appUser = await fetchProfile(data.user);
      setUser(appUser);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = user?.isAdmin ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
