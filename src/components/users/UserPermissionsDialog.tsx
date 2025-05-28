
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
import { UserPermissionsResponse } from '@/types/user.types';

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
  const [permissions, setPermissions] = useState<UserPermissions & { canSwitchUnits: boolean }>({
    canViewVehicles: false,
    canEditVehicles: false,
    canViewUnits: false,
    canEditUnits: false,
    canViewUsers: false,
    canEditUsers: false,
    canViewMovements: false,
    canEditMovements: false,
    canSwitchUnits: false,
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
            canViewVehicles: data.can_view_vehicles || false,
            canEditVehicles: data.can_edit_vehicles || false,
            canViewUnits: data.can_view_units || false,
            canEditUnits: data.can_edit_units || false,
            canViewUsers: data.can_view_users || false,
            canEditUsers: data.can_edit_users || false,
            canViewMovements: data.can_view_movements || false,
            canEditMovements: data.can_edit_movements || false,
            canSwitchUnits: data.can_switch_units || false,
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
      // Converter de camelCase para snake_case para o banco de dados
      const dbPermissions = {
        can_view_vehicles: permissions.canViewVehicles,
        can_edit_vehicles: permissions.canEditVehicles,
        can_view_units: permissions.canViewUnits,
        can_edit_units: permissions.canEditUnits,
        can_view_users: permissions.canViewUsers,
        can_edit_users: permissions.canEditUsers,
        can_view_movements: permissions.canViewMovements,
        can_edit_movements: permissions.canEditMovements,
        can_switch_units: permissions.canSwitchUnits,
      };
      
      const success = await userRepository.updateUserPermissions(user.id, dbPermissions);
      
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
  const updatePermission = (key: keyof typeof permissions, value: boolean) => {
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
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
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
                  id="canViewVehicles" 
                  checked={permissions.canViewVehicles}
                  onCheckedChange={(checked) => 
                    updatePermission('canViewVehicles', checked === true)
                  }
                />
                <label htmlFor="canViewVehicles">Visualizar veículos</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canEditVehicles" 
                  checked={permissions.canEditVehicles}
                  onCheckedChange={(checked) => 
                    updatePermission('canEditVehicles', checked === true)
                  }
                />
                <label htmlFor="canEditVehicles">Editar veículos</label>
              </div>
            </div>

            <h3 className="text-md font-medium">Unidades</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canViewUnits" 
                  checked={permissions.canViewUnits}
                  onCheckedChange={(checked) => 
                    updatePermission('canViewUnits', checked === true)
                  }
                />
                <label htmlFor="canViewUnits">Visualizar unidades</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canEditUnits" 
                  checked={permissions.canEditUnits}
                  onCheckedChange={(checked) => 
                    updatePermission('canEditUnits', checked === true)
                  }
                />
                <label htmlFor="canEditUnits">Editar unidades</label>
              </div>
            </div>

            <h3 className="text-md font-medium">Usuários</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canViewUsers" 
                  checked={permissions.canViewUsers}
                  onCheckedChange={(checked) => 
                    updatePermission('canViewUsers', checked === true)
                  }
                />
                <label htmlFor="canViewUsers">Visualizar usuários</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canEditUsers" 
                  checked={permissions.canEditUsers}
                  onCheckedChange={(checked) => 
                    updatePermission('canEditUsers', checked === true)
                  }
                />
                <label htmlFor="canEditUsers">Editar usuários</label>
              </div>
            </div>

            <h3 className="text-md font-medium">Movimentações</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canViewMovements" 
                  checked={permissions.canViewMovements}
                  onCheckedChange={(checked) => 
                    updatePermission('canViewMovements', checked === true)
                  }
                />
                <label htmlFor="canViewMovements">Visualizar movimentações</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canEditMovements" 
                  checked={permissions.canEditMovements}
                  onCheckedChange={(checked) => 
                    updatePermission('canEditMovements', checked === true)
                  }
                />
                <label htmlFor="canEditMovements">Editar movimentações</label>
              </div>
            </div>

            <h3 className="text-md font-medium">Sistema</h3>
            <div className="grid grid-cols-1 gap-4 pl-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canSwitchUnits" 
                  checked={permissions.canSwitchUnits}
                  onCheckedChange={(checked) => 
                    updatePermission('canSwitchUnits', checked === true)
                  }
                />
                <label htmlFor="canSwitchUnits">Trocar de unidade</label>
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
