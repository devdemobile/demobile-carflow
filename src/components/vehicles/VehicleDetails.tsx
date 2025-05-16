
import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Car, MapPin } from 'lucide-react';
import { DeleteVehicleDialog } from './DeleteVehicleDialog';
import VehicleForm from './VehicleForm';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface VehicleDetailsProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ 
  vehicle, 
  isOpen, 
  onClose,
  onEdit,
  onDelete
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { userPermissions } = useAuth();

  if (!vehicle) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Car className="mr-2 h-5 w-5" /> 
              {vehicle.plate}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="relative mb-6">
              {vehicle.photoUrl ? (
                <img 
                  src={vehicle.photoUrl} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-[240px] object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-[240px] bg-muted flex items-center justify-center rounded-lg">
                  <Car className="h-24 w-24 text-muted-foreground opacity-50" />
                </div>
              )}
              
              <Badge 
                className={`absolute top-4 right-4 ${
                  vehicle.location === 'yard' 
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                {vehicle.location === 'yard' ? 'No Pátio' : 'Em Uso'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold">Informações do Veículo</h3>
                <ul className="space-y-2 mt-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Marca:</span> 
                    <span className="font-medium">{vehicle.make}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Modelo:</span> 
                    <span className="font-medium">{vehicle.model}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Cor:</span> 
                    <span className="font-medium">{vehicle.color}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Ano:</span> 
                    <span className="font-medium">{vehicle.year}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">Status</h3>
                <ul className="space-y-2 mt-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Quilometragem:</span> 
                    <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Unidade:</span> 
                    <span className="font-medium">{vehicle.unitName || vehicle.unitId}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Localização:</span>
                    <Badge variant={vehicle.location === 'yard' ? 'outline' : 'secondary'}>
                      <MapPin className="h-3 w-3 mr-1" />
                      {vehicle.location === 'yard' ? 'No Pátio' : 'Em Uso'}
                    </Badge>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Fechar
              </Button>
              
              {userPermissions?.canEditVehicles && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <VehicleForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={() => {
          setIsEditDialogOpen(false);
          onEdit();
          onClose();
        }}
        editingVehicle={vehicle}
      />
      
      <DeleteVehicleDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={() => {
          setIsDeleteDialogOpen(false);
          onDelete();
          onClose();
        }}
        vehicle={vehicle}
      />
    </>
  );
};

export default VehicleDetails;
