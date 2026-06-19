import { EquipmentCard } from './EquipmentCard';
import type { Equipment } from '../../types/equipment';

interface CatalogBrowserProps {
  items: Equipment[];
  credits: number;
  onBuy: (item: Equipment) => void;
}

/**
 * Filtered catalog list (EQUP-02). Renders one EquipmentCard per item.
 */
export function CatalogBrowser({ items, credits, onBuy }: CatalogBrowserProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center">
        No items match the current filter.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <EquipmentCard key={item.name} item={item} credits={credits} onBuy={onBuy} />
      ))}
    </div>
  );
}
