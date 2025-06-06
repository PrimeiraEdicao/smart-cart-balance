import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { ListItem } from "@/types/shopping";

interface HistoryList {
  id: string;
  date: string;
  itemCount: number;
  totalSpent: number;
}

const Historico = () => {
  const navigate = useNavigate();
  const { items, isLoadingItems } = useAppContext();

  // Agrupa itens comprados pela data da compra
  const historyLists = useMemo<HistoryList[]>(() => {
    const purchasedItems = items.filter(item => item.purchased && item.purchaseDate);

    const groups = purchasedItems.reduce((acc, item) => {
      const date = new Date(item.purchaseDate!).toLocaleDateString('pt-BR');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, ListItem[]>);

    return Object.entries(groups).map(([date, itemsInDate]) => ({
      id: date,
      date,
      itemCount: itemsInDate.length,
      totalSpent: itemsInDate.reduce((sum, item) => sum + (item.price! * item.quantity), 0),
    })).sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime());
  }, [items]);

  if (isLoadingItems) {
    return <div>Carregando histórico...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-800">Histórico de Compras</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-3">
          {historyLists.map((list) => (
            <Card key={list.id} className="bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Compra de {list.date}</div>
                      <div className="text-sm text-gray-500">
                        {list.itemCount} itens • R$ {list.totalSpent.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {historyLists.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhuma compra registrada no histórico.
          </div>
        )}
      </div>
    </div>
  );
};

export default Historico;