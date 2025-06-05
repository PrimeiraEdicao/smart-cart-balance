
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setAuth: (user: User | null, session: Session | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!error && data.session) {
          set({ 
            user: data.user, 
            session: data.session,
            isLoading: false 
          });
        } else {
          set({ isLoading: false });
        }
        
        return { error };
      },

      signUp: async (email: string, password: string) => {
        set({ isLoading: true });
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        
        if (!error && data.session) {
          set({ 
            user: data.user, 
            session: data.session,
            isLoading: false 
          });
        } else {
          set({ isLoading: false });
        }
        
        return { error };
      },

      signOut: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({ 
          user: null, 
          session: null,
          isLoading: false 
        });
      },

      setAuth: (user: User | null, session: Session | null) => {
        set({ user, session });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);
