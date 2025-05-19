
import React from 'react';
import { Movement } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import MovementEditDialog from './MovementEditDialog';

interface EnhancedMovementEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movement: Movement | null;
  onUpdate: (movement: Movement) => Promise<void>;
  onDelete: (movement: Movement, password: string) => Promise<void>;
  onSaved: () => void;
}

/**
 * Este componente serve como um wrapper para o MovementEditDialog padrão,
 * aplicando estilos personalizados aos botões
 */
const EnhancedMovementEditDialog: React.FC<EnhancedMovementEditDialogProps> = (props) => {
  // Aplicamos o CSS personalizado via injeção de estilo
  React.useEffect(() => {
    // Adiciona o CSS personalizado para os botões no dialog
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .movement-edit-dialog .dialog-buttons {
        gap: 0.75rem !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      // Remove o estilo quando o componente é desmontado
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return (
    <MovementEditDialog
      {...props}
      className="movement-edit-dialog"
    />
  );
};

export default EnhancedMovementEditDialog;
