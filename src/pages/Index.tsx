import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListChecks, LogOut, ScanLine, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, shoppingLists } = useAppContext();
  const hasLists = shoppingLists.length > 0;

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium hidden sm:block">
              {user?.email}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/listas")}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <ListChecks className="h-8 w-8 text-blue-600" />
              </div>
              <p className="font-semibold text-gray-800">Minhas Listas</p>
              <p className="text-xs text-gray-500">
                Acesse e gerencie suas listas
              </p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              !hasLists
                ? "bg-gray-100 opacity-60 cursor-not-allowed"
                : "bg-white"
            }`}
            onClick={() => hasLists && navigate("/compra-rapida")}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <ScanLine className="h-8 w-8 text-green-600" />
              </div>
              <p className="font-semibold text-gray-800">Compra Rápida</p>
              <p className="text-xs text-gray-500">
                {hasLists ? "Modo rápido com scanner" : "Crie uma lista"}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-base">Bem-vindo(a) de volta!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600">Selecione uma das opções acima para começar a organizar suas compras de forma inteligente.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;