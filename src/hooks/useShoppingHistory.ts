import { useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { ListItem } from "@/types/shopping";

export interface HistoryList {
  id: string; // Usaremos a data como ID
  date: string; // Data formatada para exibição
  rawDate: Date; // Objeto Date para manipulação
  itemCount: number;
  totalSpent: number;
  items: ListItem[]; // Itens associados a esta entrada do histórico
}

export const useShoppingHistory = () => {
  const { items, deletePurchaseHistory } = useAppContext();

  const historyLists = useMemo<HistoryList[]>(() => {
    const purchasedItems = items.filter(item => item.purchased && item.purchaseDate);

    const groups = purchasedItems.reduce((acc, item) => {
      const purchaseDate = new Date(item.purchaseDate!);
      // Normaliza a data para ignorar a hora, minuto e segundo na hora de agrupar
      const dateKey = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate()).toISOString();
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          rawDate: purchaseDate,
          items: []
        };
      }
      acc[dateKey].items.push(item);
      return acc;
    }, {} as Record<string, { rawDate: Date; items: ListItem[] }>);

    return Object.entries(groups).map(([dateKey, group]) => {
      const formattedDate = group.rawDate.toLocaleDateString('pt-BR');
      const totalSpent = group.items.reduce((sum, item) => sum + (item.price! * item.quantity), 0);

      return {
        id: dateKey,
        date: formattedDate,
        rawDate: group.rawDate,
        itemCount: group.items.length,
        totalSpent,
        items: group.items,
      };
    })
    .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()) // Ordena do mais recente para o mais antigo
    .slice(0, 15); // Limita aos últimos 15 registros
  }, [items]);

  const handleDeleteHistory = (historyId: string) => {
    const historyEntry = historyLists.find(h => h.id === historyId);
    if (historyEntry) {
      deletePurchaseHistory(historyEntry.items.map(item => item.id));
    }
  };

  return { historyLists, handleDeleteHistory };
};