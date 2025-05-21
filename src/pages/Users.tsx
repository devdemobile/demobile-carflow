import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus } from 'lucide-react';
import ChangePasswordDialog from '@/components/users/ChangePasswordDialog';
import UserPermissionsDialog from '@/components/users/UserPermissionsDialog';
import UsersFilter from '@/components/users/UsersFilter';
import { SystemUser } from '@/types/entities';
import UserTable from '@/components/users/UserTable';
import UserCard from '@/components/users/UserCard';
import UserForm, { UserFormValues } from '@/components/users/UserForm';
import useUsers from '@/hooks/useUsers';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-mobile';

const Users = () => {
  const { user } = useAuth();
  const { toast: toastHook } = useToast();
  const { users, units, loading, toggleUserStatus, deleteUser, refreshUsers, setUsers } = useUsers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Abrir o modal para editar usuário
  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  // Abrir o diálogo para criar novo usuário
  const handleNewUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  // Abrir diálogo de alteração de senha
  const handleChangePassword = (user: SystemUser) => {
    setSelectedUser(user);
    setIsPasswordDialogOpen(true);
  };

  // Abrir diálogo de edição de permissões
  const handleEditPermissions = (user: SystemUser) => {
    setSelectedUser(user);
    setIsPermissionsDialogOpen(true);
  };

  // Confirmar exclusão de usuário
  const confirmDelete = (userId: string) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  // Excluir usuário
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const success = await deleteUser(userToDelete);
    if (success) {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (editingUser) {
        // Atualizar usuário existente
        const updateData: any = {
          name: values.name,
          role: values.role,
          shift: values.shift,
          unit_id: values.unit_id,
          email: values.email || null,
          updated_at: new Date().toISOString()
        };
        
        // Atualizar senha apenas se fornecida
        if (values.password && values.password.length > 0) {
          const { data: passwordHash, error: passwordError } = await supabase.rpc('verify_password2', {
            username: editingUser.username,
            password_attempt: values.password
          });
          
          if (passwordError) throw passwordError;
          updateData.password_hash = passwordHash;
        }
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('system_users')
          .update(updateData)
          .eq('id', editingUser.id)
          .select('*, units(name)')
          .single();
        
        if (updateError) throw updateError;
        
        // Atualizar lista de usuários com o formato correto
        const mappedUpdatedUser: SystemUser = {
          id: updatedUser.id,
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email || undefined,
          role: updatedUser.role,
          shift: updatedUser.shift,
          status: updatedUser.status,
          unitId: updatedUser.unit_id,
          unit_id: updatedUser.unit_id,
          unitName: updatedUser.units?.name,
          units: updatedUser.units
        };
        
        setUsers(prev => prev.map(u => u.id === mappedUpdatedUser.id ? mappedUpdatedUser : u));
        
        toast.success('Usuário atualizado com sucesso');
      } else {
        // Criar novo usuário
        // Usar verify_password2 em vez de hash_password
        const { data: passwordHash, error: passwordError } = await supabase.rpc('verify_password2', {
          username: values.username,
          password_attempt: values.password as string
        });
        
        if (passwordError) throw passwordError;
        
        // Corrigir o tipo de passwordHash para string
        const { data: userData, error: insertError } = await supabase
          .from('system_users')
          .insert({
            name: values.name,
            username: values.username,
            password_hash: String(passwordHash),
            role: values.role,
            shift: values.shift,
            unit_id: values.unit_id,
            email: values.email || null,
            created_by: user?.id,
          })
          .select('*, units(name)')
          .single();
        
        if (insertError) {
          if (insertError.message.includes('unique constraint')) {
            toastHook({
              title: 'Erro',
              description: 'Este nome de usuário já existe',
              variant: 'destructive',
            });
          } else {
            throw insertError;
          }
          return;
        }
        
        // Adicionar permissões padrão
        await supabase
          .from('system_user_permissions')
          .insert({
            user_id: userData.id,
            can_view_movements: true,
          });
        
        // Mapear e adicionar o novo usuário à lista
        const mappedNewUser: SystemUser = {
          id: userData.id,
          name: userData.name,
          username: userData.username,
          email: userData.email || undefined,
          role: userData.role,
          shift: userData.shift,
          status: userData.status,
          unitId: userData.unit_id,
          unit_id: userData.unit_id,
          unitName: userData.units?.name,
          units: userData.units
        };
        
        setUsers(prev => [mappedNewUser, ...prev]);
        
        toast.success('Usuário criado com sucesso');
      }
      
      // Fechar diálogo e resetar form
      setIsDialogOpen(false);
      setEditingUser(null);
      
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.message || 'Não foi possível salvar o usuário');
    }
  };

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    
    const matchesStatus = showInactiveUsers 
      ? user.status === 'inactive'  
      : user.status === 'active';   
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Usuários</h1>
          
          <div className="flex gap-2 items-center">
            {user?.role === 'admin' && (
              <>
                <Button
                  onClick={() => setShowInactiveUsers(!showInactiveUsers)}
                  className={`transition-colors ${
                    !showInactiveUsers ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
                >
                  {!showInactiveUsers ? 'Ativos' : 'Inativos'}
                </Button>
                <Button onClick={() => handleNewUser()}>
                  <Plus className="h-4 w-4 md:mr-2" />
                  {!isMobile && <span>Novo Usuário</span>}
                </Button>
              </>
            )}
          </div>
        </div>
        
        <UsersFilter
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          onReset={() => {
            setSearchTerm('');
            setRoleFilter(null);
          }}
          showViewToggle={!isMobile}
        />
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-full h-16 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        ) : viewMode === 'table' ? (
          <UserTable 
            users={filteredUsers}
            currentUserId={user?.id || ''}
            onEdit={handleEditUser}
            onChangePassword={handleChangePassword}
            onEditPermissions={handleEditPermissions}
            onToggleStatus={toggleUserStatus}
            onDelete={confirmDelete}
            isAdmin={user?.role === 'admin'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((userItem) => (
              <UserCard
                key={userItem.id}
                user={userItem}
                currentUserId={user?.id || ''}
                onEdit={handleEditUser}
                onChangePassword={handleChangePassword}
                onEditPermissions={handleEditPermissions}
                onToggleStatus={toggleUserStatus}
                onDelete={confirmDelete}
                isAdmin={user?.role === 'admin'}
              />
            ))}
          </div>
        )}
        
        {/* Diálogos */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              {editingUser && (
                <DialogDescription>
                  Edite os detalhes do usuário. Deixe o campo de senha em branco para manter a senha atual.
                </DialogDescription>
              )}
            </DialogHeader>
            <UserForm 
              user={editingUser}
              units={units}
              onSubmit={onSubmit}
            />
          </DialogContent>
        </Dialog>
        
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja excluir este usuário? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 text-white hover:bg-red-600">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Diálogos adicionados */}
        <ChangePasswordDialog
          isOpen={isPasswordDialogOpen}
          onClose={() => setIsPasswordDialogOpen(false)}
          user={selectedUser}
        />
        
        <UserPermissionsDialog
          isOpen={isPermissionsDialogOpen}
          onClose={() => setIsPermissionsDialogOpen(false)}
          user={selectedUser}
          onSaved={refreshUsers}
        />
      </div>
    </Layout>
  );
};

export default Users;
