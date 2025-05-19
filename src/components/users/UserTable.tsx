
import React from 'react';
import { SystemUser, UserStatus } from '@/types/entities';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Key, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserTableProps {
  users: SystemUser[];
  currentUserId: string;
  onEdit: (user: SystemUser) => void;
  onChangePassword: (user: SystemUser) => void;
  onEditPermissions: (user: SystemUser) => void;
  onToggleStatus: (userId: string, status: UserStatus) => void;
  onDelete: (userId: string) => void;
  isAdmin: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Turno</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Email</TableHead>
            {isAdmin && (
              <TableHead className="text-right">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id} 
              className={cn(
                user.status === 'active' 
                  ? 'border-l-4 border-l-green-500' 
                  : 'border-l-4 border-l-red-500 opacity-60'
              )}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </div>
              </TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>{getShiftBadge(user.shift)}</TableCell>
              <TableCell>{user.unitName || user.units?.name || "—"}</TableCell>
              <TableCell>{user.email || '—'}</TableCell>
              {isAdmin && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(user)}
                      title="Editar usuário"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onChangePassword(user)}
                      title="Alterar senha"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEditPermissions(user)}
                      title="Editar permissões"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onToggleStatus(user.id, user.status)}
                      title={user.status === 'active' ? "Desativar usuário" : "Ativar usuário"}
                    >
                      <Switch size="sm" checked={user.status === 'active'} />
                    </Button>
                    
                    {user.id !== currentUserId && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(user.id)}
                        title="Excluir usuário"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
