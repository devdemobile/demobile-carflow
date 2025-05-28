
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Movement } from '@/types';
import MovementCard from '@/components/movements/MovementCard';
import DashboardUnitFilter from './DashboardUnitFilter';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface RecentMovementsSectionProps {
  movements: Movement[];
  globalFilter: { selectedUnitId: string | null; showAllUnits: boolean };
  onMovementClick: (movement: Movement) => void;
  isMobile: boolean;
  isLoading: boolean;
}

const RecentMovementsSection: React.FC<RecentMovementsSectionProps> = ({
  movements,
  globalFilter,
  onMovementClick,
  isMobile,
  isLoading
}) => {
  const [localFilter, setLocalFilter] = useState({
    selectedUnitId: null as string | null,
    showAllUnits: true
  });
  const [showAllMovements, setShowAllMovements] = useState(false);

  // Apply local filter
  const filteredMovements = localFilter.showAllUnits 
    ? movements 
    : movements.filter(m => 
        m.departureUnitId === localFilter.selectedUnitId || 
        m.arrivalUnitId === localFilter.selectedUnitId
      );

  const displayMovements = showAllMovements 
    ? filteredMovements 
    : filteredMovements.slice(0, 4);

  const hasMoreMovements = filteredMovements.length > 4;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">
          Movimentações Recentes
          {!globalFilter.showAllUnits && globalFilter.selectedUnitId && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Unidade Filtrada)
            </span>
          )}
          {globalFilter.showAllUnits && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Todas as Unidades)
            </span>
          )}
        </h2>
        <DashboardUnitFilter
          selectedUnitId={localFilter.selectedUnitId}
          showAllUnits={localFilter.showAllUnits}
          onUnitChange={(unitId) => setLocalFilter(prev => ({ ...prev, selectedUnitId: unitId }))}
          onShowAllChange={(showAll) => setLocalFilter(prev => ({ 
            ...prev, 
            showAllUnits: showAll,
            selectedUnitId: showAll ? null : prev.selectedUnitId
          }))}
        />
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg shadow-sm p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredMovements.length === 0 ? (
        <div className="border rounded-lg shadow-sm p-4 col-span-full bg-muted text-center">
          Nenhuma movimentação registrada nos últimos dias
          {!localFilter.showAllUnits && localFilter.selectedUnitId && ` na unidade filtrada`}.
        </div>
      ) : !showAllMovements && !isMobile && filteredMovements.length > 4 ? (
        <Carousel className="w-full mx-auto" opts={{ 
          align: 'start', 
          containScroll: 'trimSnaps',
          dragFree: false,
          slidesToScroll: 1
        }}>
          <CarouselContent>
            {filteredMovements.slice(0, 8).map((movement) => (
              <CarouselItem key={movement.id} className="md:basis-1/2 lg:basis-1/3 px-1">
                <MovementCard 
                  movement={movement} 
                  onClick={onMovementClick}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="!-left-4" />
          <CarouselNext className="!-right-4" />
        </Carousel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayMovements.map((movement) => (
            <MovementCard 
              key={movement.id} 
              movement={movement} 
              onClick={onMovementClick}
            />
          ))}
        </div>
      )}
      
      {hasMoreMovements && (
        <div className="flex justify-center mt-3">
          <Button 
            variant="outline"
            onClick={() => setShowAllMovements(!showAllMovements)}
            className="text-sm"
          >
            {showAllMovements ? "- Mostrar Menos" : "+ Mostrar Mais"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentMovementsSection;
