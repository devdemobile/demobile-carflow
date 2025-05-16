
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isMobile = false }) => {
  const { user, logout, switchUnit } = useAuth();
  const { theme } = useTheme();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleSwitchUnit = (unitId: string) => {
    // If already on this unit, do nothing
    if (user?.unitId === unitId) return;
    
    // If admin, switch without password
    if (user?.role === 'admin') {
      switchUnit(unitId);
    } else {
      // For non-admins, would show a modal to enter password
      // For demo purposes, we'll just switch
      switchUnit(unitId);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-background/90 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-xl font-bold text-carflow-500">
              Car<span className="text-carflow-700">Flow</span>
            </div>
          </Link>
          
          {!isMobile && user && (
            <nav className="ml-10 hidden md:flex gap-6 items-center">
              <Link
                to="/"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/movements"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Movimentações
              </Link>
              
              {user.permissions?.canViewVehicles && (
                <Link
                  to="/vehicles"
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  Veículos
                </Link>
              )}
              
              {user.permissions?.canViewUnits && (
                <Link
                  to="/units"
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  Unidades
                </Link>
              )}
              
              {user.permissions?.canViewUsers && (
                <Link
                  to="/users"
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  Usuários
                </Link>
              )}
            </nav>
          )}
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            {/* Unit Switch */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Building className="h-5 w-5" />
                  <span className="sr-only">Trocar Unidade</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Unidades</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleSwitchUnit("1")}
                  className={user?.unitId === "1" ? "bg-muted" : ""}
                >
                  Matriz
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSwitchUnit("2")}
                  className={user?.unitId === "2" ? "bg-muted" : ""}
                >
                  Filial 6
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt={user.name} />
                    <AvatarFallback>{user.name ? getInitials(user.name) : "U"}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Menu de Usuário</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-semibold">
                      {user.role === 'admin' ? 'Administrador' : 'Operador'}
                    </span>
                    {" - "}
                    <span>
                      {user.unitName}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ThemeToggle />
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem>
                    <Link to="/settings" className="w-full">Configurações</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
