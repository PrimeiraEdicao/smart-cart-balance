
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Share, Trash2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HistoryList {
  id: string;
  date: string;
  itemCount: number;
  totalSpent: number;
  title: string;
}

const Historico = () => {
  const navigate = useNavigate();
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<HistoryList | null>(null);
  
  const [historyLists] = useState<HistoryList[]>([
    { id: '1', date: '2024-04-15', itemCount: 8, totalSpent: 127.50, title: 'Compra - 15/04/2024' },
    { id: '2', date: '2024-04-12', itemCount: 12, totalSpent: 89.30, title: 'Compra - 12/04/2024' },
    { id: '3', date: '2024-04-08', itemCount: 5, totalSpent: 45.80, title: 'Compra - 08/04/2024' },
    { id: '4', date: '2024-04-05', itemCount: 15, totalSpent: 203.40, title: 'Compra - 05/04/2024' },
    { id: '5', date: '2024-04-01', itemCount: 7, totalSpent: 67.20, title: 'Compra - 01/04/2024' },
  ]);

  const handleListClick = (list: HistoryList) => {
    // Simula navegação para a lista específica
    navigate('/lista');
  };

  const handleLongPress = (list: HistoryList) => {
    setSelectedList(list);
    setShowActionDialog(true);
  };

  const handleShare = () => {
    if (selectedList) {
      // Simula compartilhamento
      const message = `Lista de Compras - ${selectedList.title}\n${selectedList.itemCount} itens\nTotal: R$ ${selectedList.totalSpent.toFixed(2)}`;
      
      if (navigator.share) {
        navigator.share({
          title: selectedList.title,
          text: message,
        });
      } else {
        // Fallback para copy to clipboard
        navigator.clipboard.writeText(message);
        alert('Lista copiada para a área de transferência!');
      }
    }
    setShowActionDialog(false);
  };

  const handleDelete = () => {
    if (selectedList) {
      // Aqui removeria a lista do estado
      alert(`Lista "${selectedList.title}" removida!`);
    }
    setShowActionDialog(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">Histórico de Listas</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-3">
          {historyLists.map((list) => (
            <Card 
              key={list.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md bg-white border-gray-200"
              onClick={() => handleListClick(list)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleLongPress(list);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{list.title}</div>
                      <div className="text-sm text-gray-500">
                        {list.itemCount} itens • R$ {list.totalSpent.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(list.date)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {historyLists.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Nenhuma lista encontrada</div>
            <div className="text-gray-500 text-sm">Suas listas de compras aparecerão aqui</div>
          </div>
        )}
      </div>

      {/* Action Dialog */}
      {showActionDialog && selectedList && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-lg p-6 space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg">{selectedList.title}</h3>
              <p className="text-gray-500 text-sm">Escolha uma ação</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-start space-x-3"
                onClick={handleShare}
              >
                <Share className="h-4 w-4" />
                <span>Compartilhar Lista</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-start space-x-3 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir Lista</span>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setShowActionDialog(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historico;
