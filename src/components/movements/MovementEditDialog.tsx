
import React, { useState, useEffect } from 'react';
import { Movement, VehicleLocation } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface MovementEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movement: Movement | null;
  onUpdate: (movement: Movement) => Promise<void>;
  onDelete: (movement: Movement, password: string) => Promise<void>;
  onSaved: () => void;
  className?: string; // Adicionada a propriedade className
}

const formSchema = z.object({
  status: z.enum(['yard', 'out']).or(z.string()), // Garantir que seja compatível com VehicleLocation
});

const MovementEditDialog: React.FC<MovementEditDialogProps> = ({ isOpen, onClose, movement, onUpdate, onDelete, onSaved, className }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>(undefined);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: movement?.status || 'yard',
    },
  });
  
  useEffect(() => {
    if (movement) {
      form.reset({
        status: movement.status || 'yard',
      });
      setDepartureDate(movement.departureDate ? new Date(movement.departureDate) : undefined);
      setArrivalDate(movement.arrivalDate ? new Date(movement.arrivalDate) : undefined);
    }
  }, [movement, form]);
  
  const handleUpdate = async (values: z.infer<typeof formSchema>) => {
    if (!movement) return;
    setIsSubmitting(true);
    try {
      // Garantindo que status seja do tipo VehicleLocation
      const status = values.status as VehicleLocation;
      
      await onUpdate({ 
        ...movement, 
        status, 
        departureDate: departureDate?.toISOString() || movement.departureDate,
        arrivalDate: arrivalDate?.toISOString() || movement.arrivalDate 
      });
      toast.success('Movimentação atualizada com sucesso!');
      onClose();
      onSaved();
    } catch (error) {
      toast.error('Erro ao atualizar movimentação.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!movement) return;
    setIsSubmitting(true);
    try {
      await onDelete(movement, deletePassword);
      toast.success('Movimentação excluída com sucesso!');
      onClose();
      onSaved();
    } catch (error) {
      toast.error('Erro ao excluir movimentação. Verifique a senha.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    onClose();
  };
  
  if (!movement) {
    return null; // Or a loading state if movement is being fetched
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle>Editar Movimentação</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleUpdate)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={form.getValues().status}
                onValueChange={(value) => form.setValue('status', value, { shouldValidate: true })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yard">No Pátio</SelectItem>
                  <SelectItem value="out">Em Rota</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departureDate" className="text-right">
                Data de Saída
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'col-span-3 flex justify-start text-left font-normal',
                      !departureDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, 'dd/MM/yyyy', { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="arrivalDate" className="text-right">
                Data de Chegada
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'col-span-3 flex justify-start text-left font-normal',
                      !arrivalDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {arrivalDate ? format(arrivalDate, 'dd/MM/yyyy', { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={arrivalDate}
                    onSelect={setArrivalDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="dialog-footer">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Para excluir esta movimentação, insira sua senha e confirme.
          </p>
          <div className="grid gap-2 py-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
          <Button
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleDelete}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Excluir Movimentação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovementEditDialog;
