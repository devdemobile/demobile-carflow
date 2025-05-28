
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/types';
import VehicleCard from '@/components/vehicles/VehicleCard';
import DashboardUnitFilter from './DashboardUnitFilter';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FrequentVehiclesSectionProps {
  vehicles: Vehicle[];
  globalFilter: { selectedUnitId: string | null; showAllUnits: boolean };
  onVehicleClick: (vehicle: Vehicle) => void;
  isMobile: boolean;
}

const FrequentVehiclesSection: React.FC<FrequentVehiclesSectionProps> = ({
  vehicles,
  globalFilter,
  onVehicleClick,
  isMobile
}) => {
  const [localFilter, setLocalFilter] = useState({
    selectedUnitId: null as string | null,
    showAllUnits: true
  });
  const [showAllVehicles, setShowAllVehicles] = useState(false);

  // Apply local filter
  const filteredVehicles = localFilter.showAllUnits 
    ? vehicles 
    : vehicles.filter(v => v.unitId === localFilter.selectedUnitId);

  const displayVehicles = showAllVehicles 
    ? filteredVehicles 
    : filteredVehicles.slice(0, 4);

  const hasMoreVehicles = filteredVehicles.length > 4;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">
          Veículos Frequentes
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
      
      {!showAllVehicles && !isMobile && filteredVehicles.length > 4 ? (
        <Carousel className="w-full mx-auto" opts={{ 
          align: 'start', 
          containScroll: 'trimSnaps',
          dragFree: false,
          slidesToScroll: 1
        }}>
          <CarouselContent>
            {filteredVehicles.slice(0, 8).map((vehicle) => (
              <CarouselItem key={vehicle.id} className="md:basis-1/4 px-1">
                <VehicleCard 
                  vehicle={vehicle} 
                  onClick={() => onVehicleClick(vehicle)}
                  compact={true}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="!-left-4" />
          <CarouselNext className="!-right-4" />
        </Carousel>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {displayVehicles.length > 0 ? (
            displayVehicles.map((vehicle) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onClick={() => onVehicleClick(vehicle)}
                compact={true}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-6 col-span-4">
              Nenhum veículo cadastrado ainda
              {!localFilter.showAllUnits && localFilter.selectedUnitId && ` na unidade filtrada`}.
            </p>
          )}
        </div>
      )}
      
      {hasMoreVehicles && (
        <div className="flex justify-center mt-3">
          <Button 
            variant="outline"
            onClick={() => setShowAllVehicles(!showAllVehicles)}
            className="text-sm"
          >
            {showAllVehicles ? "- Mostrar Menos" : "+ Mostrar Mais"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FrequentVehiclesSection;
