
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, User, List, ShoppingCart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [balance] = useState(500.00); // Saldo inicial
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Meu Orçamento</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Saldo Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-100 text-sm font-medium">Saldo Disponível</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-3xl font-bold">
              {showBalance ? `R$ ${balance.toFixed(2)}` : "R$ •••••"}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            className="w-full h-16 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-md transition-all duration-200 hover:shadow-lg"
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

          <Button
            className="w-full h-16 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-md transition-all duration-200 hover:shadow-lg"
            onClick={() => navigate('/compra-rapida')}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Realizar Compra</div>
                <div className="text-sm text-gray-500">Modo rápido com código de barras</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-500">Itens na Lista</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">R$ 45,80</div>
              <div className="text-sm text-gray-500">Última Compra</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
