import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { ListItem, Category } from '@/types/shopping';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AppContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<any>;
  items: ListItem[];
  isLoadingItems: boolean;
  addItem: (item: Omit<ListItem, 'id' | 'user_id' | 'created_at'>) => void;
  updateItem: (id: string, updates: Partial<ListItem>) => void;
  deleteItem: (id: string) => void;
  categories: Category[];
  isLoadingCategories: boolean;
  addCategory: (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const queryClient = useQueryClient();

  // --- AUTENTICAÇÃO ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();
  
  // --- GERENCIAMENTO DE DADOS COM REACT QUERY ---

  // BUSCAR CATEGORIAS
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user, // Só executa a query se o usuário estiver logado
  });

  // BUSCAR ITENS
  const { data: items = [], isLoading: isLoadingItems } = useQuery<ListItem[]>({
    queryKey: ['items', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  // --- MUTAÇÕES (Adicionar, Atualizar, Deletar) ---

  const { mutate: addItem } = useMutation({
    mutationFn: async (newItem: Omit<ListItem, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from('items')
        .insert([{ ...newItem, user_id: user.id }])
        .select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success("Item adicionado!");
      queryClient.invalidateQueries({ queryKey: ['items', user?.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: updateItem } = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ListItem>) => {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', user?.id] });
    },
    onError: (error) => toast.error(error.message),
  });
  
  // O deleteItem agora é otimista, não precisa da lógica de "desfazer" manual.
  // Se der erro, o react-query pode reverter.
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
  
   const { mutate: addCategory } = useMutation({
    mutationFn: async (newCategory: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase.from('categories').insert([{...newCategory, user_id: user.id}]);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success("Categoria adicionada!");
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
    },
    onError: (error) => toast.error(error.message)
  });


  // --- TEMPO REAL ---
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase.channel('public:items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          // Quando algo muda no banco de dados, invalida a query para forçar o re-fetch
          queryClient.invalidateQueries({ queryKey: ['items', user.id] });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const value = {
    session, user, signOut,
    items, isLoadingItems, addItem, updateItem, deleteItem,
    categories, isLoadingCategories, addCategory,
  };

  return (
    <AppContext.Provider value={value as any}>
      {!loadingAuth && children}
    </AppContext.Provider>
  );
};

export const useShopping = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useShopping must be used within an AppProvider');
  }
  return context;
};