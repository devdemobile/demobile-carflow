import React, { useState } from 'react';
import { SystemUser } from '@/types/entities';
import { useMediaQuery } from '@/hooks/use-mobile';
import { useUserFormHandler } from './container/UserFormHandler';

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

  const { onSubmit } = useUserFormHandler({
    editingUser,
    currentUser: user,
    setUsers,
    onClose: () => {
      setIsDialogOpen(false);
      setEditingUser(null);
    }
  });

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
