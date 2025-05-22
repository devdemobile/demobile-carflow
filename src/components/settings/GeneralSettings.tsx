
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GeneralSettingsProps {
  onSaveSettings?: () => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  onSaveSettings = () => {}
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
        <CardDescription>
          Ajuste as configurações gerais do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="theme-preference">Tema Preferido</Label>
            <div className="flex justify-between items-center">
              <span>Modo Escuro</span>
              <Switch id="theme-preference" defaultChecked />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <select
              id="language"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="pt-BR"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Notificações</Label>
            <p className="text-sm text-muted-foreground">
              Receber notificações sobre atividades no sistema.
            </p>
          </div>
          <Switch id="notifications" defaultChecked />
        </div>

        <div className="pt-4">
          <Button onClick={onSaveSettings}>Salvar configurações gerais</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
