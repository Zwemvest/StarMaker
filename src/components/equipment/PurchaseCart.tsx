import { Card } from '../ui/Card';
import type { OwnedEquipment } from '../../types/equipment';

interface PurchaseCartProps {
  credits: number;
  owned: OwnedEquipment[];
}

/**
 * Running credit balance + owned items list (EQUP-03).
 */
export function PurchaseCart({ credits, owned }: PurchaseCartProps) {
  return (
    <Card>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Balance</p>
          <p className="font-mono text-green-400 font-bold text-xl">
            Cr {credits.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Owned</p>
          {owned.length === 0 ? (
            <p className="text-sm text-gray-500">No equipment purchased yet.</p>
          ) : (
            <ul className="space-y-1">
              {owned.map((o) => (
                <li
                  key={o.item.name}
                  className="flex justify-between text-sm font-mono text-gray-300"
                >
                  <span>{o.item.name}</span>
                  <span className="text-gray-500">×{o.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
