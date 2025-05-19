
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
import MakeForm from './MakeForm';
import { DeleteMakeDialog } from './DeleteMakeDialog';
import { useVehicleMakes } from '@/hooks/useVehicleMakes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { VehicleMake } from '@/types';

interface MakesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const MakesDialog: React.FC<MakesDialogProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMakes, setFilteredMakes] = useState<VehicleMake[]>([]);
  const { userPermissions } = useAuth();
  
  const {
    makes,
    isLoading,
    selectedMake,
    isAddMakeOpen,
    isEditMakeOpen,
    isDeleteMakeOpen,
    openAddMake,
    closeAddMake,
    openEditMake,
    closeEditMake,
    openDeleteMake,
    closeDeleteMake,
    createMake,
    updateMake,
    deleteMake,
    isCreating,
    isUpdating,
    isDeleting,
    findMakesByText
  } = useVehicleMakes();

  // Atualizar marcas filtradas quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMakes(makes);
    } else {
      setFilteredMakes(findMakesByText(searchTerm));
    }
  }, [searchTerm, makes, findMakesByText]);

  const handleCreateMake = (name: string) => {
    createMake(name);
  };

  const handleUpdateMake = (name: string) => {
    if (selectedMake) {
      updateMake({ id: selectedMake.id, name });
    }
  };

  const handleDeleteMake = (id: string) => {
    deleteMake(id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Gerenciar Marcas</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-between my-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-8"
              placeholder="Buscar marcas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {userPermissions?.canEditVehicles && (
            <Button onClick={openAddMake}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Marca
            </Button>
          )}
        </div>
        
        <ScrollArea className="flex-1 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                {userPermissions?.canEditVehicles && (
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredMakes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    {searchTerm ? 'Nenhuma marca encontrada' : 'Nenhuma marca cadastrada'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMakes.map((make) => (
                  <TableRow key={make.id}>
                    <TableCell>{make.name}</TableCell>
                    {userPermissions?.canEditVehicles && (
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditMake(make)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDeleteMake(make)}
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
        <MakeForm
          isOpen={isAddMakeOpen}
          onClose={closeAddMake}
          onSave={handleCreateMake}
          isLoading={isCreating}
        />
        
        <MakeForm
          isOpen={isEditMakeOpen}
          onClose={closeEditMake}
          onSave={handleUpdateMake}
          isLoading={isUpdating}
          editingMake={selectedMake}
        />
        
        <DeleteMakeDialog
          isOpen={isDeleteMakeOpen}
          onClose={closeDeleteMake}
          onDelete={handleDeleteMake}
          make={selectedMake}
          isLoading={isDeleting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MakesDialog;
