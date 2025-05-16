
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { SystemUser } from '@/types/entities';
import { userRepository } from '@/services/users/userRepository';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
}

const passwordSchema = z.object({
  newPassword: z.string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .max(50, "A senha não deve ter mais de 50 caracteres"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      if (!user) return;
      
      const success = await userRepository.updateUserPassword(user.id, data.newPassword);
      
      if (success) {
        toast.success('Senha alterada com sucesso');
        form.reset();
        onClose();
      } else {
        toast.error('Erro ao alterar a senha');
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Alterar Senha do Usuário</DialogTitle>
        </DialogHeader>
        
        {user && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Digite a nova senha" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Digite novamente a nova senha" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Alterar Senha
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
