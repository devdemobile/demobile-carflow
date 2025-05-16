
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Unit } from '@/types';

/**
 * Fetch all units from Supabase
 */
export const fetchUnits = async (): Promise<Unit[]> => {
  try {
    console.log('Iniciando fetchUnits...');
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar unidades:', error);
      toast.error('Erro ao carregar unidades');
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('Nenhuma unidade encontrada');
      return [];
    }

    console.log('Unidades encontradas:', data.length);

    // Transformamos os dados para o formato Unit sem operações assíncronas adicionais
    const units: Unit[] = data.map(unit => ({
      id: unit.id,
      name: unit.name,
      code: unit.code,
      address: unit.address || '',
      vehicleCount: 0, // Inicializamos com 0, atualizaremos depois se necessário
      usersCount: 0    // Inicializamos com 0, atualizaremos depois se necessário
    }));

    // Agora carregamos as contagens em uma única operação por tipo
    try {
      // Obter contagem de veículos por unidade - método corrigido
      const { data: vehicleCounts, error: vehicleError } = await supabase
        .from('vehicles')
        .select('unit_id, count')
        .select('unit_id, count(*)');
      
      if (vehicleError) {
        console.error('Erro ao contar veículos:', vehicleError);
      } else if (vehicleCounts) {
        vehicleCounts.forEach(item => {
          const unit = units.find(u => u.id === item.unit_id);
          if (unit) {
            unit.vehicleCount = item.count;
          }
        });
      }
      
      // Obter contagem de usuários por unidade - método corrigido
      const { data: userCounts, error: userError } = await supabase
        .from('system_users')
        .select('unit_id, count')
        .select('unit_id, count(*)');
      
      if (userError) {
        console.error('Erro ao contar usuários:', userError);
      } else if (userCounts) {
        userCounts.forEach(item => {
          const unit = units.find(u => u.id === item.unit_id);
          if (unit) {
            unit.usersCount = item.count;
          }
        });
      }
    } catch (countError) {
      console.error('Erro ao contar itens relacionados:', countError);
      // Continuamos mesmo com erro nas contagens, só não teremos os números exatos
    }

    return units;
  } catch (error) {
    console.error('Erro em fetchUnits:', error);
    toast.error('Erro ao carregar dados das unidades');
    return [];
  }
};

/**
 * Create a new unit
 */
export const createUnit = async (unitData: { name: string; code: string; address?: string }): Promise<Unit | null> => {
  try {
    console.log('Criando unidade:', unitData);
    
    const { data, error } = await supabase
      .from('units')
      .insert([{ 
        name: unitData.name,
        code: unitData.code,
        address: unitData.address || '' 
      }])
      .select();
    
    if (error) {
      console.error('Erro ao adicionar unidade:', error);
      toast.error(`Erro ao adicionar unidade: ${error.message}`);
      return null;
    }
    
    if (!data || data.length === 0) {
      toast.error('Erro ao adicionar unidade: nenhum dado retornado');
      return null;
    }
    
    toast.success('Unidade adicionada com sucesso');
    
    // Retornar a nova unidade com contagens inicializadas em 0
    return {
      id: data[0].id,
      name: data[0].name,
      code: data[0].code,
      address: data[0].address || '',
      vehicleCount: 0,
      usersCount: 0
    };
  } catch (error) {
    console.error('Erro em addUnit:', error);
    toast.error('Erro ao adicionar unidade');
    return null;
  }
};

/**
 * Update an existing unit
 */
export const updateUnit = async (id: string, unitData: { name: string; code: string; address?: string }): Promise<boolean> => {
  try {
    console.log('Atualizando unidade:', id, unitData);
    
    const { error } = await supabase
      .from('units')
      .update({ 
        name: unitData.name,
        code: unitData.code,
        address: unitData.address || '' 
      })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar unidade:', error);
      toast.error(`Erro ao atualizar unidade: ${error.message}`);
      return false;
    }
    
    toast.success('Unidade atualizada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro em updateUnit:', error);
    toast.error('Erro ao atualizar unidade');
    return false;
  }
};

/**
 * Delete a unit if it has no dependencies
 */
export const deleteUnit = async (id: string): Promise<boolean> => {
  try {
    console.log('Excluindo unidade:', id);
    
    // Verificar se há veículos associados
    const { count: vehicleCount, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id);
    
    if (vehicleError) {
      console.error('Erro ao verificar veículos:', vehicleError);
      toast.error('Erro ao verificar veículos associados');
      return false;
    }
    
    if (vehicleCount && vehicleCount > 0) {
      toast.error(`Não é possível excluir esta unidade: ela possui ${vehicleCount} veículos associados`);
      return false;
    }
    
    // Verificar se há usuários associados
    const { count: usersCount, error: usersError } = await supabase
      .from('system_users')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id);
    
    if (usersError) {
      console.error('Erro ao verificar usuários:', usersError);
      toast.error('Erro ao verificar usuários associados');
      return false;
    }
    
    if (usersCount && usersCount > 0) {
      toast.error(`Não é possível excluir esta unidade: ela possui ${usersCount} usuários associados`);
      return false;
    }
    
    // Excluir a unidade
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir unidade:', error);
      toast.error(`Erro ao excluir unidade: ${error.message}`);
      return false;
    }
    
    toast.success('Unidade excluída com sucesso');
    return true;
  } catch (error) {
    console.error('Erro em deleteUnit:', error);
    toast.error('Erro ao excluir unidade');
    return false;
  }
};
