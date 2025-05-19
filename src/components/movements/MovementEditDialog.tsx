
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Movement } from "@/types";
import { formatDateForDisplay, formatTimeForDisplay } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";

interface MovementEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movement: Movement | null;
  onUpdate: (updatedMovement: Movement) => Promise<void>;
  onDelete: (movement: Movement, password: string) => Promise<void>;
  onSaved?: (result: any) => void; // Add this for backward compatibility
  showUnits?: boolean;
}

const MovementEditDialog: React.FC<MovementEditDialogProps> = ({
  isOpen,
  onClose,
  movement,
  onUpdate,
  onDelete,
  onSaved, // Accept the new prop
  showUnits = false
}) => {
  const { userPermissions } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');

  const formSchema = z.object({
    driver: z.string().min(1, "Nome do motorista é obrigatório"),
    destination: z.string().optional(),
    initialMileage: z.number().int().positive(),
    finalMileage: z.number().int().positive().optional(),
    mileageRun: z.number().int().positive().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      driver: movement?.driver || '',
      destination: movement?.destination || '',
      initialMileage: movement?.initialMileage || 0,
      finalMileage: movement?.finalMileage || undefined,
      mileageRun: movement?.mileageRun || undefined,
    }
  });

  React.useEffect(() => {
    if (movement) {
      form.reset({
        driver: movement.driver,
        destination: movement.destination || '',
        initialMileage: movement.initialMileage,
        finalMileage: movement.finalMileage,
        mileageRun: movement.mileageRun,
      });
    }
  }, [movement, form]);

  const handleDelete = async () => {
    if (!movement) return;

    setIsLoading(true);
    try {
      await onDelete(movement, password);
      toast.success("Movimentação excluída com sucesso");
      if (onSaved) onSaved(null); // Call onSaved if provided
      onClose();
    } catch (error: any) {
      toast.error(`Erro ao excluir: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsDeleteAlertOpen(false);
      setPassword('');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!movement) return;

    setIsLoading(true);
    try {
      const updatedMovement: Movement = {
        ...movement,
        ...values,
      };

      await onUpdate(updatedMovement);
      toast.success("Movimentação atualizada com sucesso");
      if (onSaved) onSaved(updatedMovement); // Call onSaved if provided
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Erro ao atualizar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!movement) return null;

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'exit': return 'Saída';
      case 'entry': return 'Entrada';
      case 'initial': return 'Registro Inicial';
      default: return type;
    }
  };

  const getMovementStatusLabel = (status: string) => {
    switch (status) {
      case 'yard': return 'No Pátio';
      case 'out': return 'Em Rota';
      default: return status;
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'exit': return 'warning'; // Laranja para Saída
      case 'entry': return 'success'; // Verde para Entrada
      case 'initial': return 'outline';
      default: return 'default';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          onClose();
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes da Movimentação</span>
              <Badge variant={getTypeVariant(movement.type)}>
                {getMovementTypeLabel(movement.type)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!isEditing ? (
              // View mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Veículo</h3>
                    <p className="text-sm flex items-center gap-2">
                      {movement.photoUrl && (
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={movement.photoUrl} 
                            alt={`Veículo ${movement.vehiclePlate || movement.vehicleId}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                      {movement.vehiclePlate || movement.vehicleId}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Motorista</h3>
                    <p className="text-sm">{movement.driver}</p>
                  </div>

                  {showUnits && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Origem</h3>
                      <p className="text-sm">{movement.departureUnitName || "—"}</p>
                    </div>
                  )}

                  {movement.destination && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Destino</h3>
                      <p className="text-sm">{movement.destination}</p>
                    </div>
                  )}

                  {showUnits && movement.arrivalUnitName && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Unidade de Chegada</h3>
                      <p className="text-sm">{movement.arrivalUnitName}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-medium">Data e Hora de Saída</h3>
                    <p className="text-sm">
                      {movement.departureDate ? 
                        `${formatDateForDisplay(movement.departureDate)} ${formatTimeForDisplay(movement.departureTime)}` 
                        : "—"}
                    </p>
                  </div>

                  {movement.arrivalDate && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Data e Hora de Chegada</h3>
                      <p className="text-sm">
                        {`${formatDateForDisplay(movement.arrivalDate)} ${formatTimeForDisplay(movement.arrivalTime || "")}`}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-medium">Quilometragem Inicial</h3>
                    <p className="text-sm">{movement.initialMileage.toLocaleString()} km</p>
                  </div>

                  {movement.finalMileage && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Quilometragem Final</h3>
                      <p className="text-sm">{movement.finalMileage.toLocaleString()} km</p>
                    </div>
                  )}

                  {movement.mileageRun && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Quilometragem Percorrida</h3>
                      <p className="text-sm">{movement.mileageRun.toLocaleString()} km</p>
                    </div>
                  )}
                </div>

                {userPermissions?.canEditMovements && (
                  <div className="flex justify-between space-x-2 pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={() => setIsDeleteAlertOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={onClose}
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Edit mode
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="driver"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motorista</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do motorista" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destino</FormLabel>
                        <FormControl>
                          <Input placeholder="Destino (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="initialMileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Km Inicial</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="finalMileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Km Final</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Opcional"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mileageRun"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Km Percorridos</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Opcional"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Digite sua senha para confirmar a exclusão desta movimentação.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-3">
            <Input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPassword('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isLoading || !password}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MovementEditDialog;
