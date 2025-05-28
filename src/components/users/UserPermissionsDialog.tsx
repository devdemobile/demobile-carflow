
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
import { toast } from 'sonner';
import { userRepository } from '@/services/users/userRepository';
import { supabase } from '@/integrations/supabase/client';
import PermissionsForm from './permissions/PermissionsForm';

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

        <PermissionsForm
          loading={loading}
          permissions={permissions}
          onPermissionChange={updatePermission}
        />

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
