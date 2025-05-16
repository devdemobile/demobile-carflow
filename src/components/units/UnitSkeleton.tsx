
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const UnitSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-12" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-0">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  );
};
