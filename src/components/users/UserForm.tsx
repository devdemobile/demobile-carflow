
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
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SystemUser } from '@/types/entities';

interface Unit {
  id: string;
  name: string;
}

interface UserFormProps {
  user: SystemUser | null;
  units: Unit[];
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export const userFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal('')),
  role: z.enum(["admin", "operator"]),
  shift: z.enum(["day", "night"]),
  unit_id: z.string().uuid("Selecione uma unidade válida"),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

const UserForm: React.FC<UserFormProps> = ({ user, units, onSubmit }) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      password: "", // Sempre inicia vazio para segurança
      role: (user?.role as "admin" | "operator") || "operator",
      shift: (user?.shift as "day" | "night") || "day",
      unit_id: user?.unitId || user?.unit_id || "",
      email: user?.email || "",
    },
  });

  const isEditing = !!user;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome de usuário</FormLabel>
                <FormControl>
                  <Input placeholder="Nome de acesso ao sistema" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isEditing ? "Nova senha (opcional)" : "Senha"}
              </FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={isEditing ? "Deixe em branco para manter a atual" : "Digite uma senha"}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Função</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="operator">Operador</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="shift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Turno</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="day">Dia</SelectItem>
                    <SelectItem value="night">Noite</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="unit_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (opcional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-4 w-full">
          {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
        </Button>
      </form>
    </Form>
  );
};

export default UserForm;
