/**
 * Repositório para autenticação
 */
import { supabase } from '@/integrations/supabase/client';
import { LoginCredentials, SystemUser } from '@/types';
import { handleSupabaseRequest } from '@/services/api/supabase';

/**
 * Interface para o repositório de autenticação
 */
export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<string | null>;
  getUserData(userId: string): Promise<SystemUser | null>;
}

/**
 * Implementação do repositório de autenticação
 */
export class AuthRepository implements IAuthRepository {
  /**
   * Realiza login com credenciais
   * Este método usa apenas a API verify_password do Supabase
   */
  async login(credentials: LoginCredentials): Promise<string | null> {
    try {
      console.log("Iniciando processo de login para", credentials.username);
      
      // Verificar se as credenciais são válidas usando a função RPC
      console.log("Verificando credenciais com RPC verify_password...");
      const userId = await handleSupabaseRequest(
        async () => await supabase.rpc('verify_password', {
          username: credentials.username,
          password_attempt: credentials.password
        }),
        'Erro ao validar credenciais'
      );
      
      if (!userId) {
        console.log("Credenciais inválidas ou erro na verificação");
        return null;
      }
      
      console.log("Credenciais válidas para o usuário ID:", userId);
      return userId;
    } catch (error) {
      console.error("Exceção no processo de login:", error);
      return null;
    }
  }

  /**
   * Busca os dados do usuário pelo ID
   */
  async getUserData(userId: string): Promise<SystemUser | null> {
    try {
      const { data, error } = await supabase
        .from('system_users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Exceção ao buscar dados do usuário:", error);
      return null;
    }
  }
}

/**
 * Instância singleton do repositório
 */
export const authRepository = new AuthRepository();
