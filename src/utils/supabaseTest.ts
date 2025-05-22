
import { supabase } from '@/integrations/supabase/client';

/**
 * Runs a test to verify connection with Supabase
 */
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Try a simple query to verify connection
    const { data, error } = await supabase
      .from('system_users')
      .select('count')
      .limit(1);
      
    if (error) {
      return {
        success: false,
        message: `Erro ao conectar com o Supabase: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Conexão com Supabase estabelecida com sucesso'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Exceção ao tentar conectar com o Supabase: ${error.message}`
    };
  }
};

/**
 * Verifies if the database has all required triggers
 */
export const verifyDatabaseTriggers = async (): Promise<{ success: boolean; missingTriggers: string[] }> => {
  const requiredTriggers = [
    'update_vehicle_on_movement',
    'on_auth_user_created'
  ];
  
  const missingTriggers: string[] = [];
  
  try {
    for (const triggerName of requiredTriggers) {
      const { data, error } = await supabase.rpc('check_trigger_exists', { trigger_name: triggerName });
      
      if (error || !data) {
        missingTriggers.push(triggerName);
      }
    }
    
    return {
      success: missingTriggers.length === 0,
      missingTriggers
    };
  } catch (error) {
    return {
      success: false,
      missingTriggers: requiredTriggers
    };
  }
};
