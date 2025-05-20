
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
  signInWithSupabase(credentials: LoginCredentials): Promise<{ userId: string | null, error: any }>;
}

/**
 * Implementação do repositório de autenticação
 */
export class AuthRepository implements IAuthRepository {
  /**
   * Realiza login com credenciais
   * Este método usa a API verify_password do Supabase e em seguida autentica com o supabase.auth
   */
  async login(credentials: LoginCredentials): Promise<string | null> {
    try {
      console.log("Iniciando processo de login para", credentials.username);
      
      // 1. Primeiro verificamos se as credenciais são válidas usando a função RPC
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
      
      // 2. Buscar informações do usuário para obter email
      const { data: userData, error: userError } = await supabase
        .from('system_users')
        .select('email, username')
        .eq('id', userId)
        .single();
      
      if (userError || !userData) {
        console.error("Erro ao buscar dados do usuário:", userError);
        return null;
      }
      
      // 3. Verificar se já existe sessão ativa
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        console.log("Já existe uma sessão ativa");
        return userId;
      }
      
      // 4. Agora que confirmamos que as credenciais são válidas, podemos autenticar com o Supabase Auth
      const email = userData.email || `${userData.username || credentials.username}@example.com`;
      
      console.log("Tentando autenticação com Supabase Auth usando email:", email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: credentials.password
      });
      
      if (authError) {
        console.error("Erro na autenticação com Supabase Auth:", authError);
        
        // Se o erro for de credenciais inválidas, tentar criar um usuário
        if (authError.message.includes("Invalid login credentials")) {
          console.log("Tentando criar usuário no Supabase Auth...");
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: credentials.password,
            options: {
              data: {
                username: userData.username || credentials.username,
                system_user_id: userId
              }
            }
          });
          
          if (signUpError) {
            console.error("Erro ao criar usuário no Supabase Auth:", signUpError);
            return null;
          }
          
          console.log("Usuário criado com sucesso no Supabase Auth");
          
          // Tentar login novamente após criar o usuário
          const { data: retryAuth, error: retryError } = await supabase.auth.signInWithPassword({
            email: email,
            password: credentials.password
          });
          
          if (retryError) {
            console.error("Erro no segundo login após criar usuário:", retryError);
            return null;
          }
          
          console.log("Login bem-sucedido após criar usuário");
        } else {
          return null;
        }
      }
      
      // Sucesso na autenticação com Supabase Auth
      console.log("Autenticação bem-sucedida com Supabase Auth");
      return userId;
    } catch (error) {
      console.error("Exceção no processo de login:", error);
      return null;
    }
  }

  /**
   * Método alternativo de login que usa diretamente o supabase.auth
   * Útil para sistemas que usam apenas o auth do Supabase
   */
  async signInWithSupabase(credentials: LoginCredentials): Promise<{ userId: string | null, error: any }> {
    try {
      console.log("Tentando login direto com Supabase Auth");
      
      // Verificar se o username é um email
      const isEmail = credentials.username.includes('@');
      const email = isEmail ? credentials.username : `${credentials.username}@example.com`;
      
      console.log("Usando email para login:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: credentials.password
      });
      
      if (error) {
        console.error("Erro no login direto com Supabase Auth:", error);
        return { userId: null, error };
      }
      
      console.log("Login direto bem-sucedido:", data.user?.id);
      return { userId: data.user?.id || null, error: null };
    } catch (error) {
      console.error("Exceção no login direto:", error);
      return { userId: null, error };
    }
  }

  /**
   * Busca dados do usuário pelo ID
   */
  async getUserData(userId: string): Promise<SystemUser | null> {
    console.log("Buscando dados do usuário:", userId);
    
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .select('*, units(name), system_user_permissions(*)')
        .eq('id', userId)
        .single(),
      'Erro ao buscar dados do usuário'
    );
    
    if (!data) {
      console.log("Nenhum dado de usuário encontrado para o ID:", userId);
      return null;
    }
    
    console.log("Dados do usuário encontrados:", data);
    
    // Mapear permissões
    const permissions = data.system_user_permissions?.[0] 
      ? {
        canViewVehicles: data.system_user_permissions[0].can_view_vehicles,
        canEditVehicles: data.system_user_permissions[0].can_edit_vehicles,
        canViewUnits: data.system_user_permissions[0].can_view_units,
        canEditUnits: data.system_user_permissions[0].can_edit_units,
        canViewUsers: data.system_user_permissions[0].can_view_users,
        canEditUsers: data.system_user_permissions[0].can_edit_users,
        canViewMovements: data.system_user_permissions[0].can_view_movements,
        canEditMovements: data.system_user_permissions[0].can_edit_movements
      }
      : {
        canViewVehicles: false,
        canEditVehicles: false,
        canViewUnits: false,
        canEditUnits: false,
        canViewUsers: false,
        canEditUsers: false,
        canViewMovements: true,
        canEditMovements: false
      };
      
    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
      shift: data.shift,
      status: data.status,
      unitId: data.unit_id,
      unitName: data.units?.name,
      permissions
    };
  }
}

/**
 * Instância singleton do repositório
 */
export const authRepository = new AuthRepository();
