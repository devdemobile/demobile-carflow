
/**
 * Serviço de autenticação
 */
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LoginCredentials, SystemUser, UserPermissions } from '@/types';

/**
 * Realiza login com credenciais
 */
export const loginWithCredentials = async (credentials: LoginCredentials): Promise<SystemUser | null> => {
  try {
    const { username, password } = credentials;
    
    // Utiliza a função do Postgres para verificar a senha
    const { data: userId, error: verifyError } = await supabase
      .rpc('verify_password', { username, password_attempt: password });
    
    if (verifyError || !userId) {
      console.error('Erro na verificação de senha:', verifyError);
      toast.error('Nome de usuário ou senha incorretos');
      return null;
    }
    
    // Recupera os dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('system_users')
      .select(`
        *,
        units:unit_id (
          name
        )
      `)
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      console.error('Erro ao recuperar dados do usuário:', userError);
      toast.error('Erro ao carregar dados do usuário');
      return null;
    }
    
    // Recupera as permissões do usuário
    const { data: permissionsData, error: permissionsError } = await supabase
      .from('system_user_permissions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (permissionsError) {
      console.error('Erro ao recuperar permissões:', permissionsError);
      // Não bloqueia o login, apenas avisa
      toast.warning('Não foi possível carregar as permissões do usuário');
    }
    
    const permissions: UserPermissions = permissionsData ? {
      canViewVehicles: permissionsData.can_view_vehicles,
      canEditVehicles: permissionsData.can_edit_vehicles,
      canViewUnits: permissionsData.can_view_units,
      canEditUnits: permissionsData.can_edit_units,
      canViewUsers: permissionsData.can_view_users,
      canEditUsers: permissionsData.can_edit_users,
      canViewMovements: permissionsData.can_view_movements,
      canEditMovements: permissionsData.can_edit_movements
    } : {} as UserPermissions;
    
    // Mapeia para o formato de SystemUser
    const user: SystemUser = {
      id: userData.id,
      name: userData.name,
      username: userData.username,
      email: userData.email || undefined,
      role: userData.role,
      shift: userData.shift,
      status: userData.status,
      unitId: userData.unit_id,
      unitName: userData.units?.name,
      permissions
    };
    
    toast.success('Login realizado com sucesso');
    return user;
  } catch (error: any) {
    console.error('Erro durante o processo de login:', error);
    toast.error('Ocorreu um erro ao fazer login');
    return null;
  }
};

/**
 * Atualiza o usuário de uma unidade para outra
 */
export const switchUserUnit = async (userId: string, unitId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('system_users')
      .update({ unit_id: unitId })
      .eq('id', userId);
    
    if (error) {
      console.error('Erro ao trocar unidade:', error);
      toast.error(`Erro ao trocar unidade: ${error.message}`);
      return false;
    }
    
    toast.success('Unidade alterada com sucesso');
    return true;
  } catch (error: any) {
    console.error('Erro ao trocar unidade do usuário:', error);
    toast.error('Erro ao trocar unidade');
    return false;
  }
};
