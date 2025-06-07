import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { List, ShoppingCart, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { ListSwitcher } from "@/components/ListSwitcher"; // Importar
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const navigate = useNavigate();
  
  const { items, user, signOut, activeList, isLoadingLists, isLoadingItems } = useAppContext();

  // Os cálculos agora devem respeitar a lista ativa
  const totalItemsInList = activeList ? items.filter(item => !item.purchased).length : 0;
  
  const lastPurchaseValue = activeList ? items
    .filter(item => item.purchased && item.price)
    .sort((a, b) => new Date(b.purchaseDate!).getTime() - new Date(a.purchaseDate!).getTime())
    .reduce((acc, item) => {
        const today = new Date().toDateString();
        if (new Date(item.purchaseDate!).toDateString() === today) {
            return acc + (item.price! * item.quantity);
        }
        return acc;
    }, 0) : 0;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Smart Cart</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Lista Ativa</label>
          {isLoadingLists ? <Skeleton className="h-10 w-full" /> : <ListSwitcher />}
        </div>
        
        <div className="space-y-4">
          <Button
            className="w-full h-20 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 shadow-sm justify-start"
            onClick={() => navigate('/lista')}
            disabled={!activeList}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <List className="h-7 w-7 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Acessar Lista</div>
                <div className="text-sm text-gray-500">
                  {activeList ? 'Gerenciar seus itens' : 'Selecione uma lista para começar'}
                </div>
              </div>
            </div>
          </Button>

          <Button
            className="w-full h-20 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 shadow-sm justify-start"
            onClick={() => navigate('/compra-rapida')}
            disabled={!activeList}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <ShoppingCart className="h-7 w-7 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Compra Rápida</div>
                <div className="text-sm text-gray-500">Registre itens no carrinho</div>
              </div>
            </div>
          </Button>
        </div>

        {isLoadingItems ? <Skeleton className="h-24 w-full" /> : (
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
                <div className="text-sm text-gray-500">Gasto Hoje</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;