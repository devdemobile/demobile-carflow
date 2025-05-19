
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import UnitForm from './UnitForm';
import { Unit } from '@/types';

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
  
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
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
      </DialogContent>
    </Dialog>
  );
};

export default UnitDialog;
