import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Edit, Camera, Barcode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddItemDialog } from "@/components/AddItemDialog";
import { ItemActionDialog } from "@/components/ItemActionDialog";
import { ScanAddDialog } from "@/components/ScanAddDialog";

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  price?: number;
}

const Lista = () => {
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const [items, setItems] = useState<ListItem[]>([
    { id: '1', name: 'Arroz', quantity: 2, purchased: false },
    { id: '2', name: 'Feijão', quantity: 1, purchased: false },
    { id: '3', name: 'Açúcar', quantity: 1, purchased: true, price: 4.50 },
    { id: '4', name: 'Leite', quantity: 3, purchased: false },
  ]);

  const addItem = (name: string, quantity: number) => {
    const newItem: ListItem = {
      id: Date.now().toString(),
      name,
      quantity,
      purchased: false,
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

      
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Balance Info */}
        <Card className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="text-sm text-green-100 mb-1">Você ainda tem</div>
            <div className="text-2xl font-bold">R$ {remainingBalance.toFixed(2)}</div>
            <div className="text-sm text-green-100">do seu orçamento</div>
          </CardContent>
        </Card>

        {/* Items List */}
        <div className="space-y-3">
          {items.map((item) => (
            <Card 
              key={item.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                item.purchased ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
              onClick={() => {
                setSelectedItem(item);
                setShowActionDialog(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className={`font-medium ${item.purchased ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Quantidade: {item.quantity}
                      {item.purchased && item.price && (
                        <span className="ml-2 text-green-600 font-medium">
                          • R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
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
    </div>
  );
};

export default Lista;
