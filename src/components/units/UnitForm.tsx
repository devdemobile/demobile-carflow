
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Unit } from '@/types';

const unitSchema = z.object({
  name: z.string()
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'O nome não pode ter mais de 100 caracteres' }),
  code: z.string()
    .min(2, { message: 'O código deve ter pelo menos 2 caracteres' })
    .max(20, { message: 'O código não pode ter mais de 20 caracteres' }),
  address: z.string().optional(),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitFormProps {
  unit?: Partial<Unit>;
  onSubmit: (values: UnitFormValues) => void;
  isLoading: boolean;
}

const UnitForm: React.FC<UnitFormProps> = ({ unit, onSubmit, isLoading }) => {
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: unit?.name || '',
      code: unit?.code || '',
      address: unit?.address || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="unit-form">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da unidade</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da unidade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código da unidade</FormLabel>
              <FormControl>
                <Input placeholder="Digite o código da unidade (ex: MTZ)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Digite o endereço completo da unidade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default UnitForm;
