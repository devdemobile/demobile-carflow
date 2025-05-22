
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
      toast.error(`${errorMessage}: ${error.message}`);
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
 * Cria uma função RPC no Supabase com parâmetros tipados
 * @param functionName Nome da função RPC no Supabase
 */
export async function callRPC<T, R>(
  functionName: string, 
  params: T, 
  errorMessage: string = `Erro ao chamar ${functionName}`
): Promise<R | null> {
  try {
    const { data, error } = await supabase.rpc(functionName, params as any);
    
    if (error) {
      console.error(`Erro ao chamar ${functionName}: ${error.message}`, error);
      toast.error(`${errorMessage}: ${error.message}`);
      return null;
    }
    
    return data as R;
  } catch (error: any) {
    console.error(`Exceção ao chamar ${functionName}: ${error.message}`, error);
    toast.error(`${errorMessage}`);
    return null;
  }
}
