import { Navigate } from 'react-router-dom';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
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

  if (perfil?.tipo_usuario === 'tecnico') {
    return <Navigate to="/painel-tecnico" replace />;
  }

  return <Navigate to="/chamados" replace />;
};

export default Index;
