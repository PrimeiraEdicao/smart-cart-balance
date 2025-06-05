
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ListItem, Category, ShoppingList, ListTemplate } from '@/types/shopping';
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
  
  // Actions
  createList: (name: string, budget: number) => void;
  updateList: (id: string, updates: Partial<ShoppingList>) => void;
  deleteList: (id: string) => void;
  setCurrentList: (listId: string) => void;
  
  addItem: (name: string, quantity: number, categoryId?: string) => void;
  updateItem: (id: string, updates: Partial<ListItem>) => void;
  deleteItem: (id: string) => void;
  
  addTemplate: (template: Omit<ListTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<ListTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  setCategoryBudgets: (categoryBudgets: { categoryId: string; budget: number }[]) => void;
}

export const useShoppingStore = create<ShoppingStore>()(
  persist(
    (set, get) => ({
      currentList: null,
      lists: [],
      templates: [],
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

      createList: (name, budget) => {
        const newList: ShoppingList = {
          id: uuidv4(),
          name,
          items: [],
          budget,
          categoryBudgets: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          lists: [...state.lists, newList],
          currentList: newList,
        }));
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

      setCurrentList: (listId) => {
        const list = get().lists.find((l) => l.id === listId);
        if (list) {
          set({ currentList: list });
        }
      },

      addItem: (name, quantity, categoryId) => {
        const { currentList } = get();
        if (!currentList) return;

        const newItem: ListItem = {
          id: uuidv4(),
          name,
          quantity,
          purchased: false,
          addedBy: 'você',
          categoryId,
          order: currentList.items.length + 1,
        };

        const updatedItems = [...currentList.items, newItem];
        const updatedList = { ...currentList, items: updatedItems, updatedAt: new Date() };

        set((state) => ({
          currentList: updatedList,
          lists: state.lists.map((list) =>
            list.id === currentList.id ? updatedList : list
          ),
        }));
      },

      updateItem: (id, updates) => {
        const { currentList } = get();
        if (!currentList) return;

        const updatedItems = currentList.items.map((item) => {
          if (item.id === id) {
            // Se está marcando como comprado, adiciona ao histórico de preços
            if (updates.purchased && updates.price && !item.purchased) {
              const newPriceEntry = {
                price: updates.price,
                date: new Date(),
              };
              const updatedPriceHistory = [...(item.priceHistory || []), newPriceEntry];
              return {
                ...item,
                ...updates,
                priceHistory: updatedPriceHistory,
                purchaseDate: new Date(),
              };
            }
            return { ...item, ...updates };
          }
          return item;
        });

        const updatedList = { ...currentList, items: updatedItems, updatedAt: new Date() };

        set((state) => ({
          currentList: updatedList,
          lists: state.lists.map((list) =>
            list.id === currentList.id ? updatedList : list
          ),
        }));
      },

      deleteItem: (id) => {
        const { currentList } = get();
        if (!currentList) return;

        const updatedItems = currentList.items.filter((item) => item.id !== id);
        const updatedList = { ...currentList, items: updatedItems, updatedAt: new Date() };

        set((state) => ({
          currentList: updatedList,
          lists: state.lists.map((list) =>
            list.id === currentList.id ? updatedList : list
          ),
        }));
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
