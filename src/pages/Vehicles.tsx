
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Vehicle } from '@/types';
import { useVehicles } from '@/hooks/useVehicles';
import VehiclesFilter from '@/components/vehicles/VehiclesFilter';
import VehicleCard from '@/components/vehicles/VehicleCard';
import VehiclesTable from '@/components/vehicles/VehiclesTable';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

const Vehicles = () => {
  const isMobile = useIsMobile();
  const { 
    vehicles, 
    isLoading, 
    filters, 
    handleFilterChange, 
    resetFilters, 
    page, 
    setPage, 
    totalPages,
    viewMode,
    setViewMode
  } = useVehicles();
  
  const handleVehicleClick = (vehicle: Vehicle) => {
    // For future implementation: show vehicle details or edit dialog
    console.log('Vehicle clicked:', vehicle);
  };

  // Generate skeleton loaders for the grid view
  const renderSkeletons = () => {
    return Array(8).fill(0).map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ));
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Veículos</h1>
        
        <VehiclesFilter 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onReset={resetFilters} 
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        
        {isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {renderSkeletons()}
            </div>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {vehicles.length === 0 ? (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">Nenhum veículo encontrado.</p>
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle}
                  onClick={() => handleVehicleClick(vehicle)}
                />
              ))
            )}
          </div>
        ) : (
          <VehiclesTable vehicles={vehicles} onVehicleClick={handleVehicleClick} />
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }} 
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i} className="hidden md:block">
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(i + 1);
                    }}
                    isActive={page === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }} 
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </Layout>
  );
};

export default Vehicles;
