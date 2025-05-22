
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SystemUser } from '@/types/entities';

interface AccountSettingsProps {
  user: SystemUser;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conta</CardTitle>
        <CardDescription>
          Gerencie as informações da sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" value={user.name} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <Input id="username" value={user.username} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Input id="role" value={user.role === 'admin' ? 'Administrador' : 'Operador'} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shift">Turno</Label>
            <Input id="shift" value={user.shift === 'day' ? 'Diurno' : 'Noturno'} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unidade</Label>
            <Input id="unit" value={user.unitName || ''} readOnly />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div>
            <Button className="w-full">Alterar senha</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
