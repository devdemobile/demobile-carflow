
import React from 'react';
import StatCard from './StatCard';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Car, Warehouse, PackageCheck } from 'lucide-react';

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
  
  const mobileClass = isMobile ? "flex items-center justify-between" : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total de Veículos"
        value={totalVehicles}
        icon={<Car className="h-4 w-4" />}
        loading={isLoading}
        className={mobileClass}
      />
      <StatCard
        title="Veículos no Pátio"
        value={vehiclesInYard}
        icon={<Warehouse className="h-4 w-4" />}
        loading={isLoading}
        className={mobileClass}
      />
      <StatCard
        title="Veículos em Rota"
        value={vehiclesOut}
        icon={<PackageCheck className="h-4 w-4" />}
        loading={isLoading}
        className={mobileClass}
      />
    </div>
  );
};

export default DashboardKPIContainer;
