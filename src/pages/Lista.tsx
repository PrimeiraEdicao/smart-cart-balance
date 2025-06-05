import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Barcode, Users, PiggyBank, BookTemplate, TrendingUp, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddItemDialog } from "@/components/AddItemDialog";
import { ItemActionDialog } from "@/components/ItemActionDialog";
import { ScanAddDialog } from "@/components/ScanAddDialog";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { ItemCommentsDialog } from "@/components/ItemCommentsDialog";
import { CategoryBudgetDialog } from "@/components/CategoryBudgetDialog";
import { CategorySpendingCard } from "@/components/CategorySpendingCard";
import { ListTemplateDialog } from "@/components/ListTemplateDialog";
import { ItemPriceHistoryDialog } from "@/components/ItemPriceHistoryDialog";
import { ListItem, ListTemplate } from "@/types/shopping";
import { useShoppingStore } from "@/store/useShoppingStore";
import { useCommentsStore } from "@/store/useCommentsStore";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const Lista = () => {
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showPriceHistoryDialog, setShowPriceHistoryDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [draggedItem, setDraggedItem] = useState<ListItem | null>(null);
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'manual'>('none');

  // Store hooks
  const { user } = useAuthStore();
  const {
    currentList,
    categories,
    createList,
    addItem,
    updateItem,
    deleteItem,
    setCategoryBudgets,
    loadUserLists,
    setCurrentList,
    handleRealtimeUpdate,
    isLoading,
  } = useShoppingStore();

  const { 
    addComment, 
    getItemComments, 
    loadItemComments,
    handleRealtimeCommentUpdate 
  } = useCommentsStore();

  // Realtime sync
  useRealtimeSync({
    listId: currentList?.id,
    onListUpdate: (payload) => handleRealtimeUpdate(payload, 'list'),
    onItemUpdate: (payload) => handleRealtimeUpdate(payload, 'item'),
    onCommentUpdate: (payload) => handleRealtimeCommentUpdate(payload),
    onMemberUpdate: (payload) => handleRealtimeUpdate(payload, 'member'),
  });

  // Initialize data
  useEffect(() => {
    if (user) {
      loadUserLists();
    } else {
      // Fallback para lista local se não estiver autenticado
      if (!currentList) {
        createList("Lista de Compras", 500);
      }
    }
  }, [user, currentList, createList, loadUserLists]);

  // Load first list if available
  useEffect(() => {
    const state = useShoppingStore.getState();
    if (user && state.lists.length > 0 && !currentList) {
      setCurrentList(state.lists[0].id);
    }
  }, [user, currentList, setCurrentList]);

  // Get items from current list or empty array
  const items = currentList?.items || [];
  const categoryBudgets = currentList?.categoryBudgets || [];

  const createFromTemplate = (template: ListTemplate) => {
    if (!currentList) return;
    
    const templateItems: ListItem[] = template.items.map((templateItem, index) => ({
      id: Date.now().toString() + index,
      ...templateItem,
      purchased: false,
      order: index + 1
    }));
    
    // Clear current items and add template items
    currentList.items.forEach(item => deleteItem(item.id));
    templateItems.forEach(item => {
      addItem(item.name, item.quantity, item.categoryId);
    });
    
    if (template.categoryBudgets) {
      setCategoryBudgets(template.categoryBudgets);
    }
  };

  const assignItemToMember = (itemId: string, memberId: string) => {
    updateItem(itemId, { assignedTo: memberId });
  };

  const claimItem = (itemId: string, memberId: string) => {
    updateItem(itemId, { claimedBy: memberId });
  };

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, item: ListItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItem: ListItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
    const targetIndex = items.findIndex(item => item.id === targetItem.id);

    const newItems = [...items];
    newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    // Update order for all items
    newItems.forEach((item, index) => {
      updateItem(item.id, { order: index + 1 });
    });

    setDraggedItem(null);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : null;
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return 'bg-gray-200';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'bg-gray-200';
  };

  const handleItemLongPress = (item: ListItem) => {
    setSelectedItem(item);
    loadItemComments(item.id);
    setShowCommentsDialog(true);
  };

  const handleMouseDown = (item: ListItem) => {
    const timer = setTimeout(() => {
      handleItemLongPress(item);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleItemClick = (item: ListItem) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setSelectedItem(item);
    setShowActionDialog(true);
  };

  const handleItemDoubleClick = (item: ListItem) => {
    setSelectedItem(item);
    setShowPriceHistoryDialog(true);
  };

  // Group items
  const getGroupedItems = () => {
    if (groupBy === 'category') {
      const grouped = items.reduce((acc, item) => {
        const categoryId = item.categoryId || 'other';
        if (!acc[categoryId]) acc[categoryId] = [];
        acc[categoryId].push(item);
        return acc;
      }, {} as Record<string, ListItem[]>);
      return grouped;
    }
    return { all: items.sort((a, b) => (a.order || 0) - (b.order || 0)) };
  };

  const groupedItems = getGroupedItems();

  const totalSpent = items
    .filter(item => item.purchased && item.price)
    .reduce((sum, item) => sum + (item.price! * item.quantity), 0);

  const remainingBalance = (currentList?.budget || 500) - totalSpent;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {currentList?.name || 'Lista de Compras'}
              </h1>
              {user && (
                <div className="text-xs text-green-600">
                  🔄 Sincronização em tempo real ativa
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowTemplateDialog(true)}
              className="text-orange-600 hover:bg-orange-50"
            >
              <BookTemplate className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowBudgetDialog(true)}
              className="text-green-600 hover:bg-green-50"
            >
              <PiggyBank className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowAddMemberDialog(true)}
              className="text-purple-600 hover:bg-purple-50"
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowScanDialog(true)}
              className="text-blue-600 hover:bg-blue-50"
            >
              <Barcode className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Balance Info */}
        <Card className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="text-sm text-green-100 mb-1">Você ainda tem</div>
            <div className="text-2xl font-bold">R$ {remainingBalance.toFixed(2)}</div>
            <div className="text-sm text-green-100">do seu orçamento</div>
          </CardContent>
        </Card>

        {/* Category Spending */}
        <CategorySpendingCard items={items} categoryBudgets={categoryBudgets} />

        {/* Grouping Options */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant={groupBy === 'none' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGroupBy('none')}
          >
            Lista
          </Button>
          <Button
            variant={groupBy === 'category' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGroupBy('category')}
          >
            Por Categoria
          </Button>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([groupKey, groupItems]) => (
            <div key={groupKey}>
              {groupBy === 'category' && groupKey !== 'all' && (
                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(groupKey)}`} />
                    <div className="font-medium text-gray-700">
                      {getCategoryName(groupKey) || 'Outros'}
                    </div>
                    <div className="text-sm text-gray-500">({groupItems.length})</div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {groupItems.map((item) => {
                  const itemComments = getItemComments(item.id);
                  return (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        item.purchased ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      } ${draggedItem?.id === item.id ? 'opacity-50' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item)}
                      onMouseDown={() => handleMouseDown(item)}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={() => handleMouseDown(item)}
                      onTouchEnd={handleMouseUp}
                      onClick={() => handleItemClick(item)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className={`font-medium ${item.purchased ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                                {item.name}
                              </div>
                              {item.categoryId && (
                                <div className={`w-2 h-2 rounded-full ${getCategoryColor(item.categoryId)}`} />
                              )}
                              {item.priceHistory && item.priceHistory.length > 1 && (
                                <TrendingUp className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              Quantidade: {item.quantity}
                              {item.purchased && item.price && (
                                <span className="ml-2 text-green-600 font-medium">
                                  • R$ {(item.price * item.quantity).toFixed(2)}
                                </span>
                              )}
                            </div>
                            
                            {item.categoryId && groupBy !== 'category' && (
                              <div className="text-xs text-gray-400 mt-1">
                                {getCategoryName(item.categoryId)}
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-2 mt-1">
                              <div className="text-xs text-purple-600">
                                Adicionado por {item.addedBy}
                              </div>
                              {item.assignedTo && (
                                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  Atribuído: {item.assignedTo}
                                </div>
                              )}
                              {item.claimedBy && (
                                <div className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                  Reivindicado: {item.claimedBy}
                                </div>
                              )}
                            </div>
                            
                            {itemComments.length > 0 && (
                              <div className="text-xs text-blue-600 mt-1">
                                💬 {itemComments.length} comentário(s)
                              </div>
                            )}
                          </div>
                          
                          {item.purchased && (
                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              Comprado
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Lista vazia</div>
            <div className="text-gray-500 text-sm">Adicione itens à sua lista de compras</div>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        onClick={() => setShowAddDialog(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Dialogs */}
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddItem={addItem}
      />

      {selectedItem && (
        <ItemActionDialog
          open={showActionDialog}
          onOpenChange={setShowActionDialog}
          item={selectedItem}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
        />
      )}

      <ScanAddDialog
        open={showScanDialog}
        onOpenChange={setShowScanDialog}
        onAddItem={addItem}
      />

      <AddMemberDialog
        open={showAddMemberDialog}
        onOpenChange={setShowAddMemberDialog}
      />

      {selectedItem && (
        <ItemCommentsDialog
          open={showCommentsDialog}
          onOpenChange={setShowCommentsDialog}
          item={selectedItem}
          onAddComment={(itemId, text) => addComment(itemId, text)}
        />
      )}

      <CategoryBudgetDialog
        open={showBudgetDialog}
        onOpenChange={setShowBudgetDialog}
        categoryBudgets={categoryBudgets}
        onUpdateBudgets={setCategoryBudgets}
      />

      <ListTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        currentItems={items}
        onCreateFromTemplate={createFromTemplate}
      />

      <ItemPriceHistoryDialog
        open={showPriceHistoryDialog}
        onOpenChange={setShowPriceHistoryDialog}
        item={selectedItem}
      />
    </div>
  );
};

export default Lista;
