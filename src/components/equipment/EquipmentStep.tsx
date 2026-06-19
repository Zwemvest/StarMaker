import { useMemo, useState } from 'react';
import { useCharacterStore } from '../../stores/character';
import { filterCatalog } from '../../engine/equipment';
import { EQUIPMENT_CATALOG } from '../../data/equipment';
import { CategoryFilter } from './CategoryFilter';
import { CatalogBrowser } from './CatalogBrowser';
import { PurchaseCart } from './PurchaseCart';
import { Button } from '../ui/Button';
import type { CreationEvent } from '../../machines/creation';
import type { Equipment, EquipmentCategory } from '../../types/equipment';

interface EquipmentStepProps {
  send: (event: CreationEvent) => void;
}

/**
 * Equipment step orchestrator (EQUP-02/03/04).
 *
 * Browse the full Core catalog filtered by category + max TL, buy items against
 * the mustering-out credit balance, and continue to the character sheet.
 */
export function EquipmentStep({ send }: EquipmentStepProps) {
  const credits = useCharacterStore((s) => s.credits);
  const ownedEquipment = useCharacterStore((s) => s.ownedEquipment);
  const addEquipment = useCharacterStore((s) => s.addEquipment);
  const spendCredits = useCharacterStore((s) => s.spendCredits);

  const [category, setCategory] = useState<EquipmentCategory | 'all'>('all');
  const [maxTL, setMaxTL] = useState<number | null>(null);

  const filtered = useMemo(
    () => filterCatalog(EQUIPMENT_CATALOG, category, maxTL),
    [category, maxTL],
  );

  const handleBuy = (item: Equipment) => {
    addEquipment(item);
    spendCredits(item.cost);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Equipment</h2>
        <p className="text-sm text-gray-400">
          Spend your mustering-out credits on gear from the Core catalog. Filter by category
          and tech level.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CategoryFilter
            category={category}
            maxTL={maxTL}
            onCategoryChange={setCategory}
            onMaxTLChange={setMaxTL}
          />
          <CatalogBrowser items={filtered} credits={credits} onBuy={handleBuy} />
        </div>

        <div className="space-y-4">
          <PurchaseCart credits={credits} owned={ownedEquipment} />
        </div>
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={() => send({ type: 'EQUIPMENT_COMPLETE' })}
      >
        Finish — Continue to Sheet
      </Button>
    </div>
  );
}
