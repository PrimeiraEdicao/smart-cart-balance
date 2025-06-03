import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Barcode, Users, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddItemDialog } from "@/components/AddItemDialog";
import { ItemActionDialog } from "@/components/ItemActionDialog";
import { ScanAddDialog } from "@/components/ScanAddDialog";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { ItemCommentsDialog } from "@/components/ItemCommentsDialog";
import { CategoryBudgetDialog } from "@/components/CategoryBudgetDialog";
import { CategorySpendingCard } from "@/components/CategorySpendingCard";
import { ListItem, Comment } from "@/types/shopping";
import { defaultCategories } from "@/data/categories";

const Lista = () => {
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const [items, setItems] = useState<ListItem[]>([
    { 
      id: '1', 
      name: 'Arroz', 
      quantity: 2, 
      purchased: false, 
      addedBy: 'você',
      categoryId: 'grains-cereals'
    },
    { 
      id: '2', 
      name: 'Feijão', 
      quantity: 1, 
      purchased: false, 
      addedBy: 'João',
      categoryId: 'grains-cereals'
    },
    { 
      id: '3', 
      name: 'Açúcar', 
      quantity: 1, 
      purchased: true, 
      price: 4.50, 
      addedBy: 'você',
      categoryId: 'grains-cereals',
      purchaseDate: new Date()
    },
    { 
      id: '4', 
      name: 'Leite', 
      quantity: 3, 
      purchased: false, 
      addedBy: 'Maria',
      categoryId: 'dairy'
    },
  ]);

  const [categoryBudgets, setCategoryBudgets] = useState<{ categoryId: string; budget: number }[]>([
    { categoryId: 'dairy', budget: 50.00 },
    { categoryId: 'grains-cereals', budget: 80.00 }
  ]);

  const addItem = (name: string, quantity: number, categoryId?: string) => {
    const newItem: ListItem = {
      id: Date.now().toString(),
      name,
      quantity,
      purchased: false,
      addedBy: 'você',
      categoryId,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<ListItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addComment = (itemId: string, text: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newComment: Comment = {
          id: Date.now().toString(),
          text,
          author: 'você',
          timestamp: new Date(),
        };
        return {
          ...item,
          comments: [...(item.comments || []), newComment]
        };
      }
      return item;
    }));
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    const category = defaultCategories.find(c => c.id === categoryId);
    return category ? category.name : null;
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return 'bg-gray-200';
    const category = defaultCategories.find(c => c.id === categoryId);
    return category ? category.color : 'bg-gray-200';
  };

  const handleItemLongPress = (item: ListItem) => {
    setSelectedItem(item);
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

  const totalSpent = items
    .filter(item => item.purchased && item.price)
    .reduce((sum, item) => sum + (item.price! * item.quantity), 0);

  const remainingBalance = 500 - totalSpent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-800">Lista de Compras</h1>
          </div>
          <div className="flex space-x-2">
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

        {/* Items List */}
        <div className="space-y-3">
          {items.map((item) => (
            <Card 
              key={item.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                item.purchased ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
              onMouseDown={() => handleMouseDown(item)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={() => handleMouseDown(item)}
              onTouchEnd={handleMouseUp}
              onClick={() => handleItemClick(item)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`font-medium ${item.purchased ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                        {item.name}
                      </div>
                      {item.categoryId && (
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(item.categoryId)}`} />
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
                    {item.categoryId && (
                      <div className="text-xs text-gray-400 mt-1">
                        {getCategoryName(item.categoryId)}
                      </div>
                    )}
                    <div className="text-xs text-purple-600 mt-1">
                      Adicionado por {item.addedBy}
                    </div>
                    {item.comments && item.comments.length > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        💬 {item.comments.length} comentário(s)
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
          onAddComment={addComment}
        />
      )}

      <CategoryBudgetDialog
        open={showBudgetDialog}
        onOpenChange={setShowBudgetDialog}
        categoryBudgets={categoryBudgets}
        onUpdateBudgets={setCategoryBudgets}
      />
    </div>
  );
};

export default Lista;
