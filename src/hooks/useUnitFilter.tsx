
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface UnitFilterState {
  selectedUnitId: string | null;
  showAllUnits: boolean;
}

export const useUnitFilter = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<UnitFilterState>({
    selectedUnitId: user?.unitId || null,
    showAllUnits: false
  });

  // Reset filter when user changes
  useEffect(() => {
    if (user?.unitId) {
      setFilter({
        selectedUnitId: user.unitId,
        showAllUnits: false
      });
    }
  }, [user?.unitId]);

  const setShowAllUnits = (showAll: boolean) => {
    setFilter(prev => ({
      ...prev,
      showAllUnits: showAll,
      selectedUnitId: showAll ? null : user?.unitId || null
    }));
  };

  const setSelectedUnit = (unitId: string | null) => {
    setFilter(prev => ({
      ...prev,
      selectedUnitId: unitId,
      showAllUnits: !unitId
    }));
  };

  return {
    filter,
    setShowAllUnits,
    setSelectedUnit,
    canEditInUnit: (unitId: string) => user?.role === 'admin' || user?.unitId === unitId
  };
};
