
import { Movement } from '@/types';

/**
 * Mapeia dados da movimentação do formato DB para o formato da aplicação
 */
export class MovementMapper {
  /**
   * Mapeia dados da movimentação do formato DB para o formato da aplicação
   */
  static mapMovementFromDB(data: any): Movement {
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
