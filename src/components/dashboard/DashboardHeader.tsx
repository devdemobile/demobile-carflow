
import React from 'react';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title = "Dashboard", 
  subtitle = "Controle a entrada e saída de veículos"
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground text-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default DashboardHeader;
