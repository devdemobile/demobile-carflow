
import { authService } from '@/services/auth/authService';
import { toast } from 'sonner';
import { callRPC } from '@/services/api/supabase';

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
    console.log('Testando função verify_password diretamente via callRPC');
    
    const userId = await callRPC<
      { username_input: string, password_attempt: string },
      string
    >('verify_password', {
      username_input: 'admin',
      password_attempt: 'admin123'
    }, 'Erro ao testar verify_password');
    
    console.log('Resposta da função verify_password:', userId);
    
    if (userId) {
      toast.success(`Função verify_password testada com sucesso! User ID: ${userId}`);
    } else {
      toast.warning('A função verify_password retornou nulo - verificar credenciais');
    }
  } catch (error: any) {
    console.error('Exceção ao testar verify_password:', error);
    toast.error(`Exceção ao testar verify_password: ${error.message}`);
  }
};
