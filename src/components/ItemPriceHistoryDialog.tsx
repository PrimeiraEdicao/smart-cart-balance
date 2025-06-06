// src/components/ItemPriceHistoryDialog.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { ListItem, PriceEntry } from "@/types/shopping";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis } from "recharts";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ItemPriceHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ListItem | null;
}

const LoadingSkeleton = () => (
    <DialogContent>
        <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Histórico de Preços</span>
            </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
            <div className="flex flex-col items-center space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-32 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    </DialogContent>
);


export const ItemPriceHistoryDialog = ({ open, onOpenChange, item }: ItemPriceHistoryDialogProps) => {
  const { getPriceHistory } = useAppContext();
  
  if (!item) return null;

  const { data: priceHistory = [], isLoading } = getPriceHistory(item.id);

  const currentPrice = item.price || priceHistory[0]?.price;
  const previousPrice = priceHistory[1]?.price;
  
  const priceChange = currentPrice && previousPrice ? currentPrice - previousPrice : 0;
  const priceChangePercent = previousPrice ? ((priceChange / previousPrice) * 100) : 0;

  const chartData = priceHistory.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    price: entry.price,
    store: entry.store
  })).reverse(); // Reverter para o gráfico mostrar do mais antigo para o mais novo

  const chartConfig = {
    price: {
      label: "Preço",
      color: "hsl(var(--chart-1))",
    },
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getTrendIcon = () => {
    if (priceChange > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (priceChange < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (priceChange > 0) return "text-red-600";
    if (priceChange < 0) return "text-green-600";
    return "text-gray-600";
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isLoading ? <LoadingSkeleton /> : (
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Histórico de Preços</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 min-h-0 p-1">
            <div className="text-center">
              <div className="font-medium text-lg text-gray-800">{item.name}</div>
              {currentPrice && (
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  R$ {currentPrice.toFixed(2)}
                </div>
              )}
              {priceChange !== 0 && previousPrice && (
                <div className={`flex items-center justify-center space-x-1 mt-2 ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="text-sm font-medium">
                    {priceChange > 0 ? '+' : ''}R$ {priceChange.toFixed(2)} 
                    ({priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>

            {chartData.length > 1 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-3">Variação de Preços</div>
                <ChartContainer config={chartConfig} className="h-32">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="var(--color-price)" 
                      strokeWidth={2}
                      dot={{ fill: "var(--color-price)" }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Histórico de Compras</div>
              {priceHistory.map((entry: PriceEntry, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">
                        R$ {entry.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(new Date(entry.date))}
                      </div>
                    </div>
                    {entry.store && (
                      <div className="text-xs text-gray-400">
                        {entry.store}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {priceHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <div>Nenhum histórico disponível</div>
                <div className="text-sm">Compre este item para começar o histórico</div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};