
/**
 * Serviço para registros de logs de movimentações
 */
import { MovementLog, LogActionType } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export interface IMovementLogService {
  createLog(log: Partial<MovementLog>): Promise<MovementLog | null>;
  getLogsByMovement(movementId: string): Promise<MovementLog[]>;
  getAllLogs(): Promise<MovementLog[]>;
}

export class MovementLogService implements IMovementLogService {
  /**
   * Cria um novo registro de log
   */
  async createLog(log: Partial<MovementLog>): Promise<MovementLog | null> {
    try {
      const { data, error } = await supabase
        .from('movement_logs')
        .insert({
          movement_id: log.movementId,
          user_id: log.userId,
          action_type: log.actionType,
          action_details: log.actionDetails
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      if (!data) return null;
      
      return {
        id: data.id,
        movementId: data.movement_id,
        userId: data.user_id,
        userName: data.user_name || '',
        actionType: data.action_type as LogActionType,
        actionDetails: data.action_details,
        createdAt: data.created_at
      };
    } catch (error: any) {
      console.error('Erro ao criar log de movimento:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os logs de uma movimentação
   */
  async getLogsByMovement(movementId: string): Promise<MovementLog[]> {
    try {
      const { data, error } = await supabase
        .from('movement_logs')
        .select(`
          id, 
          movement_id, 
          user_id, 
          system_users(name), 
          action_type, 
          action_details, 
          created_at
        `)
        .eq('movement_id', movementId)
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      if (!data) return [];
      
      return data.map(item => ({
        id: item.id,
        movementId: item.movement_id,
        userId: item.user_id,
        userName: item.system_users?.name || '',
        actionType: item.action_type as LogActionType,
        actionDetails: item.action_details,
        createdAt: item.created_at
      }));
    } catch (error: any) {
      console.error('Erro ao buscar logs de movimento:', error);
      return [];
    }
  }

  /**
   * Obtém todos os logs de movimentações
   */
  async getAllLogs(): Promise<MovementLog[]> {
    try {
      const { data, error } = await supabase
        .from('movement_logs')
        .select(`
          id, 
          movement_id, 
          user_id, 
          system_users(name), 
          action_type, 
          action_details, 
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      if (!data) return [];
      
      return data.map(item => ({
        id: item.id,
        movementId: item.movement_id,
        userId: item.user_id,
        userName: item.system_users?.name || '',
        actionType: item.action_type as LogActionType,
        actionDetails: item.action_details,
        createdAt: item.created_at
      }));
    } catch (error: any) {
      console.error('Erro ao buscar logs de movimentos:', error);
      return [];
    }
  }
}

export const movementLogService = new MovementLogService();
