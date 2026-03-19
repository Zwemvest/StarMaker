import { DragPool } from '../shared/DragPool';
import { DiceDisplay } from '../shared/DiceDisplay';

/** A rolled value in the characteristics pool */
export interface PoolItem {
  id: string;
  dice: number[];
  total: number;
}

interface DicePoolProps {
  items: PoolItem[];
  disabled?: boolean;
}

/**
 * Pool of rolled but unassigned characteristic values.
 * Each item shows individual die chips via DiceDisplay.
 * Uses the shared DragPool for dnd-kit drag behavior.
 */
export function DicePool({ items, disabled = false }: DicePoolProps) {
  return (
    <DragPool<PoolItem>
      items={items}
      getId={(item) => item.id}
      disabled={disabled}
      renderItem={(item) => (
        <div className="px-3 py-2 rounded-lg bg-terminal-surface border border-gray-600 cursor-grab active:cursor-grabbing hover:border-scanner-blue transition-colors">
          <DiceDisplay dice={item.dice} total={item.total} />
        </div>
      )}
    />
  );
}
