
/**
 * Serviço para gerenciar unidades
 */
import { toast } from 'sonner';
import { Unit, UnitDTO } from '@/types';
import * as unitRepository from './unitRepository';

/**
 * Busca todas as unidades com contagens
 */
export const fetchUnits = async (): Promise<Unit[]> => {
  try {
    // Buscar unidades básicas
    const units = await unitRepository.fetchUnits();
    
    // Se não há unidades, retornar lista vazia
    if (units.length === 0) {
      return [];
    }
    
    // Buscar contagens de veículos
    try {
      const vehicleCounts = await unitRepository.fetchVehicleCountByUnit();
      
      // Atualizar as unidades com as contagens de veículos
      Object.entries(vehicleCounts).forEach(([unitId, count]) => {
        const unit = units.find(u => u.id === unitId);
        if (unit) {
          unit.vehicleCount = count;
        }
      });
    } catch (error) {
      console.error('Erro ao buscar contagens de veículos:', error);
    }
    
    // Buscar contagens de usuários
    try {
      const userCounts = await unitRepository.fetchUserCountByUnit();
      
      // Atualizar as unidades com as contagens de usuários
      Object.entries(userCounts).forEach(([unitId, count]) => {
        const unit = units.find(u => u.id === unitId);
        if (unit) {
          unit.usersCount = count;
        }
      });
    } catch (error) {
      console.error('Erro ao buscar contagens de usuários:', error);
    }
    
    return units;
  } catch (error) {
    console.error('Erro em fetchUnits:', error);
    toast.error('Erro ao carregar dados das unidades');
    return [];
  }
};

/**
 * Cria uma nova unidade
 */
export const createUnit = async (unitData: UnitDTO): Promise<Unit | null> => {
  const newUnit = await unitRepository.createUnit(unitData);
  
  if (newUnit) {
    toast.success('Unidade adicionada com sucesso');
  }
  
  return newUnit;
};

/**
 * Atualiza uma unidade existente
 */
export const updateUnit = async (id: string, unitData: UnitDTO): Promise<boolean> => {
  const success = await unitRepository.updateUnit(id, unitData);
  
  if (success) {
    toast.success('Unidade atualizada com sucesso');
  }
  
  return success;
};

/**
 * Exclui uma unidade se não tiver dependências
 */
export const deleteUnit = async (id: string): Promise<boolean> => {
  // Verificar se pode excluir
  const { canDelete, vehicleCount, usersCount } = await unitRepository.canDeleteUnit(id);
  
  if (!canDelete) {
    if (vehicleCount && vehicleCount > 0) {
      toast.error(`Não é possível excluir esta unidade: ela possui ${vehicleCount} veículos associados`);
    }
    
    if (usersCount && usersCount > 0) {
      toast.error(`Não é possível excluir esta unidade: ela possui ${usersCount} usuários associados`);
    }
    
    return false;
  }
  
  // Excluir unidade
  const success = await unitRepository.deleteUnit(id);
  
  if (success) {
    toast.success('Unidade excluída com sucesso');
  }
  
  return success;
};
