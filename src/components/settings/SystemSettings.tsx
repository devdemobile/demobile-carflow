
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

/**
 * System settings component for system administrators
 */
const SystemSettings: React.FC = () => {
  const [systemName, setSystemName] = useState('CarFlow');
  const [companyName, setCompanyName] = useState('');
  const [enableLogs, setEnableLogs] = useState(true);
  
  const handleSave = () => {
    // Aqui implementaria a lógica para salvar as configurações
    toast.success('Configurações do sistema salvas com sucesso');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
        <CardDescription>
          Configurações avançadas do sistema (apenas para administradores).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="system-name">Nome do Sistema</Label>
            <Input 
              id="system-name" 
              value={systemName} 
              onChange={e => setSystemName(e.target.value)}
              placeholder="Nome do sistema" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome da Empresa</Label>
            <Input 
              id="company-name" 
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Nome da empresa" 
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable-logs">Registrar logs de atividades</Label>
            <p className="text-sm text-muted-foreground">
              Registra todas as atividades realizadas pelos usuários no sistema.
            </p>
          </div>
          <Switch 
            id="enable-logs" 
            checked={enableLogs}
            onCheckedChange={setEnableLogs}
          />
        </div>

        <div className="pt-4">
          <Button onClick={handleSave}>Salvar configurações do sistema</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
