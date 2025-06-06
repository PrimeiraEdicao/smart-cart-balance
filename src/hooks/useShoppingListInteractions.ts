import { useState, useMemo, DragEvent } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ListItem } from '@/types/shopping';

export function useShoppingListInteractions(
    items: ListItem[],
    onOrderChange: (reorderedItems: ListItem[]) => void
) {
  const { categories } = useAppContext();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);

  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<ListItem | null>(null);
  const [groupBy, setGroupBy] = useState<'none' | 'category'>('none');

  const getCategoryName = (categoryId?: string) => categories.find(c => c.id === categoryId)?.name || null;
  const getCategoryColor = (categoryId?: string) => categories.find(c => c.id === categoryId)?.color || 'bg-gray-200';

  const handleItemClick = (item: ListItem) => {
    setSelectedItem(item);
    setShowActionDialog(true);
  };
  
  const handleCommentClick = (item: ListItem) => {
      setSelectedItem(item);
      setShowCommentsDialog(true);
  }

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
    newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    const updatedItems = newItems.map((item, index) => ({ ...item, order: index }));
    onOrderChange(updatedItems);
    setDraggedItem(null);
  };

  const groupedItems = useMemo(() => {
    if (groupBy === 'category') {
      return items.reduce((acc, item) => {
        const key = item.categoryId || 'other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, ListItem[]>);
    }
    return { all: [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) };
  }, [items, groupBy]);

  return {
    groupedItems,
    draggedItem,
    selectedItem,
    groupBy, setGroupBy,
    showAddDialog, setShowAddDialog,
    showActionDialog, setShowActionDialog,
    showCategoryManager, setShowCategoryManager,
    showCommentsDialog, setShowCommentsDialog,
    getCategoryName, getCategoryColor,
    handleItemClick, handleCommentClick,
    handleDragStart, handleDragOver, handleDrop
  };
}