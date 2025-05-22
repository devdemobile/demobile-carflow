
import { supabase } from '@/integrations/supabase/client';
import { SystemUser } from '@/types/entities';
import { LoginCredentials } from '@/types/dto';
import { toast } from 'sonner';
import { callRPC } from '../api/supabase';

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
   * Realiza autenticação com credenciais
   * @returns ID do usuário se autenticação bem-sucedida, null caso contrário
   */
  async login(credentials: LoginCredentials): Promise<string | null> {
    const { username, password } = credentials;
    
    try {
      console.log('Verificando credenciais:', { username });
      
      const userId = await callRPC<
        { username_input: string, password_attempt: string },
        string
      >('verify_password', 
        { username_input: username, password_attempt: password }, 
        'Falha na autenticação'
      );
      
      if (!userId) {
        console.error('Autenticação falhou: usuário não encontrado ou senha inválida');
        return null;
      }
      
      console.log('Autenticação bem-sucedida para o usuário:', userId);
      return userId;
    } catch (error: any) {
      console.error('Erro ao verificar credenciais:', error);
      toast.error('Erro ao verificar credenciais');
      return null;
    }
  }
  
  /**
   * Busca dados do usuário pelo ID
   */
  async getUserData(userId: string): Promise<SystemUser | null> {
    try {
      const { data: userData, error } = await supabase
        .from('system_users')
        .select('*, units(name)')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        toast.error('Erro ao buscar dados do usuário');
        return null;
      }
      
      if (!userData) {
        toast.error('Usuário não encontrado');
        return null;
      }
      
      // Mapear para objeto SystemUser
      return {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email || undefined,
        role: userData.role,
        shift: userData.shift,
        status: userData.status,
        unitId: userData.unit_id,
        unitName: userData.units?.name,
      };
    } catch (error: any) {
      console.error('Exceção ao buscar dados do usuário:', error);
      toast.error('Erro ao buscar dados do usuário');
      return null;
    }
  }
}

/**
 * Instância singleton do repositório
 */
export const authRepository = new AuthRepository();
