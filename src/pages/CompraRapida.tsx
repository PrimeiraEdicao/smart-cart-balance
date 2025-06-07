// src/pages/CompraRapida.tsx

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Camera, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuickPurchaseDialog } from "@/components/QuickPurchaseDialog";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import usePersistentState from "@/hooks/usePersistentState";
import { toast } from "sonner";

const CompraRapida = () => {
  const navigate = useNavigate();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const { items: allItems, isLoadingItems } = useAppContext();
  
  // Usando o hook para persistir o orçamento
  const [totalBudget, setTotalBudget] = usePersistentState<number>('quickBuyBudget', 500);

  const purchasedToday = useMemo(() => {
    const today = new Date().toDateString();
    return allItems.filter(item => 
      item.purchased && 
      item.purchaseDate && 
      new Date(item.purchaseDate).toDateString() === today
    );
  }, [allItems]);
  
  const totalSpent = useMemo(() => {
    return purchasedToday.reduce((sum, item) => sum + (item.price! * item.quantity), 0);
  }, [purchasedToday]);

  const remainingBalance = totalBudget - totalSpent;

  const handleSetBudget = () => {
    const newBudget = prompt("Defina o orçamento total para esta compra:", totalBudget.toString());
    if (newBudget !== null && !isNaN(parseFloat(newBudget))) {
      setTotalBudget(parseFloat(newBudget));
      toast.success("Orçamento atualizado!");
    } else if (newBudget !== null) {
      toast.error("Valor inválido. Insira apenas números.");
    }
  };

  if (isLoadingItems) {
    return (
        <div className="p-4 max-w-md mx-auto space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">Compra Rápida</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-blue-100 mb-1">Total Parcial</div>
              <div className="text-xl font-bold">R$ {totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card 
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 cursor-pointer hover:opacity-90"
            onClick={handleSetBudget}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center text-sm text-green-100 mb-1">
                Saldo Restante
                <PiggyBank className="h-4 w-4 ml-2" />
              </div>
              <div className="text-xl font-bold">R$ {remainingBalance.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Produtos Registrados Hoje</h2>
          {purchasedToday.map((item) => (
            <Card key={item.id} className="bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.quantity} x R$ {item.price!.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600">
                      R$ {(item.price! * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {purchasedToday.length === 0 && (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">Nenhum produto registrado hoje</div>
            <div className="text-gray-500 text-sm">Use o botão de Scan para adicionar um produto</div>
          </div>
        )}

        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-sm text-yellow-800">
              <strong>💡 Dica:</strong> Clique no card de "Saldo Restante" para definir seu orçamento total para esta compra.
            </div>
          </CardContent>
        </Card>
      </div>

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
      />
    </div>
  );
};

export default CompraRapida;