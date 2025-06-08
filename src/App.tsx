import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas
import Index from "./pages/Index";
import Lista from "./pages/Lista";
import CompraRapida from "./pages/CompraRapida";
import Historico from "./pages/Historico";
import NotFound from "./pages/NotFound";
import { AuthPage } from "./pages/Auth";
import { UpdatePasswordPage } from "./pages/UpdatePassword";
import { ListIndex } from "./pages/ListIndex"; // ✅ IMPORTAR NOVA PÁGINA

// Provedor e Rota Protegida
import { AppProvider } from "./context/AppContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, 
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Rotas públicas */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />

            {/* Rotas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/listas" element={<ListIndex />} /> {/* ✅ NOVA ROTA */}
              <Route path="/lista/:listId" element={<Lista />} /> {/* ✅ ROTA ATUALIZADA */}
              <Route path="/compra-rapida" element={<CompraRapida />} />
              <Route path="/historico" element={<Historico />} />
            </Route>

            {/* Rota não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AppProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;