import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type ProviderName = 'facebook';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signInWithProvider: (provider: ProviderName) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitial = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Auth: getSession error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getInitial();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      // data.session may be null if email confirmation is enabled
      if (data?.session?.user) setUser(data.session.user);
      return { data, error };
    } catch (error) {
      return { data: null, error } as any;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (data?.session?.user) setUser(data.session.user);
      return { data, error };
    } catch (error) {
      return { data: null, error } as any;
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: ProviderName) => {
    setLoading(true);
    try {
      // For Supabase JS v2
      await supabase.auth.signInWithOAuth({ provider });
      // Redirect to provider; Supabase will handle callback and onAuthStateChange will update user
    } catch (error) {
      console.error('OAuth sign-in error', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithProvider, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
