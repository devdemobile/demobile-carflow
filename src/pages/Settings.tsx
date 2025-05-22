
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import AccountSettings from '@/components/settings/AccountSettings';
import SystemSettings from '@/components/settings/SystemSettings';
import GeneralSettings from '@/components/settings/GeneralSettings';

const Settings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>

        <Tabs defaultValue="account" className="max-w-4xl">
          <TabsList>
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
            {isAdmin && <TabsTrigger value="system">Sistema</TabsTrigger>}
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="account">
              {user && <AccountSettings user={user} />}
            </TabsContent>
            
            <TabsContent value="general">
              <GeneralSettings />
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="system">
                <SystemSettings />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
