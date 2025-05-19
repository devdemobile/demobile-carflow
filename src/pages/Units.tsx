
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useUnits } from '@/hooks/useUnits';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import UnitsFilter from '@/components/units/UnitsFilter';
import UnitDialog from '@/components/units/UnitDialog';
import UnitsTable from '@/components/units/UnitsTable';
import UnitCard from '@/components/units/UnitCard';
import { UnitData } from '@/services/units/unitService';
import { useMediaQuery } from '@/hooks/use-mobile';

const Units = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitData | null>(null);
  const { units, loading, refetch } = useUnits();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleAddUnit = () => {
    setEditingUnit(null);
    setIsUnitDialogOpen(true);
  };

  const handleEditUnit = (unit: UnitData) => {
    setEditingUnit(unit);
    setIsUnitDialogOpen(true);
  };

  const filteredUnits = units.filter(unit => 
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    unit.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Unidades</h1>
          <Button onClick={handleAddUnit}>
            <Plus className="h-4 w-4 md:mr-2" />
            {!isMobile && <span>Nova Unidade</span>}
          </Button>
        </div>

        <UnitsFilter
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onReset={() => setSearchTerm('')}
          isLoading={loading}
          showViewToggle={!isMobile}
        />

        {viewMode === 'table' ? (
          <UnitsTable
            units={filteredUnits}
            isLoading={loading}
            onEdit={handleEditUnit}
            onRefresh={refetch}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredUnits.map(unit => (
              <UnitCard 
                key={unit.id} 
                unit={unit} 
                onEdit={() => handleEditUnit(unit)}
                onDeleted={refetch}
              />
            ))}
          </div>
        )}

        <UnitDialog
          isOpen={isUnitDialogOpen}
          onClose={() => setIsUnitDialogOpen(false)}
          unit={editingUnit}
          onUnitSaved={refetch}
        />
      </div>
    </Layout>
  );
};

export default Units;
