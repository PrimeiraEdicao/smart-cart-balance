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
import { AuthPage } from "./pages/Auth"; // Importar página de Auth

// Provedor e Rota Protegida
import { AppProvider } from "./context/AppContext"; // Importar o novo AppProvider
import { ProtectedRoute } from "./components/ProtectedRoute"; // Importar a Rota Protegida

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppProvider> {/* Usar o AppProvider */}
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