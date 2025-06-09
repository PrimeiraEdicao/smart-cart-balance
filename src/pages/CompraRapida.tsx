import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Camera, PiggyBank, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuickPurchaseDialog } from "@/components/QuickPurchaseDialog";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import usePersistentState from "@/hooks/usePersistentState";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const CompraRapida = () => {
  const navigate = useNavigate();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const { items: allItems, isLoadingItems } = useAppContext();
  
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
  const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleSetBudget = () => {
    const newBudgetStr = prompt("Defina o orçamento para esta compra:", totalBudget.toString());
    if (newBudgetStr) {
        const newBudget = parseFloat(newBudgetStr);
        if (!isNaN(newBudget) && newBudget >= 0) {
            setTotalBudget(newBudget);
            toast.success("Orçamento da compra atualizado!");
        } else {
            toast.error("Valor inválido. Insira apenas números.");
        }
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">Compra Rápida</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <Card>
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <PiggyBank className="h-5 w-5 text-green-600" />
                        Orçamento da Compra
                    </h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSetBudget}>
                        <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-500">Total Gasto</p>
                        <p className="text-lg font-bold text-red-600">R$ {totalSpent.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Saldo Restante</p>
                        <p className={`text-lg font-bold ${remainingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            R$ {remainingBalance.toFixed(2)}
                        </p>
                    </div>
                </div>
                {totalBudget > 0 && (
                    <div className="mt-3">
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-gray-500 text-right mt-1">
                            {Math.min(100, progress).toFixed(0)}% de R$ {totalBudget.toFixed(2)}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Produtos Registrados Hoje</h2>
          {purchasedToday.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
              <Camera className="h-10 w-10 text-gray-300 mx-auto mb-4" />
              <p className="font-medium">Nenhum produto registrado</p>
              <p className="text-sm">Use o botão de Scan para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchasedToday.map((item) => (
                <Card key={item.id} className="bg-white border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} x R$ {item.price!.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-bold text-gray-800">
                        R$ {(item.price! * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setShowPurchaseDialog(true)}
      >
        <Camera className="h-6 w-6" />
      </Button>

      <QuickPurchaseDialog
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
      />
    </div>
  );
};

export default CompraRapida;