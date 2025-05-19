
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
import { Pencil, Trash2, Calendar, Clock, MapPin, Car, Navigation, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

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
  onSaved,
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
    departureDate: z.string().optional(),
    departureTime: z.string().optional(),
    arrivalDate: z.string().optional(),
    arrivalTime: z.string().optional(),
    notes: z.string().optional(),
    departureUnitName: z.string().optional(),
    arrivalUnitName: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      driver: movement?.driver || '',
      destination: movement?.destination || '',
      initialMileage: movement?.initialMileage || 0,
      finalMileage: movement?.finalMileage || undefined,
      mileageRun: movement?.mileageRun || undefined,
      departureDate: movement?.departureDate || '',
      departureTime: movement?.departureTime || '',
      arrivalDate: movement?.arrivalDate || '',
      arrivalTime: movement?.arrivalTime || '',
      notes: movement?.notes || '',
      departureUnitName: movement?.departureUnitName || '',
      arrivalUnitName: movement?.arrivalUnitName || '',
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
        departureDate: movement.departureDate || '',
        departureTime: movement.departureTime || '',
        arrivalDate: movement.arrivalDate || '',
        arrivalTime: movement.arrivalTime || '',
        notes: movement.notes || '',
        departureUnitName: movement.departureUnitName || '',
        arrivalUnitName: movement.arrivalUnitName || '',
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isEditing && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsEditing(false)}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <span>Detalhes da Movimentação</span>
              </div>
              <Badge variant={getTypeVariant(movement.type)}>
                {getMovementTypeLabel(movement.type)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!isEditing ? (
              // View mode - enhanced with more fields and better organization
              <div className="space-y-6">
                {/* Vehicle Info Section */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">Informações do Veículo</h3>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {movement.photoUrl && (
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
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
                    <div>
                      <p className="font-medium text-base">{movement.vehiclePlate || movement.vehicleId}</p>
                      <p className="text-sm text-muted-foreground">{movement.vehicleName || ''}</p>
                    </div>
                  </div>
                </div>

                {/* Driver and Destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="p-1 bg-muted rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                          <circle cx="7" cy="17" r="2" />
                          <path d="M9 17h6" />
                          <circle cx="17" cy="17" r="2" />
                        </svg>
                      </span>
                      Motorista
                    </h3>
                    <p className="text-sm ml-7">{movement.driver}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="p-1 bg-muted rounded-md">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </span>
                      Destino
                    </h3>
                    <p className="text-sm ml-7">{movement.destination || "—"}</p>
                  </div>
                </div>

                {/* Origin and Arrival Units */}
                {showUnits && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <span className="p-1 bg-muted rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                            <path d="M12 3v6" />
                          </svg>
                        </span>
                        Origem
                      </h3>
                      <p className="text-sm ml-7">{movement.departureUnitName || "—"}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <span className="p-1 bg-muted rounded-md">
                          <Navigation className="h-4 w-4 text-muted-foreground" />
                        </span>
                        Unidade de Chegada
                      </h3>
                      <p className="text-sm ml-7">{movement.arrivalUnitName || "—"}</p>
                    </div>
                  </div>
                )}

                {/* Departure and Arrival Times */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 bg-muted/20 p-3 rounded-md">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="p-1 bg-muted rounded-md">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </span>
                      Data e Hora de Saída
                    </h3>
                    <p className="text-sm ml-7">
                      {movement.departureDate ? 
                        `${formatDateForDisplay(movement.departureDate)} às ${formatTimeForDisplay(movement.departureTime)}` 
                        : "—"}
                    </p>
                  </div>

                  <div className="space-y-2 bg-muted/20 p-3 rounded-md">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="p-1 bg-muted rounded-md">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </span>
                      Data e Hora de Chegada
                    </h3>
                    <p className="text-sm ml-7">
                      {movement.arrivalDate ? 
                        `${formatDateForDisplay(movement.arrivalDate)} às ${formatTimeForDisplay(movement.arrivalTime || "")}` 
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Mileage Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="p-1 bg-muted rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                          <path d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0" />
                          <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                          <path d="M12 7l0 4" />
                          <path d="M12 7l3 3" />
                        </svg>
                      </span>
                      Quilometragem Inicial
                    </h3>
                    <p className="text-sm ml-7">{movement.initialMileage.toLocaleString()} km</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="p-1 bg-muted rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                          <path d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0" />
                          <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                          <path d="M12 7l0 4" />
                          <path d="M12 7l3 3" />
                        </svg>
                      </span>
                      Quilometragem Final
                    </h3>
                    <p className="text-sm ml-7">{movement.finalMileage ? movement.finalMileage.toLocaleString() + ' km' : "—"}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="p-1 bg-muted rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                          <path d="M19 4v16" />
                          <path d="M12 4v16" />
                          <path d="M5 4v16" />
                          <path d="M4 12h16" />
                          <path d="M3 6h18" />
                          <path d="M3 18h18" />
                        </svg>
                      </span>
                      Quilometragem Percorrida
                    </h3>
                    <p className="text-sm ml-7">{movement.mileageRun ? movement.mileageRun.toLocaleString() + ' km' : "—"}</p>
                  </div>
                </div>

                {/* Duration */}
                {movement.duration && (
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="p-1 bg-muted rounded-md">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </span>
                      Duração
                    </h3>
                    <p className="text-sm ml-7">{movement.duration}</p>
                  </div>
                )}

                {/* Notes Section */}
                {movement.notes && (
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="p-1 bg-muted rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                          <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
                          <path d="M12 11h4" />
                          <path d="M12 16h4" />
                          <path d="M8 11h.01" />
                          <path d="M8 16h.01" />
                        </svg>
                      </span>
                      Observações
                    </h3>
                    <p className="text-sm ml-7">{movement.notes}</p>
                  </div>
                )}

                {userPermissions?.canEditMovements && (
                  <div className="flex justify-between space-x-2 pt-4 border-t mt-6">
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
              // Edit mode - with all editable fields
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Vehicule Information - Read Only */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Informações do Veículo</h3>
                    <div className="flex items-center gap-3">
                      {movement.photoUrl && (
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
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
                      <div>
                        <p className="font-medium">{movement.vehiclePlate || movement.vehicleId}</p>
                        <p className="text-sm text-muted-foreground">{movement.vehicleName || ''}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  <h3 className="font-semibold text-base">Informações da Movimentação</h3>

                  {/* Driver and Destination */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {/* Origin and Arrival Units */}
                  {showUnits && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="departureUnitName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade de Origem</FormLabel>
                            <FormControl>
                              <Input placeholder="Unidade de origem" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="arrivalUnitName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade de Chegada</FormLabel>
                            <FormControl>
                              <Input placeholder="Unidade de chegada (opcional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Departure Date/Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departureDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Saída</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="departureTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora de Saída</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Arrival Date/Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="arrivalDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Chegada</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="arrivalTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora de Chegada</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Mileage Information */}
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

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Observações sobre esta movimentação (opcional)" 
                            className="resize-none h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
