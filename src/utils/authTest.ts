
import { authService } from '@/services/auth/authService';
import { toast } from 'sonner';

/**
 * Função para testar a autenticação com credenciais de teste
 */
export const testAuthentication = async (): Promise<boolean> => {
  try {
    console.log('Iniciando teste de autenticação');
    const testCredentials = {
      username: 'admin',
      password: 'admin123'
    };
    
    console.log('Tentando login com credenciais de teste:', testCredentials.username);
    const userData = await authService.login(testCredentials);
    
    if (userData) {
      console.log('Teste de autenticação bem-sucedido:', userData);
      toast.success('Autenticação testada com sucesso!');
      return true;
    } else {
      console.error('Teste de autenticação falhou: usuário ou senha inválidos');
      toast.error('Teste de autenticação falhou: usuário ou senha inválidos');
      return false;
    }
  } catch (error: any) {
    console.error('Exceção no teste de autenticação:', error);
    toast.error(`Erro no teste de autenticação: ${error.message}`);
    return false;
  }
};

/**
 * Testa a função verify_password diretamente via callRPC
 */
export const testVerifyPasswordFunction = async (): Promise<void> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log('Testando função verify_password diretamente');
    const { data, error } = await supabase.rpc('verify_password', {
      username_input: 'admin',
      password_attempt: 'admin123'
    });
    
    if (error) {
      console.error('Erro ao testar verify_password:', error);
      toast.error(`Erro ao testar verify_password: ${error.message}`);
      return;
    }
    
    console.log('Resposta da função verify_password:', data);
    if (data) {
      toast.success('Função verify_password testada com sucesso!');
    } else {
      toast.warning('A função verify_password retornou nulo');
    }
  } catch (error: any) {
    console.error('Exceção ao testar verify_password:', error);
    toast.error(`Exceção ao testar verify_password: ${error.message}`);
  }
};
