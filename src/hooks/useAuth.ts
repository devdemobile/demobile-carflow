
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { SystemUser } from '@/types';

// Define an interface for the user permissions
interface UserPermissions {
  canViewVehicles: boolean;
  canEditVehicles: boolean;
  canDeleteVehicles: boolean;
  canViewMovements: boolean;
  canCreateMovements: boolean;
  canViewUsers: boolean;
  canEditUsers: boolean;
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

export const useAuth = (): AuthHookReturn => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Adiciona permissões do usuário baseadas no papel/função dele
  const userPermissions = context.user ? {
    canViewVehicles: true,
    canEditVehicles: context.user.role === 'admin',
    canDeleteVehicles: context.user.role === 'admin',
    canViewMovements: true,
    canCreateMovements: true,
    canViewUsers: context.user.role === 'admin',
    canEditUsers: context.user.role === 'admin',
  } : null;
  
  return {
    ...context,
    userPermissions
  };
};
