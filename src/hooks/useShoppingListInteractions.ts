import { useState, useMemo, DragEvent } from 'react';
import { useShopping } from '@/context/AppContext';
import { ListItem } from '@/types/shopping';

export function useShoppingListInteractions(items: ListItem[]) {
  const { categories, setItems } = useShopping(); // Adicionado setItems para o drag-and-drop

  // --- Estados de UI ---
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false); // <-- ADICIONAR ESTA LINHA
  // (outros useStates para dialogs)
  
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [draggedItem, setDraggedItem] = useState<ListItem | null>(null);
  const [groupBy, setGroupBy] = useState<'none' | 'category'>('none');

  // --- Funções de Interação ---
  // (getCategoryName, getCategoryColor, etc. permanecem aqui)
  
  const handleDragStart = (e: DragEvent, item: ListItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent, targetItem: ListItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const currentItems = [...items];
    const draggedIndex = currentItems.findIndex(item => item.id === draggedItem.id);
    const targetIndex = currentItems.findIndex(item => item.id === targetItem.id);

    const newItems = [...currentItems];
    newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    const updatedItems = newItems.map((item, index) => ({ ...item, order: index + 1 }));
    // Idealmente, isso chamaria uma função 'updateItemsOrder' no contexto
    // Por enquanto, vamos usar o setItems (se ele for exposto pelo contexto)
    if(setItems) setItems(updatedItems); 
    setDraggedItem(null);
  };
  
  const handleItemClick = (item: ListItem) => {
    setSelectedItem(item);
    setShowActionDialog(true);
  };
  // (outras funções handle...)
  
  const groupedItems = useMemo(() => {
    // ... (lógica do groupedItems) ...
  }, [items, groupBy]);


  // --- Retorno do Hook ---
  return {
    // ... (outros valores retornados) ...
    showAddDialog, setShowAddDialog,
    showActionDialog, setShowActionDialog,
    showCategoryManager, setShowCategoryManager, // <-- ADICIONAR ESTA LINHA
    // ...
    groupedItems,
    selectedItem,
    draggedItem,
    groupBy,
    setGroupBy,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleItemClick,
    // ...
  };
}