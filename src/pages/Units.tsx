import React, { useState, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Map, 
  Users, 
  Car, 
  Trash2, 
  Pencil, 
  RefreshCcw,
  Calendar,
  Clock,
  User
} from 'lucide-react';
import { useUnits } from '@/hooks/useUnits';
import { UnitSkeleton } from '@/components/units/UnitSkeleton';
import UnitDialog from '@/components/units/UnitDialog';
import DeleteUnitDialog from '@/components/units/DeleteUnitDialog';
import { Unit } from '@/types';
import { UnitsTable } from '@/components/units/UnitsTable';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import ViewToggle from '@/components/ui/view-toggle';

const Units = () => {
  const { 
    units, 
    searchTerm, 
    setSearchTerm, 
    viewMode,
    setViewMode,
    isDesktop,
    isLoading, 
    isError,
    refetch,
    refreshUnits,
    addUnit, 
    updateUnit, 
    deleteUnit 
  } = useUnits();
  
  const { toast } = useToast();
  
  // State for dialogs
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handler for creating a new unit
  const handleCreateUnit = useCallback(() => {
    setSelectedUnit(null);
    setIsUnitDialogOpen(true);
  }, []);

  // Handler for editing a unit
  const handleEditUnit = useCallback((unit: Unit) => {
    setSelectedUnit(unit);
    setIsUnitDialogOpen(true);
    setIsDetailsDialogOpen(false); // Fechar diálogo de detalhes se estiver aberto
  }, []);

  // Handler for opening the delete confirmation dialog
  const handleDeleteClick = useCallback((unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteDialogOpen(true);
    setIsDetailsDialogOpen(false); // Fechar diálogo de detalhes se estiver aberto
  }, []);

  // Handle form submission (create or update)
  const handleUnitFormSubmit = async (formData: { name: string; code: string; address?: string }) => {
    setIsSaving(true);
    
    try {
      if (selectedUnit?.id) {
        // Update existing unit
        console.log('Atualizando unidade existente:', selectedUnit.id, formData);
        const success = await updateUnit(selectedUnit.id, formData);
        if (success) {
          setIsUnitDialogOpen(false);
          toast({
            title: "Sucesso",
            description: "Unidade atualizada com sucesso.",
          });
        }
      } else {
        // Create new unit
        console.log('Criando nova unidade:', formData);
        const newUnit = await addUnit(formData);
        if (newUnit) {
          setIsUnitDialogOpen(false);
          toast({
            title: "Sucesso",
            description: "Unidade criada com sucesso.",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar unidade:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a unidade.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle unit deletion
  const handleDeleteUnit = async () => {
    if (!selectedUnit) return;
    
    setIsDeleting(true);
    
    try {
      console.log('Excluindo unidade:', selectedUnit.id);
      const success = await deleteUnit(selectedUnit.id);
      if (success) {
        setIsDeleteDialogOpen(false);
        toast({
          title: "Sucesso",
          description: "Unidade excluída com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir unidade:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a unidade.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler for viewing unit details
  const handleViewDetails = useCallback((unit: Unit) => {
    setSelectedUnit(unit);
    setIsDetailsDialogOpen(true);
  }, []);

  // Handler for forcing a refresh
  const handleForceRefresh = useCallback(async () => {
    console.log("Forçando atualização dos dados...");
    try {
      await refreshUnits();
      toast({
        title: "Dados atualizados",
        description: "Os dados foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar os dados.",
        variant: "destructive"
      });
    }
  }, [refreshUnits, toast]);

  // Show error message if failed to load units
  if (isError) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col items-center justify-center h-64">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Erro ao carregar unidades</h1>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold flex items-center">
            Unidades
            <Button 
              variant="ghost" 
              size="icon"
              className="ml-2" 
              onClick={handleForceRefresh}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-8 max-w-[300px]"
                placeholder="Buscar unidade..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateUnit}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Unidade
            </Button>
            
            {isDesktop && (
              <ViewToggle
                viewMode={viewMode}
                onViewChange={setViewMode}
              />
            )}
          </div>
        </div>

        {isLoading ? (
          // Show loading skeletons while data is loading
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <UnitSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : units.length > 0 ? (
          viewMode === 'grid' ? (
            // Grid view
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {units.map((unit) => (
                <Card 
                  key={unit.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleViewDetails(unit)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{unit.name}</span>
                      <span className="text-sm bg-muted px-2 py-1 rounded">{unit.code}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <Map className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <span className="text-sm">{unit.address || 'Endereço não cadastrado'}</span>
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{unit.vehicleCount} veículos</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{unit.usersCount} usuários</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between space-x-2 pt-0">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation(); // Previne que o evento de clique propague para o card
                        handleDeleteClick(unit);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation(); // Previne que o evento de clique propague para o card
                        handleEditUnit(unit);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            // Table view
            <UnitsTable 
              units={units} 
              onEdit={handleEditUnit} 
              onDelete={handleDeleteClick}
              onViewDetails={handleViewDetails}
            />
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma unidade encontrada</p>
            <Button variant="outline" className="mt-4" onClick={handleCreateUnit}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar unidade
            </Button>
          </div>
        )}
      </div>

      {/* Unit Create/Edit Dialog */}
      <UnitDialog
        isOpen={isUnitDialogOpen}
        onClose={() => setIsUnitDialogOpen(false)}
        onSubmit={handleUnitFormSubmit}
        unit={selectedUnit || undefined}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteUnitDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteUnit}
        isLoading={isDeleting}
      />

      {/* Unit Details Dialog */}
      {selectedUnit && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedUnit.name}</span>
                <span className="text-sm bg-muted px-2 py-1 rounded">{selectedUnit.code}</span>
              </DialogTitle>
              <DialogDescription>
                Detalhes da unidade e opções de gerenciamento
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-start">
                <Map className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <span>{selectedUnit.address || 'Endereço não cadastrado'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center p-3 border rounded-md">
                  <Car className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Veículos</p>
                    <p className="font-semibold">{selectedUnit.vehicleCount}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 border rounded-md">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Usuários</p>
                    <p className="font-semibold">{selectedUnit.usersCount}</p>
                  </div>
                </div>
              </div>
              
              {selectedUnit.createdAt && (
                <div className="flex items-center border-t pt-4">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Criada em: {format(new Date(selectedUnit.createdAt), 'dd/MM/yyyy')}</span>
                </div>
              )}
              
              {selectedUnit.updatedAt && selectedUnit.updatedAt !== selectedUnit.createdAt && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Atualizada em: {format(new Date(selectedUnit.updatedAt), 'dd/MM/yyyy')}</span>
                </div>
              )}
              
              {selectedUnit.createdBy && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Criada por: {selectedUnit.createdBy}</span>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                size="sm"
                className="mr-auto"
                onClick={() => setIsDetailsDialogOpen(false)}
              >
                Fechar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => {
                  setIsDetailsDialogOpen(false);
                  handleDeleteClick(selectedUnit);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsDetailsDialogOpen(false);
                  handleEditUnit(selectedUnit);
                }}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default Units;
