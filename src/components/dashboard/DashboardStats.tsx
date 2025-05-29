
import React from 'react';

interface DashboardStatsProps {
  vehicleStats: {
    totalVehicles: number;
    vehiclesInYard: number;
    vehiclesOut: number;
  };
  todayMovements: number;
  unitFilter: {
    showAllUnits: boolean;
    selectedUnitId: string | null;
  };
  isMobile: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  vehicleStats,
  todayMovements,
  unitFilter,
  isMobile
}) => {
  const inYardPercentage = vehicleStats.totalVehicles > 0 
    ? Math.round((vehicleStats.vehiclesInYard / vehicleStats.totalVehicles) * 100) 
    : 0;
    
  const outPercentage = vehicleStats.totalVehicles > 0 
    ? Math.round((vehicleStats.vehiclesOut / vehicleStats.totalVehicles) * 100) 
    : 0;

  const headerStats = [
    {
      title: "Total de Veículos",
      value: vehicleStats.totalVehicles,
      description: unitFilter.showAllUnits ? "Em todas as unidades" : `Na unidade filtrada`
    },
    {
      title: "Veículos no Pátio",
      value: vehicleStats.vehiclesInYard,
      description: `${inYardPercentage}% da frota`
    },
    {
      title: "Veículos Fora",
      value: vehicleStats.vehiclesOut,
      description: `${outPercentage}% da frota`
    },
    {
      title: "Movimentados Hoje",
      value: todayMovements
    }
  ];

  if (isMobile) {
    return null;
  }

  return (
    <div className="flex gap-3 items-center">
      {headerStats.map((stat, index) => (
        <div key={index} className="bg-card border rounded-md px-4 py-2 flex flex-col w-[150px] h-[80px]">
          <span className="text-xs text-muted-foreground mb-0.5">{stat.title}</span>
          <span className="font-medium text-base">{stat.value}</span>
          {stat.description && (
            <span className="text-xs text-muted-foreground">{stat.description}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
