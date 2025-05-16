
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMovements } from '@/hooks/useMovements';
import MovementsTable from '@/components/movements/MovementsTable';
import MovementsFilter from '@/components/movements/MovementsFilter';
import MovementCard from '@/components/movements/MovementCard';
import { Movement } from '@/types';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Grid, List, Loader2 } from 'lucide-react';
import MovementEditDialog from '@/components/movements/MovementEditDialog';
import { movementService } from '@/services/movements/movementService';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth/authService';
import { movementLogService } from '@/services/movements/movementLogService';

const Movements = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const {
    movements,
    isLoading,
    error,
    page,
    setPage,
    totalPages,
    filters,
    handleFilterChange,
    resetFilters,
    refetch
  } = useMovements();

  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(isMobile ? 'grid' : 'table');

  const handleMovementClick = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMovement = async (updatedMovement: Movement) => {
    try {
      // This is a simple update without backend validation
      // For real implementation, you would call an API to update the movement
      const result = await movementService.updateMovement(updatedMovement.id, updatedMovement);
      
      if (result) {
        // Log the edit action
        if (user) {
          await movementLogService.createLog({
            movementId: updatedMovement.id,
            userId: user.id,
            actionType: 'edit',
            actionDetails: JSON.stringify({
              before: selectedMovement,
              after: updatedMovement
            })
          });
        }
        
        refetch();
      }
    } catch (error: any) {
      toast.error(`Erro ao atualizar movimentação: ${error.message}`);
      throw error;
    }
  };
  
  const handleDeleteMovement = async (movement: Movement, password: string) => {
    try {
      // First verify the password
      if (!user) throw new Error('Usuário não autenticado');
      
      const isValid = await authService.verifyPassword(user.username, password);
      
      if (!isValid) {
        throw new Error('Senha incorreta');
      }
      
      // Delete the movement
      const result = await movementService.deleteMovement(movement.id);
      
      if (result) {
        // Log the delete action
        await movementLogService.createLog({
          movementId: movement.id,
          userId: user.id,
          actionType: 'delete',
          actionDetails: JSON.stringify(movement)
        });
        
        refetch();
      }
    } catch (error: any) {
      toast.error(`Erro ao excluir movimentação: ${error.message}`);
      throw error;
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={page === i}
              onClick={() => setPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink 
            isActive={page === 1}
            onClick={() => setPage(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Calculate the start and end page numbers
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(totalPages - 1, page + 1);
      
      if (page <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      } else if (page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Add page numbers in the middle
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={page === i}
              onClick={() => setPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Show last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            isActive={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">Movimentações</h1>
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            Erro ao carregar movimentações. Tente novamente mais tarde.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Movimentações</h1>
          
          {/* View Selector */}
          {!isMobile && (
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <MovementsFilter 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onReset={resetFilters} 
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {(isMobile || viewMode === 'grid') ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {movements.length === 0 ? (
                  <div className="text-center p-4 bg-background border rounded-md text-muted-foreground col-span-full">
                    Nenhuma movimentação encontrada
                  </div>
                ) : (
                  movements.map((movement) => (
                    <MovementCard 
                      key={movement.id} 
                      movement={movement} 
                      onClick={() => handleMovementClick(movement)}
                    />
                  ))
                )}
              </div>
            ) : (
              <MovementsTable 
                movements={movements} 
                onRowClick={handleMovementClick}
              />
            )}
            
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(Math.max(1, page - 1))}
                      aria-disabled={page === 1}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      aria-disabled={page === totalPages}
                      className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
      
      {/* Movement Edit Dialog */}
      <MovementEditDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        movement={selectedMovement}
        onUpdate={handleUpdateMovement}
        onDelete={handleDeleteMovement}
      />
    </Layout>
  );
};

export default Movements;
