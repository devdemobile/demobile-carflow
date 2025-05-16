
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  actions
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className={`text-sm text-muted-foreground mt-1`}>{subtitle}</p>}
      </div>
      {actions && (
        <div className={`flex ${isMobile ? 'w-full' : 'items-center'} gap-2`}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
