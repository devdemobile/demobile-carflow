
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VehicleModel } from "@/types";

interface DeleteModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  model: VehicleModel | null;
  isLoading: boolean;
}

export function DeleteModelDialog({ 
  isOpen, 
  onClose, 
  onDelete, 
  model, 
  isLoading 
}: DeleteModelDialogProps) {
  const handleDelete = () => {
    if (model) {
      onDelete(model.id);
    }
  };

  if (!model) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir modelo</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o modelo <strong>{model.name}</strong> 
            da marca <strong>{model.makeName}</strong>?
            <br /><br />
            Essa ação não poderá ser desfeita. Note que só é possível excluir modelos que não
            possuam veículos associados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Excluindo..." : "Excluir modelo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
