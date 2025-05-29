
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface VehicleSearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

const VehicleSearchFilter: React.FC<VehicleSearchFilterProps> = ({
  searchValue,
  onSearchChange,
  placeholder = "Buscar por placa, marca, modelo, cor..."
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Mudando busca para:', value);
    onSearchChange(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={handleSearchChange}
        className="pl-10 bg-background border"
      />
    </div>
  );
};

export default VehicleSearchFilter;
