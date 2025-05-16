
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPermissions, SystemUser } from '@/types/entities';
import { userRepository } from '@/services/users/userRepository';

interface UserPermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
  onSaved: () => void;
}

const permissionsSchema = z.object({
  canViewVehicles: z.boolean().default(false),
  canEditVehicles: z.boolean().default(false),
  canViewUnits: z.boolean().default(false),
  canEditUnits: z.boolean().default(false),
  canViewUsers: z.boolean().default(false),
  canEditUsers: z.boolean().default(false),
  canViewMovements: z.boolean().default(true),
  canEditMovements: z.boolean().default(false),
});

const UserPermissionsDialog: React.FC<UserPermissionsDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSaved
}) => {
  const form = useForm<z.infer<typeof permissionsSchema>>({
    resolver: zodResolver(permissionsSchema),
    defaultValues: {
      canViewVehicles: false,
      canEditVehicles: false,
      canViewUnits: false,
      canEditUnits: false,
      canViewUsers: false,
      canEditUsers: false,
      canViewMovements: true,
      canEditMovements: false,
    }
  });

  useEffect(() => {
    if (user?.permissions) {
      form.reset(user.permissions);
    }
  }, [user, form]);

  const onSubmit = async (data: z.infer<typeof permissionsSchema>) => {
    try {
      if (!user) return;
      
      const success = await userRepository.updatePermissions(user.id, data);
      
      if (success) {
        toast.success('Permissões atualizadas com sucesso');
        onSaved();
        onClose();
      } else {
        toast.error('Erro ao atualizar permissões');
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Permissões do Usuário</DialogTitle>
        </DialogHeader>
        
        {user && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium border-b pb-1">Veículos</h3>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="canViewVehicles"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Visualizar veículos</FormLabel>
                            <FormDescription>Permite visualizar a lista de veículos</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="canEditVehicles"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Editar veículos</FormLabel>
                            <FormDescription>Permite adicionar, editar e excluir veículos</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium border-b pb-1">Unidades</h3>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="canViewUnits"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Visualizar unidades</FormLabel>
                            <FormDescription>Permite visualizar a lista de unidades</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="canEditUnits"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Editar unidades</FormLabel>
                            <FormDescription>Permite adicionar, editar e excluir unidades</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium border-b pb-1">Usuários</h3>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="canViewUsers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Visualizar usuários</FormLabel>
                            <FormDescription>Permite visualizar a lista de usuários</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="canEditUsers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Editar usuários</FormLabel>
                            <FormDescription>Permite adicionar, editar e excluir usuários</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium border-b pb-1">Movimentações</h3>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="canViewMovements"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Visualizar movimentações</FormLabel>
                            <FormDescription>Permite visualizar a lista de movimentações</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="canEditMovements"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Editar movimentações</FormLabel>
                            <FormDescription>Permite editar e excluir movimentações</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar permissões
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserPermissionsDialog;
