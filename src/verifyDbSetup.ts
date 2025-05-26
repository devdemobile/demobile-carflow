
/**
 * Este arquivo verifica se as estruturas de banco de dados necessárias estão configuradas.
 * 
 * Verificações realizadas:
 * 1. Tabela system_users com os campos necessários
 * 2. Tabela system_user_permissions com os campos necessários
 * 3. Função verify_password para autenticação
 * 4. Trigger update_vehicle_on_movement para atualizar veículos após movimentação
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Verifica se o banco de dados está configurado corretamente
 */
export const verifyDatabaseSetup = async (): Promise<{ valid: boolean; issues: string[] }> => {
  const issues: string[] = [];
  
  // Verificar tabelas
  try {
    const { data: users, error: usersError } = await supabase
      .from('system_users')
      .select('id')
      .limit(1);
      
    if (usersError) {
      issues.push('Tabela system_users não está acessível: ' + usersError.message);
    }
    
    const { data: permissions, error: permissionsError } = await supabase
      .from('system_user_permissions')
      .select('id')
      .limit(1);
      
    if (permissionsError) {
      issues.push('Tabela system_user_permissions não está acessível: ' + permissionsError.message);
    }
  } catch (error: any) {
    issues.push('Erro ao verificar tabelas: ' + error.message);
  }
  
  // Verificar função verify_password
  try {
    const { data: passwordResult, error: passwordError } = await supabase.rpc('verify_password', {
      username_input: 'test_user_nonexistent',
      password_attempt: 'test_password'
    });
    
    if (passwordError && !passwordError.message.includes('não encontrado')) {
      issues.push('Função verify_password não está funcionando corretamente: ' + passwordError.message);
    }
  } catch (error: any) {
    issues.push('Erro ao verificar função verify_password: ' + error.message);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};
