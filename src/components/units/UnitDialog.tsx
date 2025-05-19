
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import UnitForm from './UnitForm';
import { Unit } from '@/types';
import { DeleteUnitDialog } from './DeleteUnitDialog';

interface UnitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; code: string; address?: string }) => void;
  unit?: Unit | null;
  isLoading: boolean;
}

const UnitDialog: React.FC<UnitDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  unit,
  isLoading,
}) => {
  const isEditing = !!unit?.id;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar unidade' : 'Nova unidade'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Edite os dados da unidade e clique em salvar.'
                : 'Preencha os dados da nova unidade e clique em salvar.'}
            </DialogDescription>
          </DialogHeader>
          <UnitForm unit={unit} onSubmit={onSubmit} isLoading={isLoading} />
          
          <DialogFooter className="flex justify-between mt-6 sm:justify-between">
            <div>
              {isEditing && (
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit"
                form="unit-form"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClose}
                type="button"
              >
                Fechar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isEditing && (
        <DeleteUnitDialog 
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            setIsDeleteDialogOpen(false);
            onClose();
          }}
          unitName={unit?.name || ''}
        />
      )}
    </>
  );
};

export default UnitDialog;
