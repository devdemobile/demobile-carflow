
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, VehicleDTO, VehicleLocation } from '@/types';
import { handleSupabaseRequest } from '@/services/api/supabase';

export interface IVehicleRepository {
  findAll(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  findByPlate(plate: string): Promise<Vehicle | null>;
  findByUnit(unitId: string): Promise<Vehicle[]>;
  findByLocation(location: VehicleLocation): Promise<Vehicle[]>;
  search(term: string): Promise<Vehicle[]>;
  create(vehicleData: VehicleDTO): Promise<Vehicle | null>;
  update(id: string, vehicleData: Partial<Vehicle>): Promise<boolean>;
  updateLocation(id: string, location: VehicleLocation, mileage?: number): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export class VehicleRepository implements IVehicleRepository {
  /**
   * Busca todos os veículos
   */
  async findAll(): Promise<Vehicle[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select(`
          *,
          units(id, name)
        `)
        .order('plate'),
      'Erro ao buscar veículos'
    );
    
    if (!data) return [];
    
    return data.map(this.mapVehicleFromDb);
  }

  /**
   * Busca veículos por unidade
   */
  async findByUnit(unitId: string): Promise<Vehicle[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select(`
          *,
          units(id, name)
        `)
        .eq('unit_id', unitId)
        .order('plate'),
      'Erro ao buscar veículos da unidade'
    );
    
    if (!data) return [];
    
    return data.map(this.mapVehicleFromDb);
  }

  /**
   * Busca veículos por localização
   */
  async findByLocation(location: VehicleLocation): Promise<Vehicle[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select(`
          *,
          units(id, name)
        `)
        .eq('location', location)
        .order('plate'),
      'Erro ao buscar veículos por localização'
    );
    
    if (!data) return [];
    
    return data.map(this.mapVehicleFromDb);
  }

  /**
   * Busca um veículo pelo ID
   */
  async findById(id: string): Promise<Vehicle | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select(`
          *,
          units(id, name)
        `)
        .eq('id', id)
        .single(),
      'Erro ao buscar veículo'
    );
    
    if (!data) return null;
    
    return this.mapVehicleFromDb(data);
  }

  /**
   * Busca um veículo pela placa
   */
  async findByPlate(plate: string): Promise<Vehicle | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select(`
          *,
          units(id, name)
        `)
        .eq('plate', plate)
        .single(),
      'Erro ao buscar veículo pela placa'
    );
    
    if (!data) return null;
    
    return this.mapVehicleFromDb(data);
  }

  /**
   * Busca veículos por termo de pesquisa
   */
  async search(term: string): Promise<Vehicle[]> {
    const searchTerm = `%${term.toLowerCase()}%`;
    
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select(`
          *,
          units(id, name)
        `)
        .or(`plate.ilike.${searchTerm},make.ilike.${searchTerm},model.ilike.${searchTerm}`)
        .order('plate'),
      'Erro ao pesquisar veículos'
    );
    
    if (!data) return [];
    
    return data.map(this.mapVehicleFromDb);
  }

  /**
   * Cria um novo veículo
   */
  async create(vehicleData: VehicleDTO): Promise<Vehicle | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .insert({
          plate: vehicleData.plate,
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          color: vehicleData.color,
          mileage: vehicleData.mileage,
          photo_url: vehicleData.photoUrl,
          location: vehicleData.location || 'yard',
          unit_id: vehicleData.unitId
        })
        .select()
        .single(),
      'Erro ao criar veículo'
    );
    
    if (!data) return null;
    
    return this.findById(data.id);
  }

  /**
   * Atualiza um veículo
   */
  async update(id: string, vehicleData: Partial<Vehicle>): Promise<boolean> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    if (vehicleData.plate) updateData.plate = vehicleData.plate;
    if (vehicleData.make) updateData.make = vehicleData.make;
    if (vehicleData.model) updateData.model = vehicleData.model;
    if (vehicleData.year) updateData.year = vehicleData.year;
    if (vehicleData.color) updateData.color = vehicleData.color;
    if (vehicleData.mileage !== undefined) updateData.mileage = vehicleData.mileage;
    if (vehicleData.photoUrl !== undefined) updateData.photo_url = vehicleData.photoUrl;
    if (vehicleData.location) updateData.location = vehicleData.location;
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
   * Atualiza a localização de um veículo
   */
  async updateLocation(id: string, location: VehicleLocation, mileage?: number): Promise<boolean> {
    const updateData: Record<string, any> = {
      location,
      updated_at: new Date().toISOString()
    };
    
    if (mileage !== undefined) {
      updateData.mileage = mileage;
    }
    
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .update(updateData)
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

  /**
   * Mapeia dados do veículo do formato DB para o formato da aplicação
   */
  private mapVehicleFromDb(data: any): Vehicle {
    return {
      id: data.id,
      plate: data.plate,
      make: data.make,
      model: data.model,
      year: data.year,
      color: data.color,
      mileage: data.mileage,
      photoUrl: data.photo_url,
      location: data.location,
      unitId: data.unit_id,
      unitName: data.units?.name
    };
  }
}

export const vehicleRepository = new VehicleRepository();
