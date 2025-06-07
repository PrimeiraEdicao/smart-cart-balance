import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { ListItem, Category, Comment, PriceEntry, ShoppingList, ListMember } from '@/types/shopping';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { defaultCategories } from '@/data/categories';
import usePersistentState from '@/hooks/usePersistentState';

interface AppContextType {
  session: Session | null;
  user: User | null;
  loadingAuth: boolean;
  signOut: () => Promise<any>;
  
  shoppingLists: ShoppingList[];
  isLoadingLists: boolean;
  activeList: ShoppingList | null;
  switchActiveList: (list: ShoppingList | null) => void;
  createList: (name: string) => void;
  updateList: (listId: string, newName: string) => void; // Adicionada função de update
  deleteList: (listId: string) => void;

  members: ListMember[];
  isLoadingMembers: boolean;
  inviteMember: (email: string) => void;
  removeMember: (userId: string) => void;

  items: ListItem[];
  isLoadingItems: boolean;
  addItem: (item: Partial<Omit<ListItem, 'list_id'>>) => void;
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
  getPriceHistory: (itemId: string) => { data: PriceEntry[], isLoading: boolean };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeListId, setActiveListId] = usePersistentState<string | null>('activeShoppingListId', null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoadingAuth(false);
      if (!session) {
        setActiveListId(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [setActiveListId]);

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
  };

  const { data: shoppingLists = [], isLoading: isLoadingLists } = useQuery({
    queryKey: ['shoppingLists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('shopping_lists').select('*');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const activeList = shoppingLists.find(list => list.id === activeListId) || null;

  const switchActiveList = (list: ShoppingList | null) => {
    setActiveListId(list?.id ?? null);
  };

  // ... (código das queries de members, items, categories, etc. permanece o mesmo) ...
  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['members', activeList?.id],
    queryFn: async () => {
        if (!activeList) return [];
        const { data, error } = await supabase
            .from('list_members')
            .select('*, user_profile:profiles(id, email, raw_user_meta_data)')
            .eq('list_id', activeList.id);
        if (error) throw error;
        return (data || []).map(member => ({
            ...member,
            user_id: (member.user_profile as any)?.id ?? member.user_id,
            user_profile: member.user_profile || { email: 'Convidado' }
        }));
    },
    enabled: !!activeList,
  });

  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['items', activeList?.id],
    queryFn: async () => {
      if (!activeList) return [];
      const { data, error } = await supabase.from('items').select('*').eq('list_id', activeList.id).order('order');
      if (error) throw error;
      return data;
    },
    enabled: !!activeList,
  });
  
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      if (data.length === 0) {
        const seedData = defaultCategories.map(c => ({ ...c, user_id: user.id }));
        const { data: insertedData, error: insertError } = await supabase.from('categories').insert(seedData).select();
        if (insertError) throw insertError;
        return insertedData;
      }
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

  const getPriceHistory = (itemId: string) => {
    return useQuery({
      queryKey: ['price_history', itemId],
      queryFn: async () => {
        const { data, error } = await supabase.from('price_history').select('*').eq('item_id', itemId).order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(entry => ({ ...entry, date: new Date(entry.created_at) })) || [];
      },
      enabled: !!itemId,
    });
  };

  // --- MUTATIONS ---
  const { mutate: createList } = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase.rpc('create_new_list', { list_name: name });
      if (error) throw error;
      return data[0] as ShoppingList;
    },
    onSuccess: (newList) => {
      toast.success(`Lista "${newList.name}" criada!`);
      // CORREÇÃO: Atualiza o cache imediatamente
      queryClient.setQueryData(['shoppingLists', user?.id], (oldData: ShoppingList[] | undefined) => {
          return oldData ? [...oldData, newList] : [newList];
      });
      // Define a nova lista como ativa
      switchActiveList(newList);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // NOVA MUTATION
  const { mutate: updateList } = useMutation({
      mutationFn: async ({ listId, newName }: { listId: string, newName: string }) => {
          const { error } = await supabase.from('shopping_lists').update({ name: newName }).eq('id', listId);
          if (error) throw error;
      },
      onSuccess: () => {
          toast.success("Nome da lista atualizado.");
          queryClient.invalidateQueries({ queryKey: ['shoppingLists', user?.id] });
      },
      onError: (e: any) => toast.error(e.message),
  });

  // ... (código das outras mutações permanece o mesmo) ...

  const { mutate: deleteList } = useMutation({
    mutationFn: async (listId: string) => supabase.from('shopping_lists').delete().eq('id', listId),
    onSuccess: () => {
        toast.error("Lista removida.");
        queryClient.invalidateQueries({ queryKey: ['shoppingLists', user?.id] });
        setActiveListId(null);
    },
    onError: (e: any) => toast.error(e.message),
});

const { mutate: inviteMember } = useMutation({
  mutationFn: async (email: string) => {
      if (!activeList || !user) throw new Error("Nenhuma lista ativa ou usuário não autenticado.");
      // O ideal é chamar uma função Edge do Supabase para convidar
      const { error } = await supabase.rpc('invite_user_to_list', {
          p_list_id: activeList.id,
          p_invitee_email: email
      });
      if (error) throw new Error(error.message);
  },
  onSuccess: (_, email) => {
      toast.success(`Convite enviado para ${email}!`);
      queryClient.invalidateQueries({ queryKey: ['members', activeList?.id] });
  },
  onError: (e: any) => toast.error(e.message),
});

const { mutate: removeMember } = useMutation({
    mutationFn: async (userId: string) => {
        if (!activeList) throw new Error("Nenhuma lista ativa.");
        return supabase.from('list_members').delete().eq('list_id', activeList.id).eq('user_id', userId);
    },
    onSuccess: () => {
        toast.info("Membro removido.");
        queryClient.invalidateQueries({ queryKey: ['members', activeList?.id] });
    },
    onError: (e: any) => toast.error(e.message),
});


const { mutate: addItem } = useMutation({
  mutationFn: async (newItem: Partial<Omit<ListItem, 'list_id'>>) => {
    if (!user || !activeList) throw new Error("Usuário ou lista não selecionada");
    return supabase.from('items').insert([{ ...newItem, user_id: user.id, list_id: activeList.id }]).select();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['items', activeList?.id] });
  },
  onError: (e: any) => toast.error(e.message),
});

const { mutate: updateItem } = useMutation({
  mutationFn: async (variables: { id: string } & Partial<ListItem>) => supabase.from('items').update(variables).eq('id', variables.id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items', activeList?.id] }),
  onError: (e: any) => toast.error(e.message),
});

const { mutate: deleteItem } = useMutation({
  mutationFn: async (id: string) => supabase.from('items').delete().eq('id', id),
  onSuccess: () => {
    toast.error("Item removido.");
    queryClient.invalidateQueries({ queryKey: ['items', activeList?.id] });
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
    shoppingLists, isLoadingLists, activeList, switchActiveList, createList, updateList, deleteList,
    members, isLoadingMembers, inviteMember, removeMember,
    items, isLoadingItems, addItem, updateItem, deleteItem, updateItemsOrder,
    categories, isLoadingCategories, addCategory, updateCategory, deleteCategory,
    getComments, addComment, getPriceHistory,
  };

  return <AppContext.Provider value={value as any}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};