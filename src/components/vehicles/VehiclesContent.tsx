
import React from 'react';
import VehiclesTable from './VehiclesTable';
import VehicleCard from './VehicleCard';
import { Vehicle } from '@/types';

interface VehiclesContentProps {
  viewMode: 'grid' | 'table';
  vehicles: Vehicle[];
  isLoading: boolean;
  refetch: () => void;
  onVehicleClick: (vehicle: Vehicle) => void;
}

const VehiclesContent: React.FC<VehiclesContentProps> = ({
  viewMode,
  vehicles,
  isLoading,
  refetch,
  onVehicleClick
}) => {
  if (viewMode === 'table') {
    return (
      <VehiclesTable 
        vehicles={vehicles}
        isLoading={isLoading}
        onRefresh={refetch}
        onVehicleClick={onVehicleClick}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-56 bg-muted rounded-lg animate-pulse" />
        ))
      ) : vehicles.length > 0 ? (
        vehicles.map((vehicle) => (
          <VehicleCard 
            key={vehicle.id} 
            vehicle={vehicle} 
            onClick={onVehicleClick}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground">
            Nenhum veículo encontrado com os filtros aplicados.
          </p>
        </div>
      )}
    </div>
  );
};

export default VehiclesContent;
