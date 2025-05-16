
import { useState, useEffect, useMemo } from 'react';
import { Movement } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useMovements = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: '',
  });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchMovements = async () => {
    try {
      // Joining with vehicles table to get the plate information
      let query = supabase
        .from('movements')
        .select(`
          id, 
          type,
          status, 
          driver, 
          destination,
          departure_date, 
          departure_time,
          arrival_date,
          arrival_time,
          initial_mileage,
          final_mileage,
          mileage_run,
          duration,
          vehicles!inner(id, plate, make, model)
        `)
        .order('departure_date', { ascending: false })
        .order('departure_time', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`
          vehicles.plate.ilike.%${filters.search}%,
          driver.ilike.%${filters.search}%,
          destination.ilike.%${filters.search}%
        `);
      }

      // For pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: movementsData, error, count } = await query
        .range(from, to)
        .limit(pageSize);

      if (error) {
        console.error('Error fetching movements:', error);
        throw error;
      }

      // Transform the data for frontend use
      const movements: Movement[] = movementsData.map(item => ({
        id: item.id,
        vehicleId: item.vehicles.id,
        plate: item.vehicles.plate,
        vehicleName: `${item.vehicles.make} ${item.vehicles.model}`,
        driver: item.driver,
        destination: item.destination,
        initialMileage: item.initial_mileage,
        finalMileage: item.final_mileage || undefined,
        mileageRun: item.mileage_run || undefined,
        departureUnitId: '', // This would need to be included in the select if needed
        departureDate: item.departure_date,
        departureTime: item.departure_time,
        arrivalUnitId: '', // This would need to be included in the select if needed
        arrivalDate: item.arrival_date || undefined,
        arrivalTime: item.arrival_time || undefined,
        duration: item.duration || undefined,
        status: item.status,
        type: item.type
      }));

      return {
        movements,
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error in fetchMovements:', error);
      return {
        movements: [],
        totalCount: 0
      };
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['movements', filters, page],
    queryFn: fetchMovements
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      dateRange: '',
    });
    setPage(1);
  };

  const totalPages = useMemo(() => {
    return Math.ceil((data?.totalCount || 0) / pageSize);
  }, [data?.totalCount]);

  return {
    movements: data?.movements || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    page,
    setPage,
    totalPages,
    filters,
    handleFilterChange,
    resetFilters,
    refetch
  };
};
