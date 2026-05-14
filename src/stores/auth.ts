import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
}

const DEMO_USER = {
  id: 'demo-user-00000000-0000-0000-0000-000000000000',
  email: 'demo@forge.id',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { demo: true },
} as unknown as User;

export const useAuth = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  isDemo: false,
  async hydrate() {
    if (!isSupabaseConfigured) {
      set({ session: null, user: null, loading: false });
      return;
    }
    try {
      const { data } = await supabase.auth.getSession();
      set({ session: data.session, user: data.session?.user ?? null, loading: false });
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
      });
    } catch {
      set({ session: null, user: null, loading: false });
    }
  },
  async signIn(email, password) {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase belum di-set. Tap “Mode Demo” buat preview tanpa backend.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      set({ session: data.session, user: data.user, isDemo: false });
      return { error: null };
    } catch (err) {
      return { error: `Gak konek ke server: ${(err as Error).message}` };
    }
  },
  async signUp(email, password) {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase belum di-set. Tap “Mode Demo” buat preview tanpa backend.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      set({ session: data.session, user: data.user, isDemo: false });
      return { error: null };
    } catch (err) {
      return { error: `Gak konek ke server: ${(err as Error).message}` };
    }
  },
  signInDemo() {
    const fakeSession = {
      access_token: 'demo-token',
      refresh_token: 'demo-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: DEMO_USER,
    } as unknown as Session;
    set({ session: fakeSession, user: DEMO_USER, isDemo: true, loading: false });
  },
  async signOut() {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    set({ session: null, user: null, isDemo: false });
  },
}));
