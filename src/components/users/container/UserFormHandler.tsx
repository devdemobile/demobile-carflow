
import React from 'react';
import { SystemUser } from '@/types/entities';
import { UserFormValues } from '../UserForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserFormHandlerProps {
  editingUser: SystemUser | null;
  currentUser: SystemUser | null;
  setUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
  onClose: () => void;
}

export const useUserFormHandler = ({ 
  editingUser, 
  currentUser, 
  setUsers, 
  onClose 
}: UserFormHandlerProps) => {
  
  const onSubmit = async (values: UserFormValues) => {
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
          updateData.password_hash = values.password;
        }
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('system_users')
          .update(updateData)
          .eq('id', editingUser.id)
          .select('*, units(name)')
          .single();
        
        if (updateError) {
          toast.error(`Erro ao atualizar usuário: ${updateError.message}`);
          return;
        }
        
        if (updatedUser) {
          const mappedUpdatedUser: SystemUser = {
            id: updatedUser.id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email || undefined,
            role: updatedUser.role,
            shift: updatedUser.shift,
            status: updatedUser.status,
            unitId: updatedUser.unit_id,
            unit_id: updatedUser.unit_id,
            unitName: updatedUser.units?.name,
            units: updatedUser.units
          };
          
          setUsers(prev => prev.map(u => u.id === mappedUpdatedUser.id ? mappedUpdatedUser : u));
          toast.success('Usuário atualizado com sucesso');
        }
      } else {
        // Criar novo usuário
        const { data: userData, error: insertError } = await supabase
          .from('system_users')
          .insert({
            name: values.name,
            username: values.username,
            password_hash: values.password,
            role: values.role,
            shift: values.shift,
            unit_id: values.unit_id,
            email: values.email || null,
            created_by: currentUser?.id,
          })
          .select('*, units(name)')
          .single();
        
        if (insertError) {
          if (insertError.message.includes('unique constraint')) {
            toast.error('Este nome de usuário já existe');
          } else {
            toast.error(`Erro ao criar usuário: ${insertError.message}`);
          }
          return;
        }
        
        if (userData) {
          // Adicionar permissões padrão
          const { error: permError } = await supabase
            .from('system_user_permissions')
            .insert({
              user_id: userData.id,
              can_view_movements: true,
            });
          
          if (permError) {
            toast.error(`Erro ao adicionar permissões: ${permError.message}`);
          }
          
          const mappedNewUser: SystemUser = {
            id: userData.id,
            name: userData.name,
            username: userData.username,
            email: userData.email || undefined,
            role: userData.role,
            shift: userData.shift,
            status: userData.status,
            unitId: userData.unit_id,
            unit_id: userData.unit_id,
            unitName: userData.units?.name,
            units: userData.units
          };
          
          setUsers(prev => [mappedNewUser, ...prev]);
          toast.success('Usuário criado com sucesso');
        }
      }
      
      onClose();
      
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.message || 'Não foi possível salvar o usuário');
    }
  };

  return { onSubmit };
};
