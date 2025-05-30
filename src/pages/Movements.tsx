
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useMovements } from '@/hooks/useMovements';
import { Movement } from '@/types';
import MovementsTable from '@/components/movements/MovementsTable';
import MovementCard from '@/components/movements/MovementCard';
import MovementsFilter from '@/components/movements/MovementsFilter';
import MovementEditDialog from '@/components/movements/MovementEditDialog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-mobile';
import { movementService } from '@/services/movements/movementService';

const Movements = () => {
  const { movements, isLoading, refetch } = useMovements();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user, userPermissions } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Redirecionar se o usuário não tem permissão
  if (userPermissions && !userPermissions.canViewMovements) {
    toast.error('Você não tem permissão para visualizar movimentações');
    return <Navigate to="/" />;
  }
  
  // Filtrar movimentações por busca e status (filtros locais)
  const filteredMovements = movements.filter(movement => {
    const matchesSearch = 
      (movement.vehiclePlate || movement.plate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movement.driver || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? movement.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleMovementClick = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (updatedMovement: Movement) => {
    try {
      await movementService.updateMovement(updatedMovement.id, updatedMovement);
      toast.success('Movimentação atualizada com sucesso');
      await refetch();
    } catch (error) {
      console.error('Erro ao atualizar movimentação:', error);
      toast.error('Erro ao atualizar movimentação');
    }
  };
  
  const handleDelete = async (movement: Movement, password: string) => {
    try {
      await movementService.deleteMovement(movement.id);
      toast.success('Movimentação excluída com sucesso');
      await refetch();
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
      toast.error('Erro ao excluir movimentação');
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6 pb-24 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Movimentações</h1>
        </div>
        
        <MovementsFilter
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onReset={() => {
            setSearchTerm('');
            setStatusFilter(null);
          }}
          showViewToggle={!isMobile}
        />
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-48 bg-muted rounded-lg animate-pulse" />
              ))
            ) : filteredMovements.length > 0 ? (
              filteredMovements.map((movement) => (
                <MovementCard
                  key={movement.id}
                  movement={movement}
                  onClick={handleMovementClick}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma movimentação encontrada com os filtros aplicados.
                </p>
              </div>
            )}
          </div>
        ) : (
          <MovementsTable
            movements={filteredMovements}
            isLoading={isLoading}
            onRowClick={handleMovementClick}
          />
        )}
        
        {/* Dialog para edição de movimentação */}
        <MovementEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          movement={selectedMovement}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onSaved={refetch}
        />
      </div>
    </Layout>
  );
};

export default Movements;
