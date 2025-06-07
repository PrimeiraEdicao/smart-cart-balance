import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { ListItem } from "@/types/shopping";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CategorySpendingCard } from "@/components/CategorySpendingCard";

interface HistoryList {
  id: string;
  date: string;
  itemCount: number;
  totalSpent: number;
}

const LoadingSkeleton = () => (
  <div className="max-w-md mx-auto px-4 py-6 space-y-3">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
  </div>
);

const Historico = () => {
  const navigate = useNavigate();
  const { activeList, categories } = useAppContext();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

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
      // Garante que o retorno seja sempre um array para evitar erros a jusante.
      return Array.isArray(data) ? data : [];
    },
    enabled: !!activeList,
  });

  const filteredHistory = useMemo(() => {
    // Se `purchasedItems` ainda não carregou ou não é um array, retorna uma estrutura vazia.
    if (!Array.isArray(purchasedItems)) {
      return { lists: [], chartData: [], filteredItems: [], categoryBudgets: [] };
    }

    const filteredItems = purchasedItems.filter(item => {
      // **Verificação de Segurança 1: Ignora itens nulos, sem data, ou com data inválida.**
      if (!item || !item.purchaseDate) return false;
      const purchaseDate = new Date(item.purchaseDate);
      if (isNaN(purchaseDate.getTime())) return false;
      
      // Lógica de filtro por período
      if (dateRange.from && purchaseDate < dateRange.from) return false;
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (purchaseDate > toDate) return false;
      }
      return true;
    });

    const groups = filteredItems.reduce((acc, item) => {
      // Esta verificação é redundante devido ao filtro acima, mas é uma segurança extra.
      if (!item || !item.purchaseDate) return acc;
      
      const purchaseDate = new Date(item.purchaseDate);
      const dateKey = purchaseDate.toLocaleDateString("pt-BR", { year: 'numeric', month: '2-digit', day: '2-digit' });
      
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    }, {} as Record<string, ListItem[]>);

    const lists = Object.entries(groups).map(([date, itemsInDate]) => {
      // **Verificação de Segurança 2: Garante que `itemsInDate` é um array antes de usá-lo.**
      if (!Array.isArray(itemsInDate)) return null;

      const totalSpent = itemsInDate.reduce((sum, item) => {
        // **Verificação de Segurança 3: Dentro do reduce, verifica se o item e suas propriedades são válidos.**
        if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
          return sum; 
        }
        return sum + (item.price * item.quantity);
      }, 0);

      return { id: date, date, itemCount: itemsInDate.length, totalSpent };
    })
    .filter((item): item is HistoryList => item !== null)
    .sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime());

    const chartData = Object.entries(groups).map(([date, itemsInDate]) => {
        if (!Array.isArray(itemsInDate)) return { name: date.substring(0, 5), total: 0 };
        
        const total = itemsInDate.reduce((sum, item) => {
            if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') return sum;
            return sum + (item.price * item.quantity);
        }, 0);

        return { name: date.substring(0, 5), total };
    }).sort((a, b) => new Date(a.name.split('/').reverse().join('-')).getTime() - new Date(b.name.split('/').reverse().join('-')).getTime());
    
    const categoryBudgets = categories.map(cat => ({
        categoryId: cat.id,
        budget: cat.budget || 0
    }));

    return { lists, chartData, filteredItems, categoryBudgets };
  }, [purchasedItems, dateRange, categories]);

  const { lists: historyLists, chartData, filteredItems, categoryBudgets } = filteredHistory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">Histórico de Compras</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {isLoadingItems ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Filtrar por Período</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className="flex-1 justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? format(dateRange.from, "PPP", { locale: ptBR }) : <span>Data de início</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateRange.from} onSelect={(d) => setDateRange(prev => ({...prev, from:d ? d : undefined}))} initialFocus /></PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className="flex-1 justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.to ? format(dateRange.to, "PPP", { locale: ptBR }) : <span>Data de fim</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateRange.to} onSelect={(d) => setDateRange(prev => ({...prev, to:d ? d : undefined}))} initialFocus /></PopoverContent>
                    </Popover>
                </CardContent>
            </Card>

            {chartData.length > 0 && (
              <Card>
                  <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        Resumo de Gastos
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `R$${value}`} />
                              <Tooltip formatter={(value: number) => [`R$${value.toFixed(2)}`, "Total"]} cursor={{ fill: "#f3f4f6" }} />
                              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </CardContent>
              </Card>
            )}

            <CategorySpendingCard items={filteredItems} categoryBudgets={categoryBudgets} />

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Detalhes das Compras</h2>
              {historyLists.map((list) => (
                <Card key={list.id} className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <CalendarIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">Compra de {list.date}</div>
                          <div className="text-sm text-gray-500">{list.itemCount} itens • R$ {list.totalSpent.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {historyLists.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nenhuma compra encontrada para o período selecionado.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Historico;