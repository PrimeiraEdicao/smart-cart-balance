
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Share, Trash2, Calendar, Filter, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";

interface HistoryList {
  id: string;
  date: string;
  itemCount: number;
  totalSpent: number;
  title: string;
  categorySpending: { categoryId: string; amount: number }[];
}

const Historico = () => {
  const navigate = useNavigate();
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<HistoryList | null>(null);
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month' | 'all'>('all');
  const [showCharts, setShowCharts] = useState(false);
  
  const [historyLists] = useState<HistoryList[]>([
    { 
      id: '1', 
      date: '2024-04-15', 
      itemCount: 8, 
      totalSpent: 127.50, 
      title: 'Compra - 15/04/2024',
      categorySpending: [
        { categoryId: 'dairy', amount: 35.20 },
        { categoryId: 'grains-cereals', amount: 45.80 },
        { categoryId: 'meat-fish', amount: 46.50 }
      ]
    },
    { 
      id: '2', 
      date: '2024-04-12', 
      itemCount: 12, 
      totalSpent: 89.30, 
      title: 'Compra - 12/04/2024',
      categorySpending: [
        { categoryId: 'dairy', amount: 25.10 },
        { categoryId: 'grains-cereals', amount: 32.20 },
        { categoryId: 'cleaning', amount: 32.00 }
      ]
    },
    { 
      id: '3', 
      date: '2024-04-08', 
      itemCount: 5, 
      totalSpent: 45.80, 
      title: 'Compra - 08/04/2024',
      categorySpending: [
        { categoryId: 'fruits-vegetables', amount: 25.80 },
        { categoryId: 'bakery', amount: 20.00 }
      ]
    },
    { 
      id: '4', 
      date: '2024-04-05', 
      itemCount: 15, 
      totalSpent: 203.40, 
      title: 'Compra - 05/04/2024',
      categorySpending: [
        { categoryId: 'dairy', amount: 45.20 },
        { categoryId: 'meat-fish', amount: 89.20 },
        { categoryId: 'grains-cereals', amount: 69.00 }
      ]
    },
    { 
      id: '5', 
      date: '2024-04-01', 
      itemCount: 7, 
      totalSpent: 67.20, 
      title: 'Compra - 01/04/2024',
      categorySpending: [
        { categoryId: 'hygiene', amount: 35.20 },
        { categoryId: 'cleaning', amount: 32.00 }
      ]
    },
  ]);

  const filterListsByPeriod = (lists: HistoryList[]) => {
    const now = new Date();
    const filtered = lists.filter(list => {
      const listDate = new Date(list.date);
      const diffDays = Math.floor((now.getTime() - listDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (periodFilter) {
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredLists = filterListsByPeriod(historyLists);

  const chartData = filteredLists.reverse().map(list => ({
    date: new Date(list.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    total: list.totalSpent,
    items: list.itemCount
  }));

  const totalSpentInPeriod = filteredLists.reduce((sum, list) => sum + list.totalSpent, 0);
  const averageSpentPerList = filteredLists.length > 0 ? totalSpentInPeriod / filteredLists.length : 0;

  const chartConfig = {
    total: {
      label: "Total Gasto",
      color: "hsl(var(--chart-1))",
    },
    items: {
      label: "Itens",
      color: "hsl(var(--chart-2))",
    },
  };

  const handleListClick = (list: HistoryList) => {
    navigate('/lista');
  };

  const handleLongPress = (list: HistoryList) => {
    setSelectedList(list);
    setShowActionDialog(true);
  };

  const handleShare = () => {
    if (selectedList) {
      const message = `Lista de Compras - ${selectedList.title}\n${selectedList.itemCount} itens\nTotal: R$ ${selectedList.totalSpent.toFixed(2)}`;
      
      if (navigator.share) {
        navigator.share({
          title: selectedList.title,
          text: message,
        });
      } else {
        navigator.clipboard.writeText(message);
        alert('Lista copiada para a área de transferência!');
      }
    }
    setShowActionDialog(false);
  };

  const handleDelete = () => {
    if (selectedList) {
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

  const getPeriodLabel = () => {
    switch (periodFilter) {
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mês';
      default: return 'Todos';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-800">Histórico de Listas</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowCharts(!showCharts)}
            className={showCharts ? "text-blue-600 bg-blue-50" : ""}
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex items-center space-x-3 mb-6">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={periodFilter} onValueChange={(value: 'week' | 'month' | 'all') => setPeriodFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-4">
            <div className="text-sm text-blue-100 mb-1">Total gasto - {getPeriodLabel()}</div>
            <div className="text-2xl font-bold">R$ {totalSpentInPeriod.toFixed(2)}</div>
            <div className="text-sm text-blue-100">
              Média por lista: R$ {averageSpentPerList.toFixed(2)} • {filteredLists.length} listas
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        {showCharts && chartData.length > 1 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-700 mb-4">Gastos ao Longo do Tempo</div>
              <ChartContainer config={chartConfig} className="h-40">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      name === 'total' ? `R$ ${value}` : value,
                      name === 'total' ? 'Total Gasto' : 'Itens'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="var(--color-total)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-total)" }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Lists */}
        <div className="space-y-3">
          {filteredLists.map((list) => (
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

        {filteredLists.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              Nenhuma lista encontrada para {getPeriodLabel().toLowerCase()}
            </div>
            <div className="text-gray-500 text-sm">Tente alterar o filtro de período</div>
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
