
/**
 * Camada de abstração para o Supabase
 */
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Abstração para facilitar o tratamento de erros nas chamadas ao Supabase
 */
export async function handleSupabaseRequest<T>(
  requestFn: () => Promise<{ data: T | null; error: any }>,
  errorMessage: string = 'Ocorreu um erro na operação'
): Promise<T | null> {
  try {
    const { data, error } = await requestFn();
    
    if (error) {
      console.error(`Erro na chamada ao Supabase: ${error.message}`, error);
      if (error.code === 'PGRST301' || error.code === '42501') {
        toast.error('Permissão negada: você precisa estar autenticado ou não tem permissão para esta operação');
      } else {
        toast.error(`${errorMessage}: ${error.message}`);
      }
      return null;
    }
    
    return data;
  } catch (error: any) {
    console.error(`Exceção no processamento da solicitação: ${error.message}`, error);
    toast.error(`${errorMessage}`);
    return null;
  }
}

/**
 * Verifica o status da conexão com o Supabase
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Primeiro verifica se o usuário está autenticado
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Status da sessão:', sessionData.session ? 'Autenticado' : 'Não autenticado');
    
    // Tenta fazer uma chamada simples para verificar a conexão
    const { error } = await supabase.from('units').select('id').limit(1);
    
    if (error) {
      console.error("Erro na conexão com o Supabase:", error);
      if (error.code === 'PGRST301') {
        toast.error("Você precisa estar autenticado para acessar os dados");
      }
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exceção ao verificar conexão com o Supabase:", error);
    return false;
  }
}

/**
 * Registra um erro de operação com o Supabase
 */
export function logSupabaseError(operation: string, error: any): void {
  console.error(`Erro em ${operation}:`, error);
  // Aqui poderíamos implementar uma lógica para enviar erros para um serviço de monitoramento
}
