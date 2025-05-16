
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserRole, UserShift, UserStatus } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface SystemUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  shift: UserShift;
  status: UserStatus;
  unit_id: string;
  units: { name: string };
  email?: string;
}

interface Unit {
  id: string;
  name: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["admin", "operator"]),
  shift: z.enum(["day", "night"]),
  unit_id: z.string().uuid("Selecione uma unidade válida"),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
});

const Users = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      role: "operator",
      shift: "day",
      unit_id: "",
      email: "",
    },
  });

  // Carregar usuários e unidades
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, unitsResponse] = await Promise.all([
          supabase
            .from('system_users')
            .select('*, units(name)')
            .order('created_at', { ascending: false }),
          supabase
            .from('units')
            .select('id, name')
            .order('name')
        ]);

        if (usersResponse.error) throw usersResponse.error;
        if (unitsResponse.error) throw unitsResponse.error;

        setUsers(usersResponse.data);
        setUnits(unitsResponse.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os usuários',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Criar usuário no sistema
      const { data, error } = await supabase.rpc('hash_password', {
        password: values.password
      });
      
      if (error) throw error;
      
      const passwordHash = data;
      
      const { data: userData, error: insertError } = await supabase
        .from('system_users')
        .insert({
          name: values.name,
          username: values.username,
          password_hash: passwordHash,
          role: values.role,
          shift: values.shift,
          unit_id: values.unit_id,
          email: values.email || null,
          created_by: user?.id,
        })
        .select('*, units(name)')
        .single();
      
      if (insertError) {
        if (insertError.message.includes('unique constraint')) {
          toast({
            title: 'Erro',
            description: 'Este nome de usuário já existe',
            variant: 'destructive',
          });
        } else {
          throw insertError;
        }
        return;
      }
      
      // Adicionar permissões padrão
      await supabase
        .from('system_user_permissions')
        .insert({
          user_id: userData.id,
          can_view_movements: true,
        });
      
      // Atualizar lista de usuários
      setUsers(prev => [userData, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Usuário criado com sucesso',
      });
      
      // Fechar diálogo e resetar form
      setIsDialogOpen(false);
      form.reset();
      
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o usuário',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge className="bg-red-500">Administrador</Badge>
    ) : (
      <Badge className="bg-blue-500">Operador</Badge>
    );
  };
  
  const getShiftBadge = (shift: string) => {
    return shift === 'day' ? (
      <Badge variant="outline" className="border-yellow-500 text-yellow-500">Dia</Badge>
    ) : (
      <Badge variant="outline" className="border-indigo-500 text-indigo-500">Noite</Badge>
    );
  };
  
  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="outline" className="border-green-500 text-green-500">Ativo</Badge>
    ) : (
      <Badge variant="outline" className="border-gray-500 text-gray-500">Inativo</Badge>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Usuários</h1>
          {user?.role === 'admin' && (
            <Button onClick={() => setIsDialogOpen(true)}>Novo Usuário</Button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse">Carregando...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getShiftBadge(user.shift)}</TableCell>
                    <TableCell>{user.units.name}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
            </DialogHeader>
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
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
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

                <DialogFooter>
                  <Button type="submit">Criar Usuário</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Users;
