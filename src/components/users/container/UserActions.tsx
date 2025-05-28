
import React from 'react';
import { SystemUser } from '@/types/entities';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Key, Shield, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserActionsProps {
  user: SystemUser;
  currentUserId: string;
  isAdmin: boolean;
  onEdit: (user: SystemUser) => void;
  onChangePassword: (user: SystemUser) => void;
  onEditPermissions: (user: SystemUser) => void;
  onToggleStatus: (userId: string, newStatus: 'active' | 'inactive') => void;
  onDelete: (userId: string) => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  currentUserId,
  isAdmin,
  onEdit,
  onChangePassword,
  onEditPermissions,
  onToggleStatus,
  onDelete
}) => {
  const canEdit = isAdmin || user.id === currentUserId;
  const canDelete = isAdmin && user.id !== currentUserId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(user)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
        )}
        
        {isAdmin && (
          <DropdownMenuItem onClick={() => onChangePassword(user)}>
            <Key className="h-4 w-4 mr-2" />
            Alterar Senha
          </DropdownMenuItem>
        )}
        
        {isAdmin && (
          <DropdownMenuItem onClick={() => onEditPermissions(user)}>
            <Shield className="h-4 w-4 mr-2" />
            Permissões
          </DropdownMenuItem>
        )}
        
        {isAdmin && (
          <DropdownMenuItem 
            onClick={() => onToggleStatus(
              user.id, 
              user.status === 'active' ? 'inactive' : 'active'
            )}
          >
            {user.status === 'active' ? (
              <>
                <ToggleLeft className="h-4 w-4 mr-2" />
                Desativar
              </>
            ) : (
              <>
                <ToggleRight className="h-4 w-4 mr-2" />
                Ativar
              </>
            )}
          </DropdownMenuItem>
        )}
        
        {canDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(user.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActions;
