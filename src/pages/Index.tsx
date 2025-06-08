import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { List, ShoppingCart, LogOut, Eye, EyeOff, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { 
    user, 
    signOut, 
    budget,
    setBudget,
    shoppingLists, // Usado para verificar se existe alguma lista
  } = useAppContext();

  const [showBalance, setShowBalance] = useState(true);
  const hasLists = shoppingLists.length > 0;

  const handleSetBudget = () => {
    const newBudgetStr = prompt("Defina seu orçamento disponível:", budget.toString());
    if (newBudgetStr) {
      const newBudget = parseFloat(newBudgetStr);
      if (!isNaN(newBudget)) {
        setBudget(newBudget);
        toast.success("Orçamento atualizado!");
      } else {
        toast.error("Por favor, insira um valor numérico.");
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <Card className="bg-white shadow-lg cursor-pointer" onClick={handleSetBudget}>
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500">Saldo Disponível (clique para editar)</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setShowBalance(!showBalance); }}>
                        {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                </div>
                <div className={`text-4xl font-bold ${!showBalance ? 'blur-md' : ''}`}>
                    R$ {budget.toFixed(2).replace('.',',')}
                </div>
            </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Button
            className="w-full h-20 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 shadow-sm justify-start"
            onClick={() => navigate('/listas')} // ✅ NAVEGA PARA A NOVA PÁGINA
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <List className="h-7 w-7 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Minhas Listas</div>
                <div className="text-sm text-gray-500">
                  Acesse e gerencie suas listas
                </div>
              </div>
            </div>
          </Button>

          <Button
            className="w-full h-20 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 shadow-sm justify-start"
            onClick={() => navigate('/compra-rapida')}
            disabled={!hasLists} // Desabilita se não houver listas
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <ShoppingCart className="h-7 w-7 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Realizar Compra</div>
                <div className="text-sm text-gray-500">
                  {hasLists ? 'Modo rápido com scanner' : 'Crie uma lista primeiro'}
                </div>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;