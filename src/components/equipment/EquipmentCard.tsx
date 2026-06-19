import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { canAfford } from '../../engine/equipment';
import type { Equipment } from '../../types/equipment';

interface EquipmentCardProps {
  item: Equipment;
  credits: number;
  onBuy: (item: Equipment) => void;
}

/**
 * Per-item catalog card (EQUP-03/04).
 * Shows name, cost, TL, traits, and per-category stats; Buy is disabled when
 * the running balance cannot cover the cost.
 */
export function EquipmentCard({ item, credits, onBuy }: EquipmentCardProps) {
  const affordable = canAfford(credits, item.cost);

  return (
    <Card>
      <div data-equipment-card className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-white">{item.name}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{item.category}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-amber-400">Cr {item.cost.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-mono">TL{item.tl}</p>
          </div>
        </div>

        {/* Per-category stats (EQUP-04) */}
        <div className="text-xs font-mono text-gray-300">
          {item.category === 'weapons' ? (
            <span>
              Range {item.range} · Damage {item.damage}
              {item.magazine !== null ? ` · Mag ${item.magazine}` : ''}
            </span>
          ) : item.category === 'armour' ? (
            <span>
              Protection {item.protection}
              {item.rad > 0 ? ` · Rad ${item.rad}` : ''}
            </span>
          ) : (
            <span className="text-gray-400">{item.description}</span>
          )}
        </div>

        {item.traits.length > 0 && (
          <p className="text-xs text-scanner-blue font-mono">{item.traits.join(', ')}</p>
        )}

        <Button
          variant="primary"
          size="sm"
          disabled={!affordable}
          onClick={() => onBuy(item)}
        >
          Buy
        </Button>
      </div>
    </Card>
  );
}
