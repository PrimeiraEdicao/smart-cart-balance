import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { ListItem } from "@/types/shopping";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface HistoryList {
  id: string;
  date: string;
  itemCount: number;
  totalSpent: number;
}

const LoadingSkeleton = () => (
  <div className="max-w-md mx-auto px-4 py-6 space-y-3">
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
  </div>
);

const Historico = () => {
  const navigate = useNavigate();
  const { activeList } = useAppContext();

  const { data: purchasedItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ["historyItems", activeList?.id],
    queryFn: async () => {
      if (!activeList) return null;
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("list_id", activeList.id)
        .eq("purchased", true)
        .not("purchaseDate", "is", null);

      if (error) {
        console.error("Erro ao buscar itens do Supabase:", error);
        throw error;
      }
      
      // Log para vermos o que o Supabase retorna
      console.log("Dados brutos do Supabase:", data);
      return data;
    },
    enabled: !!activeList,
  });

  const historyLists = useMemo<HistoryList[]>(() => {
    // ✅ 1. Garante que `purchasedItems` é uma lista antes de qualquer operação
    if (!Array.isArray(purchasedItems)) {
      console.log("Debug: `purchasedItems` não é uma lista. Valor:", purchasedItems);
      return [];
    }

    const groups = purchasedItems.reduce((acc, item) => {
      // ✅ 2. Proteção extra contra itens ou datas inválidas
      if (!item || !item.purchaseDate) {
        return acc;
      }
      
      const purchaseDate = new Date(item.purchaseDate);
      if (isNaN(purchaseDate.getTime())) {
        return acc; // Ignora datas inválidas
      }

      const dateKey = purchaseDate.toLocaleDateString("pt-BR");
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    }, {} as Record<string, ListItem[]>);

    return Object.entries(groups)
      .map(([date, itemsInDate]) => {
        // ✅ 3. Proteção para garantir que o valor agrupado é uma lista
        if (!Array.isArray(itemsInDate)) return null;

        const totalSpent = itemsInDate.reduce((sum, item) => {
          const price = typeof item.price === "number" ? item.price : 0;
          const quantity = typeof item.quantity === "number" ? item.quantity : 0;
          return sum + (price * quantity);
        }, 0);

        return {
          id: date,
          date,
          itemCount: itemsInDate.length,
          totalSpent: totalSpent,
        };
      })
      .filter((item): item is HistoryList => item !== null) // Remove quaisquer entradas nulas
      .sort(
        (a, b) =>
          new Date(b.date.split("/").reverse().join("-")).getTime() -
          new Date(a.date.split("/").reverse().join("-")).getTime()
      );
  }, [purchasedItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">
            Histórico de Compras
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {isLoadingItems ? (
          <LoadingSkeleton />
        ) : (
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
                        <div className="font-medium text-gray-800">
                          Compra de {list.date}
                        </div>
                        <div className="text-sm text-gray-500">
                          {list.itemCount} itens • R$ {list.totalSpent.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {historyLists.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Nenhuma compra registrada no histórico.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Historico;