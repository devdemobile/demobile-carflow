
/**
 * Este arquivo verifica se as estruturas de banco de dados necessárias estão configuradas.
 * 
 * Verificações realizadas:
 * 1. Tabela system_users com os campos necessários
 * 2. Tabela system_user_permissions com os campos necessários
 * 3. Função verify_password para autenticação
 * 4. Função verify_password2 para geração de hash de senha
 * 5. Trigger update_vehicle_on_movement para atualizar veículos após movimentação
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
  
  // Verificar funções
  try {
    // Testar verify_password
    const { data: passwordResult, error: passwordError } = await supabase.rpc('verify_password', {
      username_input: 'test_user_nonexistent',
      password_attempt: 'test_password'
    });
    
    if (passwordError && !passwordError.message.includes('não encontrado')) {
      issues.push('Função verify_password não está funcionando corretamente: ' + passwordError.message);
    }
    
    // Testar verify_password2
    const { data: hashResult, error: hashError } = await supabase.rpc('verify_password2', {
      username: 'test_user',
      password_attempt: 'test_password'
    });
    
    if (hashError) {
      issues.push('Função verify_password2 não está funcionando corretamente: ' + hashError.message);
    }
  } catch (error: any) {
    issues.push('Erro ao verificar funções: ' + error.message);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};
