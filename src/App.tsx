import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AppProvider } from "./context/AppContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary"; // Importe o novo componente

// Importação das suas páginas
import Index from "./pages/Index";
import { AuthPage } from "./pages/Auth";
import Lista from "./pages/Lista";
import { ListIndex } from "./pages/ListIndex";
import CompraRapida from "./pages/CompraRapida";
import Historico from "./pages/Historico";
import { UpdatePasswordPage } from "./pages/UpdatePassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />

            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/listas" element={<ListIndex />} />
              
              {/* ✅ ROTA DA LISTA ENVOLVIDA COM O ERRORBOUNDARY */}
              <Route 
                path="/lista/:listId" 
                element={
                  <ErrorBoundary>
                    <Lista />
                  </ErrorBoundary>
                } 
              />
              
              <Route path="/compra-rapida" element={<CompraRapida />} />
              <Route path="/historico" element={<Historico />} />
            </Route>

            {/* Rota para páginas não encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;