
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeleteUnitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  unitName: string;
}

export const DeleteUnitDialog: React.FC<DeleteUnitDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  unitName,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const isConfirmDisabled = confirmationText !== unitName;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir unidade</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a unidade <strong>{unitName}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label htmlFor="confirmation-text" className="text-sm font-medium">
            Digite o nome da unidade <strong>"{unitName}"</strong> para confirmar:
          </Label>
          <Input 
            id="confirmation-text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="mt-2"
            placeholder={unitName}
          />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isConfirmDisabled}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
