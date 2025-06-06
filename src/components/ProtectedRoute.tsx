import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext'; // 1. Usar o hook renomeado
import { Skeleton } from '@/components/ui/skeleton';

const AuthLoadingSkeleton = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-sm space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
);


export const ProtectedRoute = () => {
  // 2. Usar 'loadingAuth' e 'user' do contexto
  const { user, loadingAuth } = useAppContext();

  if (loadingAuth) {
    return <AuthLoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};