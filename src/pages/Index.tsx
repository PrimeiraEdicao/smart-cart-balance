import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, User, List, ShoppingCart, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext"; // 1. Importar o hook

const Index = () => {
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();
  
  // 2. Obter os dados e funções reais do contexto
  const { items, user, signOut } = useAppContext();

  // 3. Calcular as estatísticas dinamicamente
  const totalItemsInList = items.filter(item => !item.purchased).length;
  const lastPurchaseValue = items
    .filter(item => item.purchased && item.price)
    .sort((a, b) => new Date(b.purchaseDate!).getTime() - new Date(a.purchaseDate!).getTime())
    .reduce((acc, item) => {
        // Lógica simples para agrupar compras feitas no mesmo dia
        const today = new Date().toDateString();
        if (new Date(item.purchaseDate!).toDateString() === today) {
            return acc + (item.price! * item.quantity);
        }
        return acc;
    }, 0);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Meu Orçamento</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* ... Card de Saldo ... */}

        {/* ... Botões de Ação ... */}
        <div className="space-y-4">
          <Button
            className="w-full h-16 bg-white hover:bg-gray-50 text-gray-800 border"
            onClick={() => navigate('/lista')}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <List className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Acessar Lista</div>
                <div className="text-sm text-gray-500">Gerencie sua lista de compras</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Quick Stats Dinâmicas */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Card className="bg-white border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{totalItemsInList}</div>
              <div className="text-sm text-gray-500">Itens na Lista</div>
            </CardContent>
          </Card>
          <Card className="bg-white border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">R$ {lastPurchaseValue.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Última Compra</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;