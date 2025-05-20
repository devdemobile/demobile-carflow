
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
