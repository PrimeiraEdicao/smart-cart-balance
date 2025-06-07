import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { useShoppingHistory, HistoryList } from "@/hooks/useShoppingHistory";
import { ListItemOptionsDialog } from "@/components/ListItemOptionsDialog";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>
);


const Historico = () => {
  const navigate = useNavigate();
  const { isLoadingItems } = useAppContext();
  const { historyLists, handleDeleteHistory } = useShoppingHistory();
  
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<HistoryList | null>(null);

  const handleOptionsClick = (historyList: HistoryList) => {
    setSelectedHistory(historyList);
    setOptionsOpen(true);
  };

  if (isLoadingItems) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
             <div className="bg-white shadow-sm border-b"><div className="max-w-md mx-auto px-4 py-4 flex items-center space-x-4"><Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-xl font-bold text-gray-800">Histórico de Compras</h1></div></div>
             <LoadingSkeleton />
        </div>
    );
  }

  return (
    <>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOptionsClick(list)}>
                          <MoreVertical className="h-4 w-4" />
                      </Button>
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
        <ListItemOptionsDialog 
            open={optionsOpen}
            onOpenChange={setOptionsOpen}
            historyList={selectedHistory}
            onDelete={handleDeleteHistory}
        />
    </>
  );
};

export default Historico;