
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import useUsers from '@/hooks/useUsers';
import UsersContainer from '@/components/users/UsersContainer';

const Users = () => {
  const { user } = useAuth();
  const { users, units, loading, toggleUserStatus, deleteUser, refreshUsers, setUsers } = useUsers();

  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16 md:pb-6">
        <UsersContainer 
          user={user}
          users={users}
          units={units}
          loading={loading}
          toggleUserStatus={toggleUserStatus}
          deleteUser={deleteUser}
          refreshUsers={refreshUsers}
          setUsers={setUsers}
        />
      </div>
    </Layout>
  );
};

export default Users;
