
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Movement } from '@/types';
import { formatDateForDisplay, formatTimeForDisplay } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast"
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import './movement-dialog.css';

const FormSchema = z.object({
  vehiclePlate: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  driver: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  departureDate: z.date({
    required_error: "A date of birth is required.",
  }),
  departureTime: z.string().min(5, {
    message: "Departure time is required.",
  }),
  arrivalDate: z.date({
    required_error: "A date of birth is required.",
  }).nullable(),
  arrivalTime: z.string().nullable(),
  initialMileage: z.number().min(0, {
    message: "Initial mileage must be a positive number.",
  }),
  finalMileage: z.number().min(0, {
    message: "Final mileage must be a positive number.",
  }).nullable(),
  origin: z.string().min(2, {
    message: "Origin must be at least 2 characters.",
  }),
  destination: z.string().min(2, {
    message: "Destination must be at least 2 characters.",
  }),
  notes: z.string().optional(),
})

interface MovementEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movement: Movement | null;
  onUpdate: (movement: Movement) => Promise<void>;
  onDelete: (movement: Movement, password: string) => Promise<void>;
  onSaved: () => void;
  className?: string;
}

const MovementEditDialog: React.FC<MovementEditDialogProps> = ({ 
  isOpen, 
  onClose, 
  movement, 
  onUpdate, 
  onDelete, 
  onSaved,
  className 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const { toast } = useToast()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      vehiclePlate: movement?.vehiclePlate || '',
      driver: movement?.driver || '',
      departureDate: movement?.departureDate ? new Date(movement.departureDate) : new Date(),
      departureTime: movement?.departureTime || '00:00',
      arrivalDate: movement?.arrivalDate ? new Date(movement.arrivalDate) : null,
      arrivalTime: movement?.arrivalTime || null,
      initialMileage: movement?.initialMileage || 0,
      finalMileage: movement?.finalMileage || null,
      origin: movement?.departureUnitName || '',
      destination: movement?.arrivalUnitName || '',
      notes: movement?.notes || '',
    },
  })

  useEffect(() => {
    if (movement) {
      form.reset({
        vehiclePlate: movement.vehiclePlate || '',
        driver: movement.driver || '',
        departureDate: movement.departureDate ? new Date(movement.departureDate) : new Date(),
        departureTime: movement.departureTime || '00:00',
        arrivalDate: movement.arrivalDate ? new Date(movement.arrivalDate) : null,
        arrivalTime: movement.arrivalTime || null,
        initialMileage: movement.initialMileage || 0,
        finalMileage: movement.finalMileage || null,
        origin: movement.departureUnitName || '',
        destination: movement.arrivalUnitName || '',
        notes: movement.notes || '',
      });
    }
  }, [movement, form]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      if (movement) {
        const updatedMovement: Movement = {
          ...movement,
          vehiclePlate: values.vehiclePlate,
          driver: values.driver,
          departureDate: values.departureDate.toISOString(),
          departureTime: values.departureTime,
          arrivalDate: values.arrivalDate ? values.arrivalDate.toISOString() : null,
          arrivalTime: values.arrivalTime || null,
          initialMileage: values.initialMileage,
          finalMileage: values.finalMileage || null,
          departureUnitName: values.origin,
          arrivalUnitName: values.destination,
          notes: values.notes,
        };
        await onUpdate(updatedMovement);
        toast({
          title: "Movimentação atualizada.",
        })
        onSaved();
        onClose();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar a movimentação.",
        description: "Por favor, tente novamente.",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      if (movement) {
        await onDelete(movement, deletePassword);
        toast({
          title: "Movimentação excluída.",
        })
        onSaved();
        onClose();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir a movimentação.",
        description: "Por favor, verifique a senha e tente novamente.",
      })
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle>Editar Movimentação</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias e salve.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehiclePlate" className="text-right">
              Placa
            </Label>
            <Input type="text" id="vehiclePlate"  className="col-span-3" placeholder="Placa do veículo"  {...form.register("vehiclePlate")} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driver" className="text-right">
              Motorista
            </Label>
            <Input type="text" id="driver"  className="col-span-3" placeholder="Nome do motorista" {...form.register("driver")} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="departureDate" className="text-right">
              Data de Saída
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !form.getValues("departureDate") && "text-muted-foreground"
                  )}
                >
                  {form.getValues("departureDate") ? (
                    format(form.getValues("departureDate"), "PPP", {locale: ptBR})
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  locale={ptBR}
                  selected={form.getValues("departureDate")}
                  onSelect={(date) => form.setValue("departureDate", date!)}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="departureTime" className="text-right">
              Hora de Saída
            </Label>
            <Input type="time" id="departureTime"  className="col-span-3"  {...form.register("departureTime")} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="arrivalDate" className="text-right">
              Data de Chegada
            </Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !form.getValues("arrivalDate") && "text-muted-foreground"
                  )}
                >
                  {form.getValues("arrivalDate") ? (
                    format(form.getValues("arrivalDate"), "PPP", {locale: ptBR})
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  locale={ptBR}
                  selected={form.getValues("arrivalDate")}
                  onSelect={(date) => form.setValue("arrivalDate", date!)}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="arrivalTime" className="text-right">
              Hora de Chegada
            </Label>
            <Input type="time" id="arrivalTime"  className="col-span-3"  {...form.register("arrivalTime")} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="initialMileage" className="text-right">
              KM Inicial
            </Label>
            <Input
              type="number"
              id="initialMileage"
              className="col-span-3"
              placeholder="Quilometragem inicial"
              {...form.register("initialMileage", { valueAsNumber: true })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="finalMileage" className="text-right">
              KM Final
            </Label>
            <Input
              type="number"
              id="finalMileage"
              className="col-span-3"
              placeholder="Quilometragem final"
              {...form.register("finalMileage", { valueAsNumber: true })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origin" className="text-right">
              Origem
            </Label>
            <Input type="text" id="origin"  className="col-span-3" placeholder="Local de origem"  {...form.register("origin")} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="destination" className="text-right">
              Destino
            </Label>
            <Input type="text" id="destination" className="col-span-3" placeholder="Local de destino"  {...form.register("destination")} />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right mt-2">
              Notas
            </Label>
            <Textarea id="notes" className="col-span-3" placeholder="Notas adicionais" {...form.register("notes")} />
          </div>
        </form>
        <DialogFooter>
          <div className="dialog-buttons">
            <Button type="submit" disabled={isLoading || isDeleting} onClick={form.handleSubmit(onSubmit)}>
              Salvar Alterações
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </DialogFooter>
        <div className="border-t border-gray-200 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deletePassword" className="text-right">
              Senha para Excluir
            </Label>
            <Input
              type="password"
              id="deletePassword"
              className="col-span-3"
              placeholder="Senha"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={isDeleting}
            />
          </div>
          <Button
            variant="destructive"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="mt-2 w-full"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Movimentação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovementEditDialog;
