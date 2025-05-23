
import React from 'react';
import { SystemUser, UserStatus } from '@/types/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Key, ShieldCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: SystemUser;
  currentUserId: string;
  onEdit: (user: SystemUser) => void;
  onChangePassword: (user: SystemUser) => void;
  onEditPermissions: (user: SystemUser) => void;
  onToggleStatus: (userId: string, status: UserStatus) => void;
  onDelete: (userId: string) => void;
  isAdmin: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  currentUserId,
  onEdit,
  onChangePassword,
  onEditPermissions,
  onToggleStatus,
  onDelete,
  isAdmin
}) => {
  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge className="bg-[#0FA0CE] hover:bg-[#0FA0CE]/80">Administrador</Badge>
    ) : (
      <Badge className="bg-[#D3E4FD] text-blue-800 hover:bg-[#D3E4FD]/80">Operador</Badge>
    );
  };
  
  const getShiftBadge = (shift: string) => {
    return shift === 'day' ? (
      <Badge variant="outline" className="border-yellow-500 text-yellow-500">Dia</Badge>
    ) : (
      <Badge variant="outline" className="border-indigo-500 text-indigo-500">Noite</Badge>
    );
  };
  
  const handleCardClick = () => {
    onEdit(user);
  };
  
  return (
    <Card 
      className={cn(
        user.status === 'active' 
          ? 'border-l-4 border-l-green-500' 
          : 'border-l-4 border-l-red-500 opacity-60',
        'cursor-pointer hover:shadow-md transition-shadow'
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <Avatar>
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.username}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {getShiftBadge(user.shift)}
          {getRoleBadge(user.role)}
        </div>
        
        <div className="text-sm mb-2 min-h-[40px]">
          <p className="text-muted-foreground">Unidade: {user.unitName || user.units?.name || "—"}</p>
          <p className="text-muted-foreground">Email: {user.email || "—"}</p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation(); // Evita que o clique propague para o card
                  onChangePassword(user);
                }}
                title="Alterar senha"
              >
                <Key className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation(); // Evita que o clique propague para o card
                  onEditPermissions(user);
                }}
                title="Editar permissões"
              >
                <ShieldCheck className="h-4 w-4" />
              </Button>

              <Switch 
                checked={user.status === 'active'} 
                onCheckedChange={(checked) => {
                  // Evita que o clique propague para o card
                  onToggleStatus(user.id, user.status);
                }}
                onClick={(e) => e.stopPropagation()}
                variant="success-danger"
                title={user.status === 'active' ? "Desativar usuário" : "Ativar usuário"}
              />
            </div>
            
            {user.id !== currentUserId && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation(); // Evita que o clique propague para o card
                  onDelete(user.id);
                }}
                title="Excluir usuário"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;
