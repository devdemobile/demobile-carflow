
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredPermission 
}) => {
  const { user, loading, userPermissions } = useAuth();
  const location = useLocation();
  
  // Aguardar carregamento da autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Carregando...</div>
      </div>
    );
  }
  
  // Não autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Se uma permissão específica for necessária
  if (requiredPermission && userPermissions) {
    // Verificar as permissões do usuário através do userPermissions
    const hasPermission = userPermissions && 
      (userPermissions as any)[requiredPermission];
    const isAdmin = user.role === 'admin';
    
    if (!hasPermission && !isAdmin) {
      return <Navigate to="/" replace />;
    }
  }
  
  // Usuário está autenticado e tem as permissões necessárias
  return <>{children}</>;
};

export default ProtectedRoute;
