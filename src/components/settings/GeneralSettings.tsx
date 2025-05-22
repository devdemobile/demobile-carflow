
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingsData {
  requestVehicleRegistration: boolean;
  useCamera: boolean;
  autoRefresh: boolean;
  refreshInterval: string;
  theme: string;
}

interface GeneralSettingsProps {
  settings: SettingsData;
  handleSwitchChange: (setting: string) => void;
  handleInputChange: (setting: string, value: string) => void;
  saveSettings: () => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  handleSwitchChange,
  handleInputChange,
  saveSettings
}) => {
  return (
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
  );
};

export default GeneralSettings;
