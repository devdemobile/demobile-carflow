
/**
 * Repositório de acesso a dados de Veículos
 */
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, VehicleDTO, VehicleLocation } from '@/types';
import { handleSupabaseRequest } from '@/services/api/supabase';

/**
 * Interface do repositório de veículos
 */
export interface IVehicleRepository {
  findAll(): Promise<Vehicle[]>;
  findByUnit(unitId: string): Promise<Vehicle[]>;
  findByLocation(location: VehicleLocation): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  findByPlate(plate: string): Promise<Vehicle | null>;
  search(term: string): Promise<Vehicle[]>;
  create(vehicleData: VehicleDTO): Promise<Vehicle | null>;
  update(id: string, vehicleData: Partial<VehicleDTO>): Promise<boolean>;
  updateMileage(id: string, mileage: number): Promise<boolean>;
  updateLocation(id: string, location: VehicleLocation): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

/**
 * Implementação do repositório de veículos usando Supabase
 */
export class VehicleRepository implements IVehicleRepository {
  /**
   * Busca todos os veículos
   */
  async findAll(): Promise<Vehicle[]> {
    return handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select('*, units(name)')
        .order('plate'),
      'Erro ao buscar veículos'
    ) || [];
  }

  /**
   * Busca veículos por unidade
   */
  async findByUnit(unitId: string): Promise<Vehicle[]> {
    return handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select('*, units(name)')
        .eq('unit_id', unitId)
        .order('plate'),
      'Erro ao buscar veículos da unidade'
    ) || [];
  }

  /**
   * Busca veículos por localização
   */
  async findByLocation(location: VehicleLocation): Promise<Vehicle[]> {
    return handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select('*, units(name)')
        .eq('location', location)
        .order('plate'),
      'Erro ao buscar veículos por localização'
    ) || [];
  }

  /**
   * Busca um veículo pelo ID
   */
  async findById(id: string): Promise<Vehicle | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select('*, units(name)')
        .eq('id', id)
        .single(),
      'Erro ao buscar veículo'
    );
    
    if (data) {
      // Converter o resultado do join para o formato esperado
      return {
        ...data,
        unitName: data.units?.name
      } as unknown as Vehicle;
    }
    
    return null;
  }

  /**
   * Busca um veículo pela placa
   */
  async findByPlate(plate: string): Promise<Vehicle | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select('*, units(name)')
        .eq('plate', plate)
        .single(),
      'Erro ao buscar veículo pela placa'
    );
    
    if (data) {
      return {
        ...data,
        unitName: data.units?.name
      } as unknown as Vehicle;
    }
    
    return null;
  }

  /**
   * Busca veículos por termo de pesquisa
   */
  async search(term: string): Promise<Vehicle[]> {
    if (!term) return this.findAll();
    
    const searchTerm = `%${term.toLowerCase()}%`;
    
    return handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select('*, units(name)')
        .or(`plate.ilike.${searchTerm},make.ilike.${searchTerm},model.ilike.${searchTerm},color.ilike.${searchTerm}`)
        .order('plate'),
      'Erro ao pesquisar veículos'
    ) || [];
  }

  /**
   * Cria um novo veículo
   */
  async create(vehicleData: VehicleDTO): Promise<Vehicle | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .insert([{
          plate: vehicleData.plate,
          make: vehicleData.make,
          model: vehicleData.model,
          color: vehicleData.color,
          year: vehicleData.year,
          mileage: vehicleData.mileage,
          photo_url: vehicleData.photoUrl || null,
          unit_id: vehicleData.unitId
        }])
        .select()
        .single(),
      'Erro ao criar veículo'
    );
    
    return data as Vehicle | null;
  }

  /**
   * Atualiza um veículo existente
   */
  async update(id: string, vehicleData: Partial<VehicleDTO>): Promise<boolean> {
    const updateData: Record<string, any> = {
      updated_at: new Date()
    };
    
    if (vehicleData.plate) updateData.plate = vehicleData.plate;
    if (vehicleData.make) updateData.make = vehicleData.make;
    if (vehicleData.model) updateData.model = vehicleData.model;
    if (vehicleData.color) updateData.color = vehicleData.color;
    if (vehicleData.year) updateData.year = vehicleData.year;
    if (vehicleData.mileage !== undefined) updateData.mileage = vehicleData.mileage;
    if (vehicleData.photoUrl !== undefined) updateData.photo_url = vehicleData.photoUrl;
    if (vehicleData.unitId) updateData.unit_id = vehicleData.unitId;
    
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', id),
      'Erro ao atualizar veículo'
    );
    
    return result !== null;
  }

  /**
   * Atualiza a quilometragem de um veículo
   */
  async updateMileage(id: string, mileage: number): Promise<boolean> {
    return this.update(id, { mileage });
  }

  /**
   * Atualiza a localização de um veículo
   */
  async updateLocation(id: string, location: VehicleLocation): Promise<boolean> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .update({
          location,
          updated_at: new Date()
        })
        .eq('id', id),
      'Erro ao atualizar localização do veículo'
    );
    
    return result !== null;
  }

  /**
   * Remove um veículo
   */
  async delete(id: string): Promise<boolean> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .delete()
        .eq('id', id),
      'Erro ao excluir veículo'
    );
    
    return result !== null;
  }
}

/**
 * Instância singleton do repositório
 */
export const vehicleRepository = new VehicleRepository();
