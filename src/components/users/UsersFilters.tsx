
import React from 'react';
import UsersFilter from './UsersFilter';
import UsersHeader from './UsersHeader';

interface UsersFiltersProps {
  user: any;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  roleFilter: string | null;
  onRoleFilterChange: (role: string | null) => void;
  onReset: () => void;
  showViewToggle: boolean;
  onNewUser: () => void;
  showInactiveUsers: boolean;
  onToggleActiveUsers: () => void;
  isAdmin: boolean;
}

const UsersFilters: React.FC<UsersFiltersProps> = ({
  user,
  viewMode,
  setViewMode,
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onReset,
  showViewToggle,
  onNewUser,
  showInactiveUsers,
  onToggleActiveUsers,
  isAdmin
}) => {
  return (
    <>
      <UsersHeader 
        onNewUser={onNewUser}
        showInactiveUsers={showInactiveUsers}
        onToggleActiveUsers={onToggleActiveUsers}
        isAdmin={isAdmin}
      />
      
      <UsersFilter
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        roleFilter={roleFilter}
        onRoleFilterChange={onRoleFilterChange}
        onReset={onReset}
        showViewToggle={showViewToggle}
      />
    </>
  );
};

export default UsersFilters;
