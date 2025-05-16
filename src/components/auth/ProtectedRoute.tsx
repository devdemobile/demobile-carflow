
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
  
  // Wait for auth to initialize
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Carregando...</div>
      </div>
    );
  }
  
  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If a specific permission is required
  if (requiredPermission) {
    const hasPermission = user.permissions && (user.permissions as any)[requiredPermission];
    const isAdmin = user.role === 'admin';
    
    if (!hasPermission && !isAdmin) {
      return <Navigate to="/" replace />;
    }
  }
  
  // User is authenticated and has required permissions
  return <>{children}</>;
};

export default ProtectedRoute;
