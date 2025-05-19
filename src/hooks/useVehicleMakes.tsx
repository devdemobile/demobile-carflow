
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeService } from '@/services/vehicles/makeService';
import { VehicleMake } from '@/types';
import { toast } from 'sonner';

export function useVehicleMakes() {
  const queryClient = useQueryClient();
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [isAddMakeOpen, setIsAddMakeOpen] = useState(false);
  const [isEditMakeOpen, setIsEditMakeOpen] = useState(false);
  const [isDeleteMakeOpen, setIsDeleteMakeOpen] = useState(false);

  // Buscar todas as marcas
  const { 
    data: makes = [], 
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['vehicle-makes'],
    queryFn: () => makeService.getAllMakes()
  });

  // Criar nova marca
  const createMutation = useMutation({
    mutationFn: (name: string) => makeService.createMake(name),
    onSuccess: (newMake) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-makes'] });
      toast.success('Marca criada com sucesso');
      setIsAddMakeOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar marca: ${error.message}`);
    }
  });

  // Atualizar marca
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      makeService.updateMake(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-makes'] });
      toast.success('Marca atualizada com sucesso');
      setIsEditMakeOpen(false);
      setSelectedMake(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar marca: ${error.message}`);
    }
  });

  // Excluir marca
  const deleteMutation = useMutation({
    mutationFn: (id: string) => makeService.deleteMake(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-makes'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] });
      toast.success('Marca excluída com sucesso');
      setIsDeleteMakeOpen(false);
      setSelectedMake(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir marca: ${error.message}`);
    }
  });

  // Função para buscar marca por texto
  const findMakesByText = (searchText: string): VehicleMake[] => {
    if (!searchText) return makes;
    
    const normalizedSearch = searchText.trim().toLowerCase();
    return makes.filter(make => 
      make.name.toLowerCase().includes(normalizedSearch)
    );
  };

  // Funções auxiliares
  const openAddMake = () => setIsAddMakeOpen(true);
  const closeAddMake = () => setIsAddMakeOpen(false);
  
  const openEditMake = (make: VehicleMake) => {
    setSelectedMake(make);
    setIsEditMakeOpen(true);
  };
  
  const closeEditMake = () => {
    setIsEditMakeOpen(false);
    setSelectedMake(null);
  };
  
  const openDeleteMake = (make: VehicleMake) => {
    setSelectedMake(make);
    setIsDeleteMakeOpen(true);
  };
  
  const closeDeleteMake = () => {
    setIsDeleteMakeOpen(false);
    setSelectedMake(null);
  };

  // Função para criar marca com callback opcional
  const createMake = (
    name: string, 
    options?: { onSuccess?: (make: VehicleMake | null) => void }
  ) => {
    createMutation.mutate(name, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['vehicle-makes'] });
        toast.success('Marca criada com sucesso');
        setIsAddMakeOpen(false);
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      }
    });
  };

  return {
    makes,
    isLoading,
    isError,
    refetch,
    selectedMake,
    isAddMakeOpen,
    isEditMakeOpen,
    isDeleteMakeOpen,
    openAddMake,
    closeAddMake,
    openEditMake,
    closeEditMake,
    openDeleteMake,
    closeDeleteMake,
    createMake,
    updateMake: updateMutation.mutate,
    deleteMake: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    findMakesByText
  };
}
