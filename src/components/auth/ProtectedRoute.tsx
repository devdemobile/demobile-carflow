
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredPermission 
}) => {
  const { user, loading } = useAuth();
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
  if (requiredPermission && user) {
    const hasPermission = user.permissions && 
      (user.permissions as any)[requiredPermission];
    const isAdmin = user.role === 'admin';
    
    if (!hasPermission && !isAdmin) {
      return <Navigate to="/" replace />;
    }
  }
  
  // Usuário está autenticado e tem as permissões necessárias
  return <>{children}</>;
};

export default ProtectedRoute;
