
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
  update(id: string, vehicleData: Partial<VehicleDTO>): Promise<boolean>;
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
        .maybeSingle(),
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
        .maybeSingle(),
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
        .or(`plate.ilike.${searchTerm},make.ilike.${searchTerm},model.ilike.${searchTerm},color.ilike.${searchTerm}`)
        .order('plate'),
      'Erro ao pesquisar veículos'
    );
    
    if (!data) return [];
    
    return data.map(this.mapVehicleFromDb);
  }

  /**
   * Cria um novo veículo e registra uma movimentação inicial
   */
  async create(vehicleData: VehicleDTO): Promise<Vehicle | null> {
    try {
      // 1. Criar o veículo
      const vehicleResult = await handleSupabaseRequest(
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
          .select('id')
          .single(),
        'Erro ao criar veículo'
      );
      
      if (!vehicleResult) {
        throw new Error('Falha ao criar o veículo');
      }
      
      const vehicleId = vehicleResult.id;
      
      // 2. Obter o usuário admin para usar como created_by
      const { data: adminUser, error: adminError } = await supabase
        .from('system_users')
        .select('id')
        .eq('username', 'admin')
        .maybeSingle();
      
      let userId = null;
      if (adminUser && !adminError) {
        userId = adminUser.id;
      }
      
      // 3. Criar uma movimentação inicial para o veículo
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const formattedTime = now.toTimeString().split(' ')[0];
      
      await handleSupabaseRequest(
        async () => await supabase
          .from('movements')
          .insert({
            vehicle_id: vehicleId,
            driver: 'Registro Inicial',
            initial_mileage: vehicleData.mileage,
            departure_unit_id: vehicleData.unitId,
            departure_date: formattedDate,
            departure_time: formattedTime,
            type: 'initial',
            status: 'yard',
            created_by: userId
          }),
        'Erro ao registrar movimentação inicial do veículo'
      );
      
      // 4. Retornar o veículo completo
      return this.findById(vehicleId);
    } catch (error) {
      console.error('Erro na transação de criação de veículo:', error);
      throw error;
    }
  }

  /**
   * Atualiza um veículo
   */
  async update(id: string, vehicleData: Partial<VehicleDTO>): Promise<boolean> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    if (vehicleData.plate !== undefined) updateData.plate = vehicleData.plate;
    if (vehicleData.make !== undefined) updateData.make = vehicleData.make;
    if (vehicleData.model !== undefined) updateData.model = vehicleData.model;
    if (vehicleData.year !== undefined) updateData.year = vehicleData.year;
    if (vehicleData.color !== undefined) updateData.color = vehicleData.color;
    if (vehicleData.mileage !== undefined) updateData.mileage = vehicleData.mileage;
    if (vehicleData.photoUrl !== undefined) updateData.photo_url = vehicleData.photoUrl;
    if (vehicleData.location !== undefined) updateData.location = vehicleData.location;
    if (vehicleData.unitId !== undefined) updateData.unit_id = vehicleData.unitId;
    
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
    // Verificar se existem movimentações associadas ao veículo
    const { count, error: countError } = await supabase
      .from('movements')
      .select('*', { count: 'exact', head: true })
      .eq('vehicle_id', id);
    
    if (countError) {
      console.error('Erro ao verificar movimentações do veículo:', countError);
      throw new Error('Erro ao verificar movimentações do veículo');
    }
    
    // Se houver movimentações além da inicial, não permitir a exclusão
    if (count && count > 1) {
      throw new Error(`Não é possível excluir o veículo pois existem ${count} movimentações associadas.`);
    }
    
    // Primeiro, exclui a movimentação inicial
    await handleSupabaseRequest(
      async () => await supabase
        .from('movements')
        .delete()
        .eq('vehicle_id', id)
        .eq('type', 'initial'),
      'Erro ao excluir movimentação inicial do veículo'
    );
    
    // Depois, exclui o veículo
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
      unitName: data.units?.name,
      makeId: data.make_id,
      modelId: data.model_id
    };
  }
}

export const vehicleRepository = new VehicleRepository();
