
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface Permission {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface PermissionSectionProps {
  title: string;
  permissions: Permission[];
}

const PermissionSection: React.FC<PermissionSectionProps> = ({
  title,
  permissions
}) => {
  return (
    <>
      <h3 className="text-md font-medium">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
        {permissions.map((permission) => (
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
    </>
  );
};

export default PermissionSection;
