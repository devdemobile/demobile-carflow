
import React from 'react';
import StatCard from './StatCard';
import { useMediaQuery } from '@/hooks/use-mobile';

interface DashboardKPIContainerProps {
  totalVehicles: number;
  vehiclesInYard: number;
  vehiclesOut: number;
  isLoading?: boolean;
}

const DashboardKPIContainer: React.FC<DashboardKPIContainerProps> = ({
  totalVehicles,
  vehiclesInYard,
  vehiclesOut,
  isLoading = false
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total de Veículos"
        value={totalVehicles}
        icon="vehicle"
        loading={isLoading}
        className={isMobile ? "flex items-center justify-between" : ""}
      />
      <StatCard
        title="Veículos no Pátio"
        value={vehiclesInYard}
        icon="yard"
        loading={isLoading}
        className={isMobile ? "flex items-center justify-between" : ""}
      />
      <StatCard
        title="Veículos em Rota"
        value={vehiclesOut}
        icon="route"
        loading={isLoading}
        className={isMobile ? "flex items-center justify-between" : ""}
      />
    </div>
  );
};

export default DashboardKPIContainer;
