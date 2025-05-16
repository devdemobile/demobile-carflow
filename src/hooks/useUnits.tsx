
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Unit } from '@/types';
import { fetchUnits, createUnit, updateUnit, deleteUnit } from '@/services/unitService';
import { useMediaQuery } from '@/hooks/use-mobile';

/**
 * Hook para gerenciar dados de unidades e operações com modo de visualização responsivo
 */
export const useUnits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Usar media query para determinar o modo de visualização padrão
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // Buscar unidades com React Query
  const { 
    data: allUnits = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      console.log('Buscando unidades...');
      const units = await fetchUnits();
      console.log('Unidades retornadas:', units);
      return units;
    },
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 30000 // 30 segundos
  });

  // Log para debug
  useEffect(() => {
    console.log('Estado atual de allUnits:', allUnits);
  }, [allUnits]);

  // Filtrar unidades pelo termo de busca
  const units = searchTerm 
    ? allUnits.filter(unit => {
        const term = searchTerm.toLowerCase();
        return unit.name.toLowerCase().includes(term) || 
               unit.code.toLowerCase().includes(term) || 
               (unit.address && unit.address.toLowerCase().includes(term));
      })
    : allUnits;

  // Adicionar uma nova unidade
  const addUnit = async (unitData: { name: string; code: string; address?: string }): Promise<Unit | null> => {
    console.log('Adicionando nova unidade:', unitData);
    const result = await createUnit(unitData);
    if (result) {
      await refetch();
    }
    return result;
  };

  // Atualizar uma unidade existente
  const handleUpdateUnit = async (id: string, unitData: { name: string; code: string; address?: string }): Promise<boolean> => {
    console.log('Atualizando unidade:', id, unitData);
    const success = await updateUnit(id, unitData);
    if (success) {
      await refetch();
    }
    return success;
  };

  // Excluir uma unidade
  const handleDeleteUnit = async (id: string): Promise<boolean> => {
    console.log('Excluindo unidade:', id);
    const success = await deleteUnit(id);
    if (success) {
      await refetch();
    }
    return success;
  };

  return {
    units,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    isDesktop,
    isLoading,
    isError,
    refetch,
    addUnit,
    updateUnit: handleUpdateUnit,
    deleteUnit: handleDeleteUnit
  };
};
