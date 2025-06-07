import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// ✅ 1. Importar QueryClient e QueryClientProvider
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas
import Index from "./pages/Index";
import Lista from "./pages/Lista";
import CompraRapida from "./pages/CompraRapida";
import Historico from "./pages/Historico";
import NotFound from "./pages/NotFound";
import { AuthPage } from "./pages/Auth";

// Provedor e Rota Protegida
import { AppProvider } from "./context/AppContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// ✅ 2. Criar o QueryClient com configurações otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Evita que os dados sejam buscados novamente toda vez que a janela ganha foco
      refetchOnWindowFocus: false, 
      // Evita refetch ao reconectar
      refetchOnReconnect: false,
      // Aumenta o tempo que os dados são considerados "novos" para 5 minutos
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
            {/* Rota pública de autenticação */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Rotas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/lista" element={<Lista />} />
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