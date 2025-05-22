
/**
 * Camada de abstração para o Supabase
 */
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Abstração para facilitar o tratamento de erros nas chamadas ao Supabase
 */
export async function handleSupabaseRequest<T>(
  requestFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
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
 * Tipos de funções RPC disponíveis
 */
export type RPCFunctionName = 'verify_password' | 'verify_password2' | 'count_vehicles_by_unit' | 'count_users_by_unit';

/**
 * Cria uma função RPC no Supabase com parâmetros tipados
 * @param functionName Nome da função RPC no Supabase
 */
export async function callRPC<T, R>(
  functionName: RPCFunctionName, 
  params: T, 
  errorMessage: string = `Erro ao chamar ${functionName}`
): Promise<R | null> {
  try {
    console.log(`Chamando função RPC: ${functionName} com parâmetros:`, params);
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
