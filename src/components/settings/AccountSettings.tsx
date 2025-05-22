
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SystemUser } from '@/types/entities';
import { toast } from 'sonner';
import { useState } from 'react';

interface AccountSettingsProps {
  user: SystemUser;
}

/**
 * Component for editing user account settings
 */
const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleChangePassword = () => {
    if (isChangingPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('Preencha todos os campos de senha');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        toast.error('As senhas não correspondem');
        return;
      }
      
      // Aqui implementaria a lógica para alterar a senha
      toast.success('Senha alterada com sucesso');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setIsChangingPassword(true);
    }
  };
  
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

        {isChangingPassword ? (
          <div className="grid grid-cols-1 gap-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input 
                id="currentPassword" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input 
                id="newPassword" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button className="w-full" onClick={handleChangePassword}>
                Salvar nova senha
              </Button>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => setIsChangingPassword(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <Button className="w-full" onClick={handleChangePassword}>
                Alterar senha
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
