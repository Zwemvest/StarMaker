import type { OwnedEquipment } from '../../types/equipment';
import { equipmentKeyStat } from './equipment-display';

/**
 * Inner presentational content for the Equipment section, shared by the Dossier
 * (wrapped in a CollapsibleSection) and the final character sheet (wrapped in a
 * static Card). Renders the owned-equipment list with quantity and key stat.
 */
export function EquipmentList({ items }: { items: OwnedEquipment[] }) {
  return (
    <ul className="space-y-1">
      {items.map((owned) => (
        <li key={owned.item.name} className="flex items-center justify-between text-sm">
          <span className="text-gray-300">
            {owned.item.name}
            {owned.quantity > 1 && <span className="text-gray-500"> ×{owned.quantity}</span>}
          </span>
          <span className="font-mono text-xs text-scanner-blue">
            {equipmentKeyStat(owned.item)}
          </span>
        </li>
      ))}
    </ul>
  );
}
