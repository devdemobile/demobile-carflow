
import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SystemUser, UserPermissions } from '@/types/entities';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { userRepository } from '@/services/users/userRepository';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

type UserPermissionsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
  onSaved: () => Promise<void>;
};

const UserPermissionsDialog: React.FC<UserPermissionsDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSaved,
}) => {
  const [permissions, setPermissions] = useState<UserPermissions>({
    can_view_vehicles: false,
    can_edit_vehicles: false,
    can_view_units: false,
    can_edit_units: false,
    can_view_users: false,
    can_edit_users: false,
    can_view_movements: false,
    can_edit_movements: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user?.id || !isOpen) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('system_user_permissions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar permissões:', error);
          toast.error('Não foi possível carregar as permissões');
        }
        
        if (data) {
          setPermissions({
            can_view_vehicles: data.can_view_vehicles || false,
            can_edit_vehicles: data.can_edit_vehicles || false,
            can_view_units: data.can_view_units || false,
            can_edit_units: data.can_edit_units || false,
            can_view_users: data.can_view_users || false,
            can_edit_users: data.can_edit_users || false,
            can_view_movements: data.can_view_movements || false,
            can_edit_movements: data.can_edit_movements || false,
          });
        }
      } catch (err) {
        console.error('Erro ao carregar permissões:', err);
        toast.error('Erro ao carregar permissões');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.id, isOpen]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const success = await userRepository.updateUserPermissions(user.id, permissions);
      
      if (success) {
        toast.success('Permissões atualizadas com sucesso');
        onSaved();
        onClose();
      } else {
        toast.error('Erro ao atualizar permissões');
      }
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      toast.error('Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  // Helper para atualizar permissões individuais
  const updatePermission = (key: keyof UserPermissions, value: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            Permissões do Usuário
            {user && ` - ${user.name}`}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 py-4">
            <h3 className="text-md font-medium">Veículos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="can_view_vehicles" 
                  checked={permissions.can_view_vehicles}
                  onCheckedChange={(checked) => 
                    updatePermission('can_view_vehicles', checked === true)
                  }
                />
                <label htmlFor="can_view_vehicles">Visualizar veículos</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="can_edit_vehicles" 
                  checked={permissions.can_edit_vehicles}
                  onCheckedChange={(checked) => 
                    updatePermission('can_edit_vehicles', checked === true)
                  }
                />
                <label htmlFor="can_edit_vehicles">Editar veículos</label>
              </div>
            </div>

            <h3 className="text-md font-medium">Unidades</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="can_view_units" 
                  checked={permissions.can_view_units}
                  onCheckedChange={(checked) => 
                    updatePermission('can_view_units', checked === true)
                  }
                />
                <label htmlFor="can_view_units">Visualizar unidades</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="can_edit_units" 
                  checked={permissions.can_edit_units}
                  onCheckedChange={(checked) => 
                    updatePermission('can_edit_units', checked === true)
                  }
                />
                <label htmlFor="can_edit_units">Editar unidades</label>
              </div>
            </div>

            <h3 className="text-md font-medium">Usuários</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="can_view_users" 
                  checked={permissions.can_view_users}
                  onCheckedChange={(checked) => 
                    updatePermission('can_view_users', checked === true)
                  }
                />
                <label htmlFor="can_view_users">Visualizar usuários</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="can_edit_users" 
                  checked={permissions.can_edit_users}
                  onCheckedChange={(checked) => 
                    updatePermission('can_edit_users', checked === true)
                  }
                />
                <label htmlFor="can_edit_users">Editar usuários</label>
              </div>
            </div>

            <h3 className="text-md font-medium">Movimentações</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="can_view_movements" 
                  checked={permissions.can_view_movements}
                  onCheckedChange={(checked) => 
                    updatePermission('can_view_movements', checked === true)
                  }
                />
                <label htmlFor="can_view_movements">Visualizar movimentações</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="can_edit_movements" 
                  checked={permissions.can_edit_movements}
                  onCheckedChange={(checked) => 
                    updatePermission('can_edit_movements', checked === true)
                  }
                />
                <label htmlFor="can_edit_movements">Editar movimentações</label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserPermissionsDialog;
