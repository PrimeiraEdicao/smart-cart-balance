import { useState, useMemo, DragEvent } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ListItem } from '@/types/shopping';

export function useShoppingListInteractions(
    items: ListItem[],
    onOrderChange: (reorderedItems: ListItem[]) => void
) {
  const { categories } = useAppContext();
  const [draggedItem, setDraggedItem] = useState<ListItem | null>(null);
  const [groupBy, setGroupBy] = useState<'none' | 'category'>('none');

  const getCategoryName = (categoryId?: string) => categories.find(c => c.id === categoryId)?.name || 'Sem Categoria';
  const getCategoryColor = (categoryId?: string) => categories.find(c => c.id === categoryId)?.color || 'bg-gray-200';

  const handleDragStart = (e: DragEvent, item: ListItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => e.preventDefault();

  const handleDrop = (e: DragEvent, targetItem: ListItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;
    const currentItems = [...items];
    const draggedIndex = currentItems.findIndex(item => item.id === draggedItem.id);
    const targetIndex = currentItems.findIndex(item => item.id === targetItem.id);
    currentItems.splice(draggedIndex, 1);
    currentItems.splice(targetIndex, 0, draggedItem);
    const updatedItems = currentItems.map((item, index) => ({ ...item, order: index }));
    onOrderChange(updatedItems);
    setDraggedItem(null);
  };

  // CORREÇÃO PRINCIPAL: Garantir que o retorno seja sempre um objeto
  const groupedItems = useMemo(() => {
    if (groupBy === 'category') {
      const groups = items.reduce((acc, item) => {
        const key = item.categoryId || 'other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, ListItem[]>);
      // Retorna o objeto de grupos diretamente
      return groups;
    }
    // Para o modo 'none', retorna um objeto com uma única chave 'all'
    return { all: [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) };
  }, [items, groupBy]);

  return {
    groupedItems,
    draggedItem,
    groupBy, setGroupBy,
    getCategoryName, getCategoryColor,
    handleDragStart, handleDragOver, handleDrop
  };
}