
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'operator';
export type UserShift = 'day' | 'night';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  shift: UserShift;
  unitId: string;
  unitName: string;
  status: UserStatus;
  permissions?: {
    canViewVehicles: boolean;
    canEditVehicles: boolean;
    canViewUnits: boolean;
    canEditUnits: boolean;
    canViewUsers: boolean;
    canEditUsers: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUnit: (unitId: string, password?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  switchUnit: async () => false,
});

export const useAuth = () => useContext(AuthContext);

// Mock data for development
const mockUsers = [
  {
    id: '1',
    name: 'Administrador',
    username: 'admin',
    password: 'admin123',
    email: 'admin@carflow.com',
    role: 'admin' as UserRole,
    shift: 'day' as UserShift,
    unitId: '1',
    unitName: 'Matriz',
    status: 'active' as UserStatus,
    permissions: {
      canViewVehicles: true,
      canEditVehicles: true,
      canViewUnits: true,
      canEditUnits: true,
      canViewUsers: true,
      canEditUsers: true,
    },
  },
  {
    id: '2',
    name: 'Porteiro',
    username: 'porteiro',
    password: 'porteiro123',
    email: 'porteiro@carflow.com',
    role: 'operator' as UserRole,
    shift: 'day' as UserShift,
    unitId: '1',
    unitName: 'Matriz',
    status: 'active' as UserStatus,
    permissions: {
      canViewVehicles: true,
      canEditVehicles: false,
      canViewUnits: false,
      canEditUnits: false,
      canViewUsers: false,
      canEditUsers: false,
    },
  },
];

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('carflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // In a real app, this would be an API call
    const found = mockUsers.find(
      (u) => u.username === username && u.password === password && u.status === 'active'
    );

    if (found) {
      const { password: _, ...userWithoutPassword } = found;
      setUser(userWithoutPassword);
      localStorage.setItem('carflow_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('carflow_user');
  };

  const switchUnit = async (unitId: string, password?: string) => {
    if (!user) return false;

    // In a real app, this would verify the password if provided
    // Admin users don't need a password verification
    if (user.role !== 'admin' && !password) {
      return false;
    }

    // Mock the unit switching
    // In a real app, this would be an API call to verify the user can access this unit
    const updatedUser = {
      ...user,
      unitId,
      unitName: unitId === '1' ? 'Matriz' : 'Filial 6',
    };

    setUser(updatedUser);
    localStorage.setItem('carflow_user', JSON.stringify(updatedUser));
    
    // Log the unit switch (in a real app)
    console.log(`User ${user.name} switched to unit ${updatedUser.unitName}`);
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchUnit }}>
      {children}
    </AuthContext.Provider>
  );
};
