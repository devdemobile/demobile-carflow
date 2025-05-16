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
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
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
import { UserRole, UserShift, UserStatus, SystemUser } from '@/types/entities';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, UserRound, Filter, Grid, List, Key, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import ChangePasswordDialog from '@/components/users/ChangePasswordDialog';
import UserPermissionsDialog from '@/components/users/UserPermissionsDialog';

interface Unit {
  id: string;
  name: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal('')),
  role: z.enum(["admin", "operator"]),
  shift: z.enum(["day", "night"]),
  unit_id: z.string().uuid("Selecione uma unidade válida"),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
});

const Users = () => {
  const { user } = useAuth();
  const { toast: toastHook } = useToast();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  
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
        toastHook({
          title: 'Erro',
          description: 'Não foi possível carregar os usuários',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toastHook]);

  // Abrir o modal para editar usuário
  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    form.reset({
      name: user.name,
      username: user.username,
      password: "", // Não preencher a senha no formulário de edição
      role: user.role,
      shift: user.shift,
      unit_id: user.unit_id,
      email: user.email || "",
    });
    setIsDialogOpen(true);
  };

  // Abrir o diálogo para criar novo usuário
  const handleNewUser = () => {
    setEditingUser(null);
    form.reset({
      name: "",
      username: "",
      password: "",
      role: "operator",
      shift: "day",
      unit_id: "",
      email: "",
    });
    setIsDialogOpen(true);
  };

  // Abrir diálogo de alteração de senha
  const handleChangePassword = (user: SystemUser) => {
    setSelectedUser(user);
    setIsPasswordDialogOpen(true);
  };

  // Abrir diálogo de edição de permissões
  const handleEditPermissions = (user: SystemUser) => {
    setSelectedUser(user);
    setIsPermissionsDialogOpen(true);
  };

  // Alternar status do usuário (ativar/desativar)
  const toggleUserStatus = async (userId: string, currentStatus: UserStatus) => {
    try {
      const newStatus: UserStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('system_users')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Atualizar o estado local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast.success(
        newStatus === 'active' 
          ? 'Usuário ativado com sucesso' 
          : 'Usuário desativado com sucesso'
      );
      
    } catch (error: any) {
      console.error('Erro ao alternar status:', error);
      toast.error('Não foi possível alterar o status do usuário');
    }
  };

  // Confirmar exclusão de usuário
  const confirmDelete = (userId: string) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  // Excluir usuário
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const { error } = await supabase
        .from('system_users')
        .delete()
        .eq('id', userToDelete);
      
      if (error) throw error;
      
      // Atualizar o estado local
      setUsers(users.filter(user => user.id !== userToDelete));
      toast.success('Usuário excluído com sucesso');
      
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Não foi possível excluir o usuário');
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingUser) {
        // Atualizar usuário existente
        const updateData: any = {
          name: values.name,
          role: values.role,
          shift: values.shift,
          unit_id: values.unit_id,
          email: values.email || null,
          updated_at: new Date().toISOString()
        };
        
        // Atualizar senha apenas se fornecida
        if (values.password && values.password.length > 0) {
          const { data: passwordHash, error: passwordError } = await supabase.rpc('hash_password', {
            password: values.password
          });
          
          if (passwordError) throw passwordError;
          updateData.password_hash = passwordHash;
        }
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('system_users')
          .update(updateData)
          .eq('id', editingUser.id)
          .select('*, units(name)')
          .single();
        
        if (updateError) throw updateError;
        
        // Atualizar lista de usuários
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        
        toast.success('Usuário atualizado com sucesso');
      } else {
        // Criar novo usuário
        const { data: passwordHash, error: passwordError } = await supabase.rpc('hash_password', {
          password: values.password as string
        });
        
        if (passwordError) throw passwordError;
        
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
            toastHook({
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
        
        toast.success('Usuário criado com sucesso');
      }
      
      // Fechar diálogo e resetar form
      setIsDialogOpen(false);
      form.reset();
      setEditingUser(null);
      
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.message || 'Não foi possível salvar o usuário');
    }
  };

  // Atualizar usuários após alteração de permissões
  const handlePermissionsUpdated = () => {
    // Recarregar a lista de usuários
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('system_users')
          .select('*, units(name)')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setUsers(data);
      } catch (error) {
        console.error('Erro ao recarregar usuários:', error);
      }
    };
    
    fetchUsers();
  };

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && (showInactiveUsers || user.status === 'active');
  });

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

  const renderUserCard = (userItem: SystemUser) => (
    <Card key={userItem.id} className={userItem.status === 'inactive' ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <Avatar>
            <AvatarFallback>{userItem.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{userItem.name}</h3>
            <p className="text-sm text-muted-foreground">{userItem.username}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {getRoleBadge(userItem.role)}
          {getShiftBadge(userItem.shift)}
          {getStatusBadge(userItem.status)}
        </div>
        
        <div className="text-sm mb-2">
          <p className="text-muted-foreground">Unidade: {userItem.units?.name || "—"}</p>
          {userItem.email && <p className="text-muted-foreground">Email: {userItem.email}</p>}
        </div>
        
        {user?.role === 'admin' && (
          <div className="flex flex-wrap justify-end gap-2 mt-4 pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleEditUser(userItem)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleChangePassword(userItem)}
            >
              <Key className="h-4 w-4 mr-1" />
              Senha
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleEditPermissions(userItem)}
            >
              <ShieldCheck className="h-4 w-4 mr-1" />
              Permissões
            </Button>
            
            <Switch size="sm" checked={userItem.status === 'active'} onCheckedChange={() => toggleUserStatus(userItem.id, userItem.status)} />
            
            {userItem.id !== user.id && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => confirmDelete(userItem.id)}
              >
                <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                Excluir
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">Usuários</h1>
            
            <div className="flex items-center gap-2 ml-2">
              <Switch 
                id="show-inactive" 
                checked={showInactiveUsers}
                onCheckedChange={setShowInactiveUsers}
                variant="success-danger"
              />
              <label htmlFor="show-inactive" className="text-sm font-medium cursor-pointer">
                {showInactiveUsers ? 'Inativos' : 'Ativos'}
              </label>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input 
                  className="pl-2 max-w-[300px]"
                  placeholder="Buscar usuário..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {user?.role === 'admin' && (
              <Button onClick={handleNewUser}>
                <UserRound className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-full h-16 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        ) : viewMode === 'table' ? (
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
                  {user?.role === 'admin' && (
                    <TableHead className="text-right">Ações</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userItem) => (
                  <TableRow key={userItem.id} className={userItem.status === 'inactive' ? 'opacity-60' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{userItem.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{userItem.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{userItem.username}</TableCell>
                    <TableCell>{getRoleBadge(userItem.role)}</TableCell>
                    <TableCell>{getShiftBadge(userItem.shift)}</TableCell>
                    <TableCell>{userItem.units?.name || "—"}</TableCell>
                    <TableCell>{getStatusBadge(userItem.status)}</TableCell>
                    <TableCell>{userItem.email || '—'}</TableCell>
                    {user?.role === 'admin' && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditUser(userItem)}
                            title="Editar usuário"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleChangePassword(userItem)}
                            title="Alterar senha"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditPermissions(userItem)}
                            title="Editar permissões"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toggleUserStatus(userItem.id, userItem.status)}
                            title={userItem.status === 'active' ? "Desativar usuário" : "Ativar usuário"}
                          >
                            <Switch size="sm" checked={userItem.status === 'active'} />
                          </Button>
                          
                          {userItem.id !== user.id && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => confirmDelete(userItem.id)}
                              title="Excluir usuário"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(renderUserCard)}
          </div>
        )}
        
        {/* Diálogos */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              {editingUser && (
                <DialogDescription>
                  Edite os detalhes do usuário. Deixe o campo de senha em branco para manter a senha atual.
                </DialogDescription>
              )}
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

                {!editingUser && (
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
                        {editingUser ? "Nova senha (opcional)" : "Senha"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={editingUser ? "Deixe em branco para manter a atual" : "Digite uma senha"}
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

                <DialogFooter>
                  <Button type="submit">
                    {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja excluir este usuário? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 text-white hover:bg-red-600">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Diálogos adicionados */}
        <ChangePasswordDialog
          isOpen={isPasswordDialogOpen}
          onClose={() => setIsPasswordDialogOpen(false)}
          user={selectedUser}
        />
        
        <UserPermissionsDialog
          isOpen={isPermissionsDialogOpen}
          onClose={() => setIsPermissionsDialogOpen(false)}
          user={selectedUser}
          onSaved={handlePermissionsUpdated}
        />
      </div>
    </Layout>
  );
};

export default Users;
