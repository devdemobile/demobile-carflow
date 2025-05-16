import { Vehicle, Movement, Unit } from "../types";

// Mock units
export const mockUnits: Unit[] = [
  {
    id: "1",
    name: "Matriz",
    code: "MTZ",
    address: "Av. Principal, 1000, Centro, São Paulo - SP",
    vehicleCount: 3,
    usersCount: 5
  },
  {
    id: "2",
    name: "Filial 6",
    code: "FL6",
    address: "Rua Secundária, 500, Jardim Europa, São Paulo - SP",
    vehicleCount: 1,
    usersCount: 2
  }
];

// Mock vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: "1",
    plate: "ABC1234",
    make: "Toyota",
    model: "Corolla",
    color: "Prata",
    year: 2020,
    mileage: 45000,
    photoUrl: "/placeholder.svg",
    location: "yard",
    unitId: "1"
  },
  {
    id: "2",
    plate: "DEF5678",
    make: "Honda",
    model: "Civic",
    color: "Preto",
    year: 2021,
    mileage: 30000,
    photoUrl: "/placeholder.svg",
    location: "out",
    unitId: "2"
  },
  {
    id: "3",
    plate: "GHI9012",
    make: "Volkswagen",
    model: "Gol",
    color: "Branco",
    year: 2019,
    mileage: 60000,
    photoUrl: "/placeholder.svg",
    location: "yard",
    unitId: "1"
  },
  {
    id: "4",
    plate: "JKL3456",
    make: "Ford",
    model: "Ka",
    color: "Vermelho",
    year: 2018,
    mileage: 75000,
    photoUrl: "/placeholder.svg",
    location: "yard",
    unitId: "1"
  }
];

// Generate a list of movements
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

export const mockMovements: Movement[] = [
  // Complete pair (out and back)
  {
    id: "1",
    vehicleId: "1",
    plate: "ABC1234",
    vehicleName: "Toyota Corolla Prata 2020",
    driver: "João Silva",
    destination: "Cliente XYZ",
    initialMileage: 44500,
    finalMileage: 45000,
    mileageRun: 500,
    departureUnitId: "1",
    departureDate: yesterday.toISOString().split('T')[0],
    departureTime: "08:30",
    arrivalUnitId: "1",
    arrivalDate: yesterday.toISOString().split('T')[0],
    arrivalTime: "17:45",
    duration: "9h 15m",
    status: "yard",
    type: "entry"
  },
  // Vehicle still out
  {
    id: "2",
    vehicleId: "2",
    plate: "DEF5678",
    vehicleName: "Honda Civic Preto 2021",
    driver: "Maria Oliveira",
    destination: "Fornecedor ABC",
    initialMileage: 30000,
    departureUnitId: "2",
    departureDate: today.toISOString().split('T')[0],
    departureTime: "09:15",
    status: "out",
    type: "exit"
  },
  // Initial entries for vehicles in the system
  {
    id: "3",
    vehicleId: "3",
    plate: "GHI9012",
    vehicleName: "Volkswagen Gol Branco 2019",
    driver: "Sistema",
    initialMileage: 60000,
    departureUnitId: "1",
    departureDate: new Date('2023-01-01').toISOString().split('T')[0],
    departureTime: "00:00",
    arrivalUnitId: "1",
    arrivalDate: new Date('2023-01-01').toISOString().split('T')[0],
    arrivalTime: "00:00",
    status: "yard",
    type: "initial"
  },
  {
    id: "4",
    vehicleId: "4",
    plate: "JKL3456",
    vehicleName: "Ford Ka Vermelho 2018",
    driver: "Sistema",
    initialMileage: 75000,
    departureUnitId: "1",
    departureDate: new Date('2023-02-15').toISOString().split('T')[0],
    departureTime: "00:00",
    arrivalUnitId: "1",
    arrivalDate: new Date('2023-02-15').toISOString().split('T')[0],
    arrivalTime: "00:00",
    status: "yard",
    type: "initial"
  }
];

// Frequency calculation (number of movements per vehicle)
const calculateVehicleFrequency = () => {
  const freq: Record<string, { count: number, vehicle: Vehicle }> = {};
  
  mockVehicles.forEach(vehicle => {
    freq[vehicle.id] = { count: 0, vehicle };
  });
  
  mockMovements.forEach(movement => {
    if (movement.type !== 'initial' && freq[movement.vehicleId]) {
      freq[movement.vehicleId].count++;
    }
  });
  
  // Convert to array and sort by count (descending)
  return Object.values(freq)
    .sort((a, b) => b.count - a.count)
    .map(item => ({
      ...item.vehicle,
      frequency: item.count
    }));
};

export const frequentVehicles = calculateVehicleFrequency();

// Mock data service functions
export const getVehicleByPlate = (plate: string): Vehicle | undefined => {
  return mockVehicles.find(v => v.plate.toLowerCase() === plate.toLowerCase());
};

export const getRecentMovements = (): Movement[] => {
  // Filter movements from the last 24 hours, excluding initial entries
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  return mockMovements
    .filter(m => m.type !== 'initial' && new Date(`${m.departureDate}T${m.departureTime}`) >= oneDayAgo)
    .sort((a, b) => {
      // Sort by most recent first
      const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
      const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
      return dateB.getTime() - dateA.getTime();
    });
};

export const getVehicleStats = (unitId?: string) => {
  const filteredVehicles = unitId 
    ? mockVehicles.filter(v => v.unitId === unitId)
    : mockVehicles;
  
  const total = filteredVehicles.length;
  const inYard = filteredVehicles.filter(v => v.location === 'yard').length;
  const out = filteredVehicles.filter(v => v.location === 'out').length;
  
  // Count movements from today
  const today = new Date().toISOString().split('T')[0];
  const movementsToday = mockMovements.filter(m => 
    m.departureDate === today || (m.arrivalDate === today)
  ).length;
  
  return {
    totalVehicles: total,
    vehiclesInYard: inYard,
    vehiclesOut: out,
    movementsToday
  };
};

// Simulate adding a movement
export const addMovement = (movement: Partial<Movement>): Movement => {
  // In a real app, this would be an API call
  
  // Generate a new movement ID
  const newId = (mockMovements.length + 1).toString();
  
  const newMovement = {
    id: newId,
    vehicleId: movement.vehicleId || "",
    plate: movement.plate || "",
    vehicleName: movement.vehicleName || "",
    driver: movement.driver || "",
    destination: movement.destination,
    initialMileage: movement.initialMileage || 0,
    finalMileage: movement.finalMileage,
    mileageRun: movement.finalMileage && movement.initialMileage 
      ? movement.finalMileage - movement.initialMileage
      : undefined,
    departureUnitId: movement.departureUnitId || "",
    departureDate: movement.departureDate || new Date().toISOString().split('T')[0],
    departureTime: movement.departureTime || new Date().toTimeString().split(' ')[0].substring(0, 5),
    arrivalUnitId: movement.arrivalUnitId,
    arrivalDate: movement.arrivalDate,
    arrivalTime: movement.arrivalTime,
    duration: calculateDuration(
      movement.departureDate, 
      movement.departureTime,
      movement.arrivalDate,
      movement.arrivalTime
    ),
    status: movement.status || "out",
    type: movement.type || "exit"
  } as Movement;
  
  mockMovements.push(newMovement);
  
  // Update vehicle location and mileage
  const vehicleIndex = mockVehicles.findIndex(v => v.id === movement.vehicleId);
  if (vehicleIndex !== -1) {
    const updatedVehicle = { ...mockVehicles[vehicleIndex] };
    
    if (movement.type === "entry" && movement.finalMileage) {
      updatedVehicle.mileage = movement.finalMileage;
      updatedVehicle.location = "yard";
    } else if (movement.type === "exit") {
      updatedVehicle.location = "out";
    }
    
    mockVehicles[vehicleIndex] = updatedVehicle;
  }
  
  return newMovement;
};

// Helper function to calculate duration between two dates/times
function calculateDuration(
  startDate?: string,
  startTime?: string,
  endDate?: string,
  endTime?: string
): string | undefined {
  if (!startDate || !startTime || !endDate || !endTime) {
    return undefined;
  }
  
  const start = new Date(`${startDate}T${startTime}:00`);
  const end = new Date(`${endDate}T${endTime}:00`);
  
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return undefined;
  
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHrs}h ${diffMins}m`;
}
