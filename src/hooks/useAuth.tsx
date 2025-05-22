
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { SystemUser } from '@/types';

// Define an interface for the user permissions
interface UserPermissions {
  canViewVehicles: boolean;
  canEditVehicles: boolean;
  canViewMovements: boolean;
  canEditMovements: boolean;
  canCreateMovements: boolean;
  canViewUsers: boolean;
  canEditUsers: boolean;
  canViewUnits: boolean;
  canEditUnits: boolean;
}

// Define the return type for our useAuth hook
interface AuthHookReturn {
  user: SystemUser | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
  switchUnit: (unitId: string) => Promise<boolean>;
  userPermissions: UserPermissions | null;
}

/**
 * Custom hook for authentication-related functionalities
 */
export const useAuth = (): AuthHookReturn => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Adiciona permissões do usuário baseadas nas permissões do banco e papel/função
  const userPermissions = context.user ? {
    canViewVehicles: context.user.permissions?.canViewVehicles || context.user.role === 'admin',
    canEditVehicles: context.user.permissions?.canEditVehicles || context.user.role === 'admin',
    canViewMovements: context.user.permissions?.canViewMovements || true, 
    canCreateMovements: true,
    canEditMovements: context.user.permissions?.canEditMovements || context.user.role === 'admin',
    canViewUsers: context.user.permissions?.canViewUsers || context.user.role === 'admin',
    canEditUsers: context.user.permissions?.canEditUsers || context.user.role === 'admin',
    canViewUnits: context.user.permissions?.canViewUnits || context.user.role === 'admin',
    canEditUnits: context.user.permissions?.canEditUnits || context.user.role === 'admin',
  } : null;
  
  return {
    ...context,
    userPermissions
  };
};
