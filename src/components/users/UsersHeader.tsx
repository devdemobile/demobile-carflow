
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';

interface UsersHeaderProps {
  onNewUser: () => void;
  showInactiveUsers: boolean;
  onToggleActiveUsers: () => void;
  isAdmin: boolean;
}

/**
 * Header component for the Users page
 */
const UsersHeader: React.FC<UsersHeaderProps> = ({
  onNewUser,
  showInactiveUsers,
  onToggleActiveUsers,
  isAdmin
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Usuários</h1>
      
      {isAdmin && (
        <div className="flex gap-2 items-center">
          <Button
            onClick={onToggleActiveUsers}
            className={`transition-colors ${
              !showInactiveUsers ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          >
            {!showInactiveUsers ? 'Ativos' : 'Inativos'}
          </Button>
          <Button onClick={onNewUser}>
            <Plus className="h-4 w-4 md:mr-2" />
            {!isMobile && <span>Novo Usuário</span>}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UsersHeader;
