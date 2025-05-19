
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import ModelForm from './ModelForm';
import { DeleteModelDialog } from './DeleteModelDialog';
import { useVehicleModels } from '@/hooks/useVehicleModels';
import { useVehicleMakes } from '@/hooks/useVehicleMakes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { VehicleModel } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface ModelsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModelsDialog: React.FC<ModelsDialogProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMakeId, setSelectedMakeId] = useState<string | null>(null);
  const [filteredModels, setFilteredModels] = useState<VehicleModel[]>([]);
  const { userPermissions } = useAuth();
  const isMobile = useIsMobile();
  
  const { makes } = useVehicleMakes();
  
  const {
    models,
    isLoading,
    selectedModel,
    isAddModelOpen,
    isEditModelOpen,
    isDeleteModelOpen,
    openAddModel,
    closeAddModel,
    openEditModel,
    closeEditModel,
    openDeleteModel,
    closeDeleteModel,
    createModel,
    updateModel,
    deleteModel,
    isCreating,
    isUpdating,
    isDeleting,
    findModelsByText
  } = useVehicleModels(selectedMakeId || undefined);

  // Atualizar modelos filtrados quando o termo de busca ou a marca selecionada mudar
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredModels(models);
    } else {
      const filtered = findModelsByText(searchTerm);
      setFilteredModels(filtered);
    }
  }, [searchTerm, models, findModelsByText]);

  const handleCreateModel = (data: { name: string; makeId: string }) => {
    createModel(data);
  };

  const handleUpdateModel = (data: { name: string; makeId: string }) => {
    if (selectedModel) {
      updateModel({ 
        id: selectedModel.id,
        name: data.name,
        makeId: data.makeId 
      });
    }
  };

  const handleDeleteModel = (id: string) => {
    deleteModel(id);
  };

  const handleOpenAddModel = () => {
    openAddModel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Gerenciar Modelos</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 my-4">
          <div className="grid gap-2">
            <Label htmlFor="makeFilter">Filtrar por marca</Label>
            <Combobox
              options={[
                { label: 'Todas as marcas', value: '' },
                ...makes.map(make => ({ label: make.name, value: make.id }))
              ]}
              value={selectedMakeId || ''}
              onSelect={(value) => setSelectedMakeId(value || null)}
              placeholder="Selecione uma marca"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-8"
                placeholder="Buscar modelos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {userPermissions?.canEditVehicles && (
              <Button onClick={handleOpenAddModel} className="flex-shrink-0">
                <Plus className="h-4 w-4" />
                {!isMobile && <span className="ml-2">Novo Modelo</span>}
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="flex-1 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modelo</TableHead>
                <TableHead>Marca</TableHead>
                {userPermissions?.canEditVehicles && (
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    {searchTerm ? 'Nenhum modelo encontrado' : 'Nenhum modelo cadastrado'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>{model.name}</TableCell>
                    <TableCell>{model.makeName}</TableCell>
                    {userPermissions?.canEditVehicles && (
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditModel(model)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDeleteModel(model)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
        
        {/* Formulários e diálogos */}
        <ModelForm
          isOpen={isAddModelOpen}
          onClose={closeAddModel}
          onSave={handleCreateModel}
          isLoading={isCreating}
          defaultMakeId={selectedMakeId || undefined}
        />
        
        <ModelForm
          isOpen={isEditModelOpen}
          onClose={closeEditModel}
          onSave={handleUpdateModel}
          isLoading={isUpdating}
          editingModel={selectedModel}
        />
        
        <DeleteModelDialog
          isOpen={isDeleteModelOpen}
          onClose={closeDeleteModel}
          onDelete={handleDeleteModel}
          model={selectedModel}
          isLoading={isDeleting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ModelsDialog;
