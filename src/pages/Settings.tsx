
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Componentes refatorados
import GeneralSettings from '@/components/settings/GeneralSettings';
import AccountSettings from '@/components/settings/AccountSettings';
import SystemSettings from '@/components/settings/SystemSettings';

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
    // Salvar configurações no localStorage
    localStorage.setItem('carflow_settings', JSON.stringify(settings));
    toast({
      title: 'Configurações salvas',
      description: 'Suas configurações foram salvas com sucesso.',
    });
  };

  React.useEffect(() => {
    // Carregar configurações do localStorage
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
            <GeneralSettings 
              settings={settings}
              handleSwitchChange={handleSwitchChange}
              handleInputChange={handleInputChange}
              saveSettings={saveSettings}
            />
          </TabsContent>

          <TabsContent value="account">
            <AccountSettings user={user} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="system">
              <SystemSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
