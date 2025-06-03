
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuickPurchaseDialog } from "@/components/QuickPurchaseDialog";

export interface QuickPurchaseItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

const CompraRapida = () => {
  const navigate = useNavigate();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [items, setItems] = useState<QuickPurchaseItem[]>([
    { id: '1', name: 'Pão Francês', quantity: 10, price: 0.50, total: 5.00 },
    { id: '2', name: 'Banana Prata', quantity: 2, price: 3.20, total: 6.40 },
  ]);

  const addItem = (name: string, quantity: number, price: number) => {
    const total = quantity * price;
    const newItem: QuickPurchaseItem = {
      id: Date.now().toString(),
      name,
      quantity,
      price,
      total,
    };
    setItems([...items, newItem]);
  };

  const totalSpent = items.reduce((sum, item) => sum + item.total, 0);
  const remainingBalance = 500 - totalSpent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">Compra Rápida</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Purchase Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-blue-100 mb-1">Total Parcial</div>
              <div className="text-xl font-bold">R$ {totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-green-100 mb-1">Saldo Restante</div>
              <div className="text-xl font-bold">R$ {remainingBalance.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Produtos Registrados</h2>
          {items.map((item) => (
            <Card key={item.id} className="bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.quantity} x R$ {item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600">
                      R$ {item.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">Nenhum produto registrado</div>
            <div className="text-gray-500 text-sm">Use o botão + para escanear códigos de barras</div>
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-sm text-yellow-800">
              <strong>💡 Dica:</strong> Toque no botão + para escanear o código de barras dos produtos e adicionar automaticamente à sua compra.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Scan Button */}
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
        onClick={() => setShowPurchaseDialog(true)}
      >
        <div className="flex flex-col items-center">
          <Camera className="h-6 w-6 mb-1" />
          <span className="text-xs">Scan</span>
        </div>
      </Button>

      <QuickPurchaseDialog
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
        onAddItem={addItem}
      />
    </div>
  );
};

export default CompraRapida;
