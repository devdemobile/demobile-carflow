
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelService } from '@/services/vehicles/modelService';
import { VehicleModel } from '@/types';
import { toast } from 'sonner';

export function useVehicleModels(makeId?: string) {
  const queryClient = useQueryClient();
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [isEditModelOpen, setIsEditModelOpen] = useState(false);
  const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);

  // Buscar todos os modelos ou modelos de uma marca específica
  const { 
    data: models = [], 
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: makeId ? ['vehicle-models', makeId] : ['vehicle-models'],
    queryFn: () => makeId 
      ? modelService.getModelsByMake(makeId)
      : modelService.getAllModels()
  });

  // Criar novo modelo
  const createMutation = useMutation({
    mutationFn: (data: { name: string; makeId: string }) => 
      modelService.createModel(data.name, data.makeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] });
      if (makeId) {
        queryClient.invalidateQueries({ queryKey: ['vehicle-models', makeId] });
      }
      toast.success('Modelo criado com sucesso');
      setIsAddModelOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar modelo: ${error.message}`);
    }
  });

  // Atualizar modelo
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; name?: string; makeId?: string }) => 
      modelService.updateModel(data.id, { name: data.name, makeId: data.makeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] });
      if (makeId) {
        queryClient.invalidateQueries({ queryKey: ['vehicle-models', makeId] });
      }
      toast.success('Modelo atualizado com sucesso');
      setIsEditModelOpen(false);
      setSelectedModel(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar modelo: ${error.message}`);
    }
  });

  // Excluir modelo
  const deleteMutation = useMutation({
    mutationFn: (id: string) => modelService.deleteModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] });
      if (makeId) {
        queryClient.invalidateQueries({ queryKey: ['vehicle-models', makeId] });
      }
      toast.success('Modelo excluído com sucesso');
      setIsDeleteModelOpen(false);
      setSelectedModel(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir modelo: ${error.message}`);
    }
  });

  // Funções auxiliares
  const openAddModel = () => setIsAddModelOpen(true);
  const closeAddModel = () => setIsAddModelOpen(false);
  
  const openEditModel = (model: VehicleModel) => {
    setSelectedModel(model);
    setIsEditModelOpen(true);
  };
  
  const closeEditModel = () => {
    setIsEditModelOpen(false);
    setSelectedModel(null);
  };
  
  const openDeleteModel = (model: VehicleModel) => {
    setSelectedModel(model);
    setIsDeleteModelOpen(true);
  };
  
  const closeDeleteModel = () => {
    setIsDeleteModelOpen(false);
    setSelectedModel(null);
  };

  return {
    models,
    isLoading,
    isError,
    refetch,
    selectedModel,
    isAddModelOpen,
    isEditModelOpen,
    isDeleteModelOpen,
    openAddModel,
    closeAddModel,
    openEditModel,
    closeEditModel,
    openDeleteModel,
    closeDeleteModel,
    createModel: createMutation.mutate,
    updateModel: updateMutation.mutate,
    deleteModel: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}
