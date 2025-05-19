
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  loading = false,
  className = ""
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={className}>
      <CardHeader className={cn("flex flex-row items-center justify-between pb-2", 
        isMobile && "p-3 pb-1"
      )}>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className={cn("w-4 h-4 text-muted-foreground flex items-center justify-center", 
            isMobile && "ml-2"
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className={isMobile ? "p-3 pt-1" : undefined}>
        {loading ? (
          <>
            <Skeleton className="h-8 w-24 mb-1" />
            {description && <Skeleton className="h-3 w-32" />}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
