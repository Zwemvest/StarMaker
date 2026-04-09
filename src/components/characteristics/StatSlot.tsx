import { DropSlot } from '../shared/DropSlot';
import { DiceDisplay } from '../shared/DiceDisplay';
import { characteristicModifier, type CharacteristicId } from '../../types/common';

interface StatSlotProps {
  id: CharacteristicId;
  slotIndex: number;
  value: number | null;
  dice: number[] | null;
  previewValue: number | null;
  onRemove?: () => void;
}

/** Format a DM as +N / -N / +0 */
function formatDM(dm: number): string {
  if (dm >= 0) return `+${dm}`;
  return `${dm}`;
}

/**
 * Droppable stat slot for characteristic assignment.
 * Shows the characteristic label, assigned value with DM,
 * and a faded DM preview when a value is being hovered.
 */
export function StatSlot({ id, slotIndex, value, dice, previewValue, onRemove }: StatSlotProps) {
  const isEmpty = value === null;
  const dm = value !== null ? characteristicModifier(value) : null;
  const previewDM = previewValue !== null ? characteristicModifier(previewValue) : null;

  return (
    <DropSlot id={`slot-${slotIndex}`} label={id} isEmpty={isEmpty} onRemove={onRemove}>
      {value !== null && dice !== null ? (
        <div className="flex flex-col items-center gap-1">
          <DiceDisplay dice={dice} total={value} />
          <span className="text-xs font-mono text-scanner-blue">
            DM {formatDM(dm!)}
          </span>
        </div>
      ) : previewValue !== null ? (
        <span className="text-xs font-mono text-scanner-blue/50">
          DM {formatDM(previewDM!)}
        </span>
      ) : (
        <span className="text-xs text-gray-500">Drop here</span>
      )}
    </DropSlot>
  );
}
