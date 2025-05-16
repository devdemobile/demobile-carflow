
import React from 'react';

interface DashboardHeaderProps {
  title?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title = "Controle a entrada e saída de veículos" 
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">
        {title}
      </h1>
    </div>
  );
};

export default DashboardHeader;
