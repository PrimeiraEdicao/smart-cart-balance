import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { ListItem, Category } from '@/types/shopping';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 1. Renomear a interface do Contexto para refletir seu novo propósito
interface AppContextType {
  session: Session | null;
  user: User | null;
  loadingAuth: boolean; // Renomeado para clareza
  signOut: () => Promise<any>;
  items: ListItem[];
  isLoadingItems: boolean;
  updateItem: (variables: { id: string } & Partial<ListItem>) => void;
  deleteItem: (id: string) => void;
  // (outras funções e estados que você adicionará no futuro)
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // --- AUTENTICAÇÃO ---
  useEffect(() => {
    setLoadingAuth(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();
  
  // --- GERENCIAMENTO DE DADOS (ITEMS) ---
  const { data: items = [], isLoading: isLoadingItems } = useQuery<ListItem[]>({
    queryKey: ['items', user?.id],
    queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase.from('items').select('*').order('created_at');
        if (error) throw new Error(error.message);
        return data || [];
    },
    enabled: !!user,
  });

  const { mutate: updateItem } = useMutation({
    mutationFn: async (variables: { id: string } & Partial<ListItem>) => {
      const { id, ...updates } = variables;
      const { data, error } = await supabase.from('items').update(updates).eq('id', id);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', user?.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: deleteItem } = useMutation({
    mutationFn: async (id: string) => {
       const { error } = await supabase.from('items').delete().eq('id', id);
       if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.error("Item removido.");
      queryClient.invalidateQueries({ queryKey: ['items', user?.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const value = {
    session,
    user,
    loadingAuth,
    signOut,
    items,
    isLoadingItems,
    updateItem,
    deleteItem,
  };

  return (
    <AppContext.Provider value={value as AppContextType}>
      {children}
    </AppContext.Provider>
  );
};

// 2. Renomear o hook para uso geral
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};