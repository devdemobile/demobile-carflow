
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
import { VehicleMake } from "@/types";

interface DeleteMakeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  make: VehicleMake | null;
  isLoading: boolean;
}

export function DeleteMakeDialog({ 
  isOpen, 
  onClose, 
  onDelete, 
  make, 
  isLoading 
}: DeleteMakeDialogProps) {
  const handleDelete = () => {
    if (make) {
      onDelete(make.id);
    }
  };

  if (!make) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir marca</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a marca <strong>{make.name}</strong>?
            <br /><br />
            Essa ação não poderá ser desfeita. Note que só é possível excluir marcas que não
            possuam modelos ou veículos associados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Excluindo..." : "Excluir marca"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
