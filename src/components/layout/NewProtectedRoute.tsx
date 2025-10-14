// Card 1: Componente de rota protegida usando Supabase Auth
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireTecnico?: boolean;
}

export function NewProtectedRoute({ children, requireTecnico = false }: ProtectedRouteProps) {
  const { user, perfil, loading } = useNewAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireTecnico && perfil?.tipo_usuario !== 'tecnico') {
    return <Navigate to="/chamados" replace />;
  }

  return <>{children}</>;
}
