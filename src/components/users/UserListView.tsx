
import React from 'react';
import { SystemUser, UserStatus } from '@/types/entities';
import UserTable from './UserTable';
import UserCard from './UserCard';
import { Skeleton } from '@/components/ui/skeleton';

interface UserListViewProps {
  loading: boolean;
  viewMode: 'grid' | 'table';
  filteredUsers: SystemUser[];
  currentUserId: string;
  onEdit: (user: SystemUser) => void;
  onChangePassword: (user: SystemUser) => void;
  onEditPermissions: (user: SystemUser) => void;
  onToggleStatus: (userId: string, status: UserStatus) => void;
  onDelete: (userId: string) => void;
  isAdmin: boolean;
}

const UserListView: React.FC<UserListViewProps> = ({
  loading,
  viewMode,
  filteredUsers,
  currentUserId,
  onEdit,
  onChangePassword,
  onEditPermissions,
  onToggleStatus,
  onDelete,
  isAdmin
}) => {
  if (loading) {
    return (
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
    );
  }
  
  if (filteredUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum usuário encontrado</p>
      </div>
    );
  }
  
  return viewMode === 'table' ? (
    <UserTable 
      users={filteredUsers}
      currentUserId={currentUserId}
      onEdit={onEdit}
      onChangePassword={onChangePassword}
      onEditPermissions={onEditPermissions}
      onToggleStatus={onToggleStatus}
      onDelete={onDelete}
      isAdmin={isAdmin}
    />
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredUsers.map((userItem) => (
        <UserCard
          key={userItem.id}
          user={userItem}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onChangePassword={onChangePassword}
          onEditPermissions={onEditPermissions}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default UserListView;
