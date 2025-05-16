
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = React.useState({
    requestVehicleRegistration: true,
    useCamera: true,
    autoRefresh: false,
    refreshInterval: '5',
    theme: 'light',
  });

  const handleSwitchChange = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const handleInputChange = (setting: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const saveSettings = () => {
    // Here you would save the settings to local storage or database
    localStorage.setItem('carflow_settings', JSON.stringify(settings));
    toast({
      title: 'Configurações salvas',
      description: 'Suas configurações foram salvas com sucesso.',
    });
  };

  React.useEffect(() => {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('carflow_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>

        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="account">Conta</TabsTrigger>
            {isAdmin && <TabsTrigger value="system">Sistema</TabsTrigger>}
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Gerencie as configurações gerais do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="request-vehicle-registration">Solicitar cadastro de veículo não encontrado</Label>
                    <p className="text-sm text-muted-foreground">
                      Ao digitar uma placa não cadastrada, exibe o formulário de cadastro de veículo.
                    </p>
                  </div>
                  <Switch
                    id="request-vehicle-registration"
                    checked={settings.requestVehicleRegistration}
                    onCheckedChange={() => handleSwitchChange('requestVehicleRegistration')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="use-camera">Usar câmera para captura de fotos</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar a câmera para capturar fotos dos veículos durante o cadastro.
                    </p>
                  </div>
                  <Switch
                    id="use-camera"
                    checked={settings.useCamera}
                    onCheckedChange={() => handleSwitchChange('useCamera')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-refresh">Atualização automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Atualiza automaticamente os dados do dashboard.
                    </p>
                  </div>
                  <Switch
                    id="auto-refresh"
                    checked={settings.autoRefresh}
                    onCheckedChange={() => handleSwitchChange('autoRefresh')}
                  />
                </div>

                {settings.autoRefresh && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="refresh-interval">Intervalo de atualização (minutos)</Label>
                      <Select
                        value={settings.refreshInterval}
                        onValueChange={(value) => handleInputChange('refreshInterval', value)}
                      >
                        <SelectTrigger id="refresh-interval">
                          <SelectValue placeholder="Selecione o intervalo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 minuto</SelectItem>
                          <SelectItem value="5">5 minutos</SelectItem>
                          <SelectItem value="10">10 minutos</SelectItem>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button onClick={saveSettings}>Salvar configurações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
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
                    <Input id="email" value={user.email} readOnly />
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
                    <Input id="unit" value={user.unitName} readOnly />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <Button className="w-full">Alterar senha</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="system">
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
                      <Input id="system-name" defaultValue="CarFlow" placeholder="Nome do sistema" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nome da Empresa</Label>
                      <Input id="company-name" defaultValue="" placeholder="Nome da empresa" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enable-logs">Registrar logs de atividades</Label>
                      <p className="text-sm text-muted-foreground">
                        Registra todas as atividades realizadas pelos usuários no sistema.
                      </p>
                    </div>
                    <Switch id="enable-logs" defaultChecked />
                  </div>

                  <div className="pt-4">
                    <Button>Salvar configurações do sistema</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
