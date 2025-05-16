
import { useState } from 'react';
import { Vehicle, VehicleLocation } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface VehicleFilters {
  searchTerm?: string;
  unitId?: string | null;
  location?: VehicleLocation | null;
}

export const useVehicles = (initialFilters?: VehicleFilters) => {
  const [filters, setFilters] = useState({
    search: initialFilters?.searchTerm || '',
    location: initialFilters?.location || null as VehicleLocation | null,
    unitId: initialFilters?.unitId || null as string | null,
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Fetch vehicles from Supabase with filters
  const fetchVehicles = async (): Promise<Vehicle[]> => {
    let query = supabase
      .from('vehicles')
      .select('*');
    
    // Apply filters
    if (filters.search) {
      query = query.or(
        `plate.ilike.%${filters.search}%,make.ilike.%${filters.search}%,model.ilike.%${filters.search}%,color.ilike.%${filters.search}%`
      );
    }
    
    if (filters.location) {
      query = query.eq('location', filters.location);
    }

    if (filters.unitId) {
      query = query.eq('unit_id', filters.unitId);
    }

    // Execute the query
    const { data, error } = await query.order('plate', { ascending: true });
    
    if (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
    
    // Map the response data to match our Vehicle type
    return (data || []).map(item => ({
      id: item.id,
      plate: item.plate,
      make: item.make,
      model: item.model,
      color: item.color,
      year: item.year,
      mileage: item.mileage,
      photoUrl: item.photo_url,
      location: item.location as VehicleLocation,
      unitId: item.unit_id
    }));
  };

  // Calculate paginated data
  const { data: allVehicles = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: fetchVehicles
  });

  // Calculate total pages
  const totalPages = Math.ceil(allVehicles.length / pageSize);
  
  // Get current page data
  const paginatedVehicles = allVehicles.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Get vehicles with most movements (mock implementation)
  const topVehicles = [...allVehicles]
    .map(vehicle => ({
      ...vehicle,
      frequency: Math.floor(Math.random() * 50) + 1 // Mock movement count
    }))
    .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
    .slice(0, 5);

  const handleFilterChange = (name: string, value: string | null) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      location: null,
      unitId: null,
    });
    setPage(1);
  };

  return {
    vehicles: paginatedVehicles,
    allVehicles,
    topVehicles,
    isLoading,
    isError,
    filters,
    handleFilterChange,
    resetFilters,
    page,
    setPage,
    totalPages,
    viewMode,
    setViewMode,
    refetch
  };
};
