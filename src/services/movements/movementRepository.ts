
/**
 * Repositório de acesso a dados de Movimentações
 */
import { supabase } from '@/integrations/supabase/client';
import { Movement, MovementDTO, VehicleLocation } from '@/types';
import { handleSupabaseRequest } from '@/services/api/supabase';

/**
 * Interface do repositório de movimentações
 */
export interface IMovementRepository {
  findAll(): Promise<Movement[]>;
  findById(id: string): Promise<Movement | null>;
  findByVehicle(vehicleId: string): Promise<Movement[]>;
  findByStatus(status: VehicleLocation): Promise<Movement[]>;
  findByDriver(driverName: string): Promise<Movement[]>;
  search(term: string): Promise<Movement[]>;
  create(movementData: MovementDTO, userId: string): Promise<Movement | null>;
  updateWithReturn(id: string, data: Partial<Movement>): Promise<Movement | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * Implementação do repositório de movimentações usando Supabase
 */
export class MovementRepository implements IMovementRepository {
  /**
   * Busca todas as movimentações
   */
  async findAll(): Promise<Movement[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('movements')
        .select(`
          id, type, status, driver, destination,
          departure_date, departure_time,
          arrival_date, arrival_time,
          initial_mileage, final_mileage, mileage_run, duration,
          vehicle_id, vehicles(id, plate, make, model, photo_url), 
          departure_unit_id, units:departure_unit_id(id, name),
          arrival_unit_id, arrival_units:arrival_unit_id(id, name)
        `)
        .order('departure_date', { ascending: false })
        .order('departure_time', { ascending: false }),
      'Erro ao buscar movimentações'
    );
    
    if (!data) return [];
    
    return data.map(this.mapMovementFromDB);
  }

  /**
   * Busca uma movimentação pelo ID
   */
  async findById(id: string): Promise<Movement | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('movements')
        .select(`
          id, type, status, driver, destination,
          departure_date, departure_time,
          arrival_date, arrival_time,
          initial_mileage, final_mileage, mileage_run, duration,
          vehicle_id, vehicles(id, plate, make, model, photo_url), 
          departure_unit_id, units:departure_unit_id(id, name),
          arrival_unit_id, arrival_units:arrival_unit_id(id, name)
        `)
        .eq('id', id)
        .single(),
      'Erro ao buscar movimentação'
    );
    
    if (!data) return null;
    
    return this.mapMovementFromDB(data);
  }

  /**
   * Busca movimentações por veículo
   */
  async findByVehicle(vehicleId: string): Promise<Movement[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('movements')
        .select(`
          id, type, status, driver, destination,
          departure_date, departure_time,
          arrival_date, arrival_time,
          initial_mileage, final_mileage, mileage_run, duration,
          vehicle_id, vehicles(id, plate, make, model, photo_url), 
          departure_unit_id, units:departure_unit_id(id, name),
          arrival_unit_id, arrival_units:arrival_unit_id(id, name)
        `)
        .eq('vehicle_id', vehicleId)
        .order('departure_date', { ascending: false })
        .order('departure_time', { ascending: false }),
      'Erro ao buscar movimentações do veículo'
    );
    
    if (!data) return [];
    
    return data.map(this.mapMovementFromDB);
  }

  /**
   * Busca movimentações por status
   */
  async findByStatus(status: VehicleLocation): Promise<Movement[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('movements')
        .select(`
          id, type, status, driver, destination,
          departure_date, departure_time,
          arrival_date, arrival_time,
          initial_mileage, final_mileage, mileage_run, duration,
          vehicle_id, vehicles(id, plate, make, model, photo_url), 
          departure_unit_id, units:departure_unit_id(id, name),
          arrival_unit_id, arrival_units:arrival_unit_id(id, name)
        `)
        .eq('status', status)
        .order('departure_date', { ascending: false })
        .order('departure_time', { ascending: false }),
      'Erro ao buscar movimentações por status'
    );
    
    if (!data) return [];
    
    return data.map(this.mapMovementFromDB);
  }

  /**
   * Busca movimentações por motorista
   */
  async findByDriver(driverName: string): Promise<Movement[]> {
    const searchTerm = `%${driverName.toLowerCase()}%`;
    
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('movements')
        .select(`
          id, type, status, driver, destination,
          departure_date, departure_time,
          arrival_date, arrival_time,
          initial_mileage, final_mileage, mileage_run, duration,
          vehicle_id, vehicles(id, plate, make, model, photo_url), 
          departure_unit_id, units:departure_unit_id(id, name),
          arrival_unit_id, arrival_units:arrival_unit_id(id, name)
        `)
        .ilike('driver', searchTerm)
        .order('departure_date', { ascending: false })
        .order('departure_time', { ascending: false }),
      'Erro ao buscar movimentações por motorista'
    );
    
    if (!data) return [];
    
    return data.map(this.mapMovementFromDB);
  }

  /**
   * Busca movimentações por termo de pesquisa
   */
  async search(term: string): Promise<Movement[]> {
    if (!term) return this.findAll();
    
    const searchTerm = `%${term.toLowerCase()}%`;
    
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('movements')
        .select(`
          id, type, status, driver, destination,
          departure_date, departure_time,
          arrival_date, arrival_time,
          initial_mileage, final_mileage, mileage_run, duration,
          vehicle_id, vehicles(id, plate, make, model, photo_url), 
          departure_unit_id, units:departure_unit_id(id, name),
          arrival_unit_id, arrival_units:arrival_unit_id(id, name)
        `)
        .or(`driver.ilike.${searchTerm},destination.ilike.${searchTerm},vehicles.plate.ilike.${searchTerm}`)
        .order('departure_date', { ascending: false })
        .order('departure_time', { ascending: false }),
      'Erro ao pesquisar movimentações'
    );
    
    if (!data) return [];
    
    return data.map(this.mapMovementFromDB);
  }

  /**
   * Cria uma nova movimentação
   */
  async create(movementData: MovementDTO, userId: string): Promise<Movement | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('movements')
        .insert([{
          vehicle_id: movementData.vehicleId,
          driver: movementData.driver,
          destination: movementData.destination || null,
          initial_mileage: movementData.initialMileage,
          final_mileage: movementData.finalMileage || null,
          departure_unit_id: movementData.departureUnitId,
          departure_date: movementData.departureDate || new Date().toISOString().split('T')[0],
          departure_time: movementData.departureTime || new Date().toTimeString().split(' ')[0],
          arrival_unit_id: movementData.arrivalUnitId || null,
          arrival_date: movementData.arrivalDate || null,
          arrival_time: movementData.arrivalTime || null,
          type: movementData.type,
          status: movementData.type === 'exit' ? 'out' : 'yard',
          created_by: userId
        }])
        .select()
        .single(),
      'Erro ao criar movimentação'
    );
    
    if (!data) return null;
    
    return this.findById(data.id);
  }

  /**
   * Atualiza uma movimentação com retorno dos dados atualizados
   */
  async updateWithReturn(id: string, data: Partial<Movement>): Promise<Movement | null> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    if (data.driver) updateData.driver = data.driver;
    if (data.destination !== undefined) updateData.destination = data.destination;
    if (data.initialMileage !== undefined) updateData.initial_mileage = data.initialMileage;
    if (data.finalMileage !== undefined) updateData.final_mileage = data.finalMileage;
    if (data.mileageRun !== undefined) updateData.mileage_run = data.mileageRun;
    if (data.departureDate) updateData.departure_date = data.departureDate;
    if (data.departureTime) updateData.departure_time = data.departureTime;
    if (data.departureUnitId) updateData.departure_unit_id = data.departureUnitId;
    if (data.arrivalDate !== undefined) updateData.arrival_date = data.arrivalDate;
    if (data.arrivalTime !== undefined) updateData.arrival_time = data.arrivalTime;
    if (data.arrivalUnitId !== undefined) updateData.arrival_unit_id = data.arrivalUnitId;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.status) updateData.status = data.status;
    if (data.type) updateData.type = data.type;

    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('movements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single(),
      'Erro ao atualizar movimentação'
    );
    
    if (!result) return null;
    
    return this.findById(id);
  }

  /**
   * Remove uma movimentação
   */
  async delete(id: string): Promise<boolean> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('movements')
        .delete()
        .eq('id', id),
      'Erro ao excluir movimentação'
    );
    
    return result !== null;
  }

  /**
   * Mapeia dados da movimentação do formato DB para o formato da aplicação
   */
  private mapMovementFromDB(data: any): Movement {
    return {
      id: data.id,
      vehicleId: data.vehicle_id,
      vehiclePlate: data.vehicles?.plate, // Adicionada placa do veículo
      vehicleName: data.vehicles ? `${data.vehicles.make} ${data.vehicles.model}` : undefined,
      photoUrl: data.vehicles?.photo_url, // Adicionada URL da foto do veículo
      driver: data.driver,
      destination: data.destination,
      initialMileage: data.initial_mileage,
      finalMileage: data.final_mileage,
      mileageRun: data.mileage_run,
      departureUnitId: data.departure_unit_id,
      departureUnitName: data.units?.name, // Adicionado nome da unidade de saída
      departureDate: data.departure_date,
      departureTime: data.departure_time,
      arrivalUnitId: data.arrival_unit_id,
      arrivalUnitName: data.arrival_units?.name, // Adicionado nome da unidade de chegada
      arrivalDate: data.arrival_date,
      arrivalTime: data.arrival_time,
      duration: data.duration,
      status: data.status,
      type: data.type,
      createdBy: data.created_by
    };
  }
}

/**
 * Instância singleton do repositório
 */
export const movementRepository = new MovementRepository();
