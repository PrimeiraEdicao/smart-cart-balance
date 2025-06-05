
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ListItem, Category, ShoppingList, ListTemplate } from '@/types/shopping';
import { SupabaseService } from '@/services/supabaseService';
import { v4 as uuidv4 } from 'uuid';

interface ShoppingStore {
  // Current list
  currentList: ShoppingList | null;
  
  // All lists
  lists: ShoppingList[];
  
  // Templates
  templates: ListTemplate[];
  
  // Categories
  categories: Category[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  createList: (name: string, budget: number) => Promise<void>;
  updateList: (id: string, updates: Partial<ShoppingList>) => void;
  deleteList: (id: string) => void;
  setCurrentList: (listId: string) => void;
  loadUserLists: () => Promise<void>;
  
  addItem: (name: string, quantity: number, categoryId?: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<ListItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  loadListItems: (listId: string) => Promise<void>;
  
  addTemplate: (template: Omit<ListTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<ListTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  setCategoryBudgets: (categoryBudgets: { categoryId: string; budget: number }[]) => void;
  
  // Realtime updates
  handleRealtimeUpdate: (payload: any, type: 'list' | 'item' | 'comment' | 'member') => void;
}

export const useShoppingStore = create<ShoppingStore>()(
  persist(
    (set, get) => ({
      currentList: null,
      lists: [],
      templates: [],
      isLoading: false,
      categories: [
        { id: 'dairy', name: 'Laticínios', color: 'bg-blue-200' },
        { id: 'grains-cereals', name: 'Grãos e Cereais', color: 'bg-yellow-200' },
        { id: 'meat', name: 'Carnes', color: 'bg-red-200' },
        { id: 'fruits', name: 'Frutas', color: 'bg-green-200' },
        { id: 'vegetables', name: 'Vegetais', color: 'bg-emerald-200' },
        { id: 'cleaning', name: 'Limpeza', color: 'bg-purple-200' },
        { id: 'hygiene', name: 'Higiene', color: 'bg-pink-200' },
        { id: 'others', name: 'Outros', color: 'bg-gray-200' },
      ],

      createList: async (name, budget) => {
        set({ isLoading: true });
        try {
          const newList = await SupabaseService.createList(name, budget);
          
          const formattedList: ShoppingList = {
            id: newList.id,
            name: newList.name,
            items: [],
            budget: newList.budget,
            categoryBudgets: [],
            createdAt: new Date(newList.created_at),
            updatedAt: new Date(newList.updated_at),
          };

          set((state) => ({
            lists: [...state.lists, formattedList],
            currentList: formattedList,
            isLoading: false,
          }));
        } catch (error) {
          console.error('Error creating list:', error);
          set({ isLoading: false });
        }
      },

      loadUserLists: async () => {
        set({ isLoading: true });
        try {
          const lists = await SupabaseService.getUserLists();
          const formattedLists: ShoppingList[] = lists.map(list => ({
            id: list.id,
            name: list.name,
            items: [],
            budget: list.budget,
            categoryBudgets: [],
            createdAt: new Date(list.created_at),
            updatedAt: new Date(list.updated_at),
          }));

          set({ lists: formattedLists, isLoading: false });
        } catch (error) {
          console.error('Error loading lists:', error);
          set({ isLoading: false });
        }
      },

      loadListItems: async (listId: string) => {
        try {
          const items = await SupabaseService.getListItems(listId);
          const formattedItems: ListItem[] = items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            purchased: item.purchased,
            price: item.price,
            addedBy: item.added_by?.name || 'Usuário',
            categoryId: item.category_id,
            assignedTo: item.assigned_to?.name,
            claimedBy: item.claimed_by?.name,
            order: item.item_order,
            purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
          }));

          set((state) => ({
            currentList: state.currentList ? {
              ...state.currentList,
              items: formattedItems
            } : null
          }));
        } catch (error) {
          console.error('Error loading items:', error);
        }
      },

      updateList: (id, updates) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === id ? { ...list, ...updates, updatedAt: new Date() } : list
          ),
          currentList:
            state.currentList?.id === id
              ? { ...state.currentList, ...updates, updatedAt: new Date() }
              : state.currentList,
        }));
      },

      deleteList: (id) => {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== id),
          currentList: state.currentList?.id === id ? null : state.currentList,
        }));
      },

      setCurrentList: async (listId) => {
        const list = get().lists.find((l) => l.id === listId);
        if (list) {
          set({ currentList: list });
          await get().loadListItems(listId);
        }
      },

      addItem: async (name, quantity, categoryId) => {
        const { currentList } = get();
        if (!currentList) return;

        try {
          await SupabaseService.addItem(currentList.id, name, quantity, categoryId);
          // O item será adicionado via realtime update
        } catch (error) {
          console.error('Error adding item:', error);
        }
      },

      updateItem: async (id, updates) => {
        try {
          await SupabaseService.updateItem(id, updates);
          // O item será atualizado via realtime update
        } catch (error) {
          console.error('Error updating item:', error);
        }
      },

      deleteItem: async (id) => {
        try {
          await SupabaseService.deleteItem(id);
          // O item será removido via realtime update
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      },

      addTemplate: (template) => {
        const newTemplate: ListTemplate = {
          ...template,
          id: uuidv4(),
        };

        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? { ...template, ...updates } : template
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }));
      },

      setCategoryBudgets: (categoryBudgets) => {
        const { currentList } = get();
        if (!currentList) return;

        const updatedList = { ...currentList, categoryBudgets, updatedAt: new Date() };

        set((state) => ({
          currentList: updatedList,
          lists: state.lists.map((list) =>
            list.id === currentList.id ? updatedList : list
          ),
        }));
      },

      handleRealtimeUpdate: (payload, type) => {
        console.log('Realtime update:', type, payload);
        
        if (type === 'item') {
          const { currentList } = get();
          if (!currentList) return;

          if (payload.eventType === 'INSERT') {
            const newItem: ListItem = {
              id: payload.new.id,
              name: payload.new.name,
              quantity: payload.new.quantity,
              purchased: payload.new.purchased,
              price: payload.new.price,
              addedBy: 'Outro usuário',
              categoryId: payload.new.category_id,
              order: payload.new.item_order,
            };

            set((state) => ({
              currentList: state.currentList ? {
                ...state.currentList,
                items: [...state.currentList.items, newItem]
              } : null
            }));
          } else if (payload.eventType === 'UPDATE') {
            set((state) => ({
              currentList: state.currentList ? {
                ...state.currentList,
                items: state.currentList.items.map(item =>
                  item.id === payload.new.id ? {
                    ...item,
                    name: payload.new.name,
                    quantity: payload.new.quantity,
                    purchased: payload.new.purchased,
                    price: payload.new.price,
                    categoryId: payload.new.category_id,
                  } : item
                )
              } : null
            }));
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              currentList: state.currentList ? {
                ...state.currentList,
                items: state.currentList.items.filter(item => item.id !== payload.old.id)
              } : null
            }));
          }
        }
      },
    }),
    {
      name: 'shopping-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lists: state.lists,
        templates: state.templates,
        categories: state.categories,
        currentList: state.currentList,
      }),
    }
  )
);
