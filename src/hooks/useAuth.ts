
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Adiciona permissões do usuário baseadas no papel/função dele
  const userPermissions = context.user ? {
    canViewVehicles: true,
    canEditVehicles: context.user.role === 'admin' || context.user.role === 'manager',
    canDeleteVehicles: context.user.role === 'admin',
    canViewMovements: true,
    canCreateMovements: true,
    canViewUsers: context.user.role === 'admin' || context.user.role === 'manager',
    canEditUsers: context.user.role === 'admin',
  } : null;
  
  return {
    ...context,
    userPermissions
  };
};
