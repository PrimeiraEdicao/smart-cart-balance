// src/context/AppContext.tsx

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { ListItem, Category, Comment, PriceEntry } from '@/types/shopping'; // Adicionado PriceEntry
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { defaultCategories } from '@/data/categories';

interface AppContextType {
  session: Session | null;
  user: User | null;
  loadingAuth: boolean;
  signOut: () => Promise<any>;
  items: ListItem[];
  isLoadingItems: boolean;
  addItem: (item: Partial<ListItem>) => void;
  updateItem: (variables: { id: string } & Partial<ListItem>) => void;
  deleteItem: (id: string) => void;
  updateItemsOrder: (items: ListItem[]) => void;
  categories: Category[];
  isLoadingCategories: boolean;
  addCategory: (category: Omit<Category, 'id' | 'user_id'>) => void;
  updateCategory: (variables: { id: string } & Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getComments: (itemId: string) => { data: Comment[], isLoading: boolean };
  addComment: (comment: { item_id: string, text: string }) => void;
  getPriceHistory: (itemId: string) => { data: PriceEntry[], isLoading: boolean }; // Nova função
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  // --- QUERIES ---
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      if (data.length === 0) { // Seed initial categories for new users
        const seedData = defaultCategories.map(c => ({ ...c, user_id: user.id }));
        await supabase.from('categories').insert(seedData);
        return seedData;
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('items').select('*').order('order');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getComments = (itemId: string) => {
    return useQuery({
      queryKey: ['comments', itemId],
      queryFn: async () => {
        const { data, error } = await supabase.from('comments').select('*').eq('item_id', itemId).order('created_at');
        if (error) throw error;
        return data || [];
      },
      enabled: !!itemId,
    });
  };

  // Nova função para buscar histórico de preços
  const getPriceHistory = (itemId: string) => {
    return useQuery({
      queryKey: ['price_history', itemId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('price_history')
          .select('*')
          .eq('item_id', itemId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        // A interface PriceEntry espera 'date', então fazemos a conversão
        return data.map(entry => ({ ...entry, date: new Date(entry.created_at) })) || [];
      },
      enabled: !!itemId,
    });
  };

  // --- MUTATIONS ---
  const { mutate: addItem } = useMutation({
    mutationFn: async (newItem: Partial<ListItem>) => {
      if (!user) throw new Error("Usuário não autenticado");
      return supabase.from('items').insert([{ ...newItem, user_id: user.id }]).select();
    },
    onSuccess: () => {
      toast.success("Item adicionado!");
      queryClient.invalidateQueries({ queryKey: ['items', user?.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { mutate: updateItem } = useMutation({
    mutationFn: async (variables: { id: string } & Partial<ListItem>) => supabase.from('items').update(variables).eq('id', variables.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items', user?.id] }),
    onError: (e: any) => toast.error(e.message),
  });
  
  const { mutate: deleteItem } = useMutation({
    mutationFn: async (id: string) => supabase.from('items').delete().eq('id', id),
    onSuccess: () => {
      toast.error("Item removido.");
      queryClient.invalidateQueries({ queryKey: ['items', user?.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { mutate: updateItemsOrder } = useMutation({
      mutationFn: async (orderedItems: ListItem[]) => {
          const updates = orderedItems.map(item => ({ id: item.id, order: item.order }));
          return supabase.from('items').upsert(updates);
      },
      onError: (e: any) => toast.error(e.message),
  });

  const { mutate: addCategory } = useMutation({
      mutationFn: async (newCategory: Omit<Category, 'id' | 'user_id'>) => {
          if (!user) throw new Error("Usuário não autenticado");
          return supabase.from('categories').insert([{ ...newCategory, user_id: user.id }]);
      },
      onSuccess: () => {
          toast.success("Categoria adicionada!");
          queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
      },
      onError: (e: any) => toast.error(e.message),
  });

  const { mutate: updateCategory } = useMutation({
      mutationFn: async (variables: { id: string } & Partial<Category>) => supabase.from('categories').update(variables).eq('id', variables.id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', user?.id] }),
      onError: (e: any) => toast.error(e.message),
  });

  const { mutate: deleteCategory } = useMutation({
      mutationFn: async (id: string) => supabase.from('categories').delete().eq('id', id),
      onSuccess: () => {
          toast.error("Categoria removida.");
          queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
      },
      onError: (e: any) => toast.error(e.message),
  });
  
  const { mutate: addComment } = useMutation({
    mutationFn: async (newComment: { item_id: string, text: string }) => {
        if (!user) throw new Error("Usuário não autenticado");
        return supabase.from('comments').insert([{ ...newComment, user_id: user.id }]);
    },
    onSuccess: (_, variables) => {
        toast.success("Comentário adicionado!");
        queryClient.invalidateQueries({ queryKey: ['comments', variables.item_id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const value = {
    session, user, loadingAuth, signOut,
    items, isLoadingItems, addItem, updateItem, deleteItem, updateItemsOrder,
    categories, isLoadingCategories, addCategory, updateCategory, deleteCategory,
    getComments, addComment,
    getPriceHistory, // Adicionando ao contexto
  };

  return <AppContext.Provider value={value as any}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};