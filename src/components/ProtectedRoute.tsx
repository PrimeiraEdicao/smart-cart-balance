import { Navigate, Outlet } from 'react-router-dom';
import { useShopping } from '@/context/AppContext';

export const ProtectedRoute = () => {
  const { user, loading } = useShopping();

  if (loading) {
    // Pode mostrar um spinner de carregamento aqui
    return <div>Carregando...</div>; 
  }

  if (!user) {
    // Se não houver usuário, redireciona para a página de login
    return <Navigate to="/auth" replace />;
  }

  // Se houver usuário, renderiza a página solicitada
  return <Outlet />;
};