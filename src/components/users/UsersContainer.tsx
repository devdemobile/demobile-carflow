
import React, { useState } from 'react';
import { SystemUser } from '@/types/entities';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/use-mobile';
import { UserFormValues } from './UserForm';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseRequest } from '@/services/api/supabase';

// Componentes refatorados
import UsersFilter from './UsersFilter';
import UsersHeader from './UsersHeader';
import UserListView from './UserListView';
import UserDialogs from './UserDialogs';

interface UsersContainerProps {
  user: SystemUser | null;
  users: SystemUser[];
  units: any[];
  loading: boolean;
  toggleUserStatus: (userId: string, newStatus: 'active' | 'inactive') => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  refreshUsers: () => Promise<void>;
  setUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
}

const UsersContainer: React.FC<UsersContainerProps> = ({
  user,
  users,
  units,
  loading,
  toggleUserStatus,
  deleteUser,
  refreshUsers,
  setUsers
}) => {
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

  // Handlers
  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleChangePassword = (user: SystemUser) => {
    setSelectedUser(user);
    setIsPasswordDialogOpen(true);
  };

  const handleEditPermissions = (user: SystemUser) => {
    setSelectedUser(user);
    setIsPermissionsDialogOpen(true);
  };

  const confirmDelete = (userId: string) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const success = await deleteUser(userToDelete);
    if (success) {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };
  
  const toggleActiveUsers = () => {
    setShowInactiveUsers(!showInactiveUsers);
  };

  // Form submission
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
          updateData.password_hash = values.password;
        }
        
        const { data: updatedUser, error: updateError } = await handleSupabaseRequest(
          async () => await supabase
            .from('system_users')
            .update(updateData)
            .eq('id', editingUser.id)
            .select('*, units(name)')
            .single(),
          'Erro ao atualizar usuário'
        );
        
        if (updateError) throw updateError;
        
        if (updatedUser) {
          // Atualizar lista de usuários
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
        }
      } else {
        // Criar novo usuário
        const { data: userData, error: insertError } = await handleSupabaseRequest(
          async () => await supabase
            .from('system_users')
            .insert({
              name: values.name,
              username: values.username,
              password_hash: values.password,
              role: values.role,
              shift: values.shift,
              unit_id: values.unit_id,
              email: values.email || null,
              created_by: user?.id,
            })
            .select('*, units(name)')
            .single(),
          'Erro ao criar usuário'
        );
        
        if (insertError) {
          if (insertError.message.includes('unique constraint')) {
            toast.error('Este nome de usuário já existe');
          } else {
            throw insertError;
          }
          return;
        }
        
        if (userData) {
          // Adicionar permissões padrão
          await handleSupabaseRequest(
            async () => await supabase
              .from('system_user_permissions')
              .insert({
                user_id: userData.id,
                can_view_movements: true,
              }),
            'Erro ao adicionar permissões'
          );
          
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
    <>
      <UsersHeader 
        onNewUser={handleNewUser}
        showInactiveUsers={showInactiveUsers}
        onToggleActiveUsers={toggleActiveUsers}
        isAdmin={user?.role === 'admin'}
      />
      
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
      
      <UserListView 
        loading={loading}
        viewMode={viewMode}
        filteredUsers={filteredUsers}
        currentUserId={user?.id || ''}
        onEdit={handleEditUser}
        onChangePassword={handleChangePassword}
        onEditPermissions={handleEditPermissions}
        onToggleStatus={toggleUserStatus}
        onDelete={confirmDelete}
        isAdmin={user?.role === 'admin'}
      />
      
      <UserDialogs
        editingUser={editingUser}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        onSubmit={onSubmit}
        units={units}
        deleteConfirmOpen={deleteConfirmOpen}
        setDeleteConfirmOpen={setDeleteConfirmOpen}
        handleDeleteUser={handleDeleteUser}
        isPasswordDialogOpen={isPasswordDialogOpen}
        setIsPasswordDialogOpen={setIsPasswordDialogOpen}
        isPermissionsDialogOpen={isPermissionsDialogOpen}
        setIsPermissionsDialogOpen={setIsPermissionsDialogOpen}
        selectedUser={selectedUser}
        refreshUsers={refreshUsers}
      />
    </>
  );
};

export default UsersContainer;
