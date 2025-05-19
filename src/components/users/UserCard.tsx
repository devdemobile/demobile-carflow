
import React from 'react';
import { SystemUser, UserStatus } from '@/types/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Key, ShieldCheck } from 'lucide-react';
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
  
  return (
    <Card 
      className={cn(
        user.status === 'active' 
          ? 'border-l-4 border-l-green-500' 
          : 'border-l-4 border-l-red-500 opacity-60'
      )}
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
          {getRoleBadge(user.role)}
          {getShiftBadge(user.shift)}
        </div>
        
        <div className="text-sm mb-2">
          <p className="text-muted-foreground">Unidade: {user.unitName || user.units?.name || "—"}</p>
          {user.email && <p className="text-muted-foreground">Email: {user.email}</p>}
        </div>
        
        {isAdmin && (
          <div className="flex flex-wrap justify-end gap-2 mt-4 pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(user)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onChangePassword(user)}
            >
              <Key className="h-4 w-4 mr-1" />
              Senha
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEditPermissions(user)}
            >
              <ShieldCheck className="h-4 w-4 mr-1" />
              Permissões
            </Button>
            
            <Switch size="sm" checked={user.status === 'active'} onCheckedChange={() => onToggleStatus(user.id, user.status)} />
            
            {user.id !== currentUserId && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(user.id)}
              >
                <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                Excluir
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;
