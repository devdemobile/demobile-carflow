
import React from 'react';
import { UserPermissions } from '@/types/entities';
import { Skeleton } from '@/components/ui/skeleton';
import PermissionSection from './PermissionSection';

interface PermissionsFormProps {
  loading: boolean;
  permissions: UserPermissions & { canSwitchUnits: boolean };
  onPermissionChange: (key: keyof (UserPermissions & { canSwitchUnits: boolean }), value: boolean) => void;
}

const PermissionsForm: React.FC<PermissionsFormProps> = ({
  loading,
  permissions,
  onPermissionChange
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  const vehiclePermissions = [
    {
      id: 'canViewVehicles',
      label: 'Visualizar veículos',
      checked: permissions.canViewVehicles,
      onChange: (checked: boolean) => onPermissionChange('canViewVehicles', checked)
    },
    {
      id: 'canEditVehicles',
      label: 'Editar veículos',
      checked: permissions.canEditVehicles,
      onChange: (checked: boolean) => onPermissionChange('canEditVehicles', checked)
    }
  ];

  const unitPermissions = [
    {
      id: 'canViewUnits',
      label: 'Visualizar unidades',
      checked: permissions.canViewUnits,
      onChange: (checked: boolean) => onPermissionChange('canViewUnits', checked)
    },
    {
      id: 'canEditUnits',
      label: 'Editar unidades',
      checked: permissions.canEditUnits,
      onChange: (checked: boolean) => onPermissionChange('canEditUnits', checked)
    }
  ];

  const userPermissions = [
    {
      id: 'canViewUsers',
      label: 'Visualizar usuários',
      checked: permissions.canViewUsers,
      onChange: (checked: boolean) => onPermissionChange('canViewUsers', checked)
    },
    {
      id: 'canEditUsers',
      label: 'Editar usuários',
      checked: permissions.canEditUsers,
      onChange: (checked: boolean) => onPermissionChange('canEditUsers', checked)
    }
  ];

  const movementPermissions = [
    {
      id: 'canViewMovements',
      label: 'Visualizar movimentações',
      checked: permissions.canViewMovements,
      onChange: (checked: boolean) => onPermissionChange('canViewMovements', checked)
    },
    {
      id: 'canEditMovements',
      label: 'Editar movimentações',
      checked: permissions.canEditMovements,
      onChange: (checked: boolean) => onPermissionChange('canEditMovements', checked)
    }
  ];

  const systemPermissions = [
    {
      id: 'canSwitchUnits',
      label: 'Trocar de unidade',
      checked: permissions.canSwitchUnits,
      onChange: (checked: boolean) => onPermissionChange('canSwitchUnits', checked)
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 py-4">
      <PermissionSection title="Veículos" permissions={vehiclePermissions} />
      <PermissionSection title="Unidades" permissions={unitPermissions} />
      <PermissionSection title="Usuários" permissions={userPermissions} />
      <PermissionSection title="Movimentações" permissions={movementPermissions} />
      
      <h3 className="text-md font-medium">Sistema</h3>
      <div className="grid grid-cols-1 gap-4 pl-4">
        {systemPermissions.map((permission) => (
          <div key={permission.id} className="flex items-center space-x-2">
            <Checkbox 
              id={permission.id}
              checked={permission.checked}
              onCheckedChange={(checked) => 
                permission.onChange(checked === true)
              }
            />
            <label htmlFor={permission.id}>{permission.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionsForm;
