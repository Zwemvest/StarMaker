import { useState, useCallback } from 'react';
import { probability2DAtLeast } from '../../engine/dice';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { Button } from '../ui/Button';
import type { RollLogEntry } from '../../types/dice';

interface DiceRollButtonProps {
  /** Button label, e.g. "Roll for Qualification" */
  label: string;
  /** Dot-path context passed to loggedRoll2D, e.g. "career.qualification.army" */
  context: string;
  /** Target number to beat or equal (for odds calculation) */
  target: number;
  /** Dice modifier applied to the roll */
  dm: number;
  /** Callback invoked after a successful roll */
  onRolled: (entry: RollLogEntry, diceTotal: number) => void;
  /** Disable the button (in addition to the rolling state) */
  disabled?: boolean;
  /** Show DM breakdown as a tooltip on hover (default: true) */
  showBreakdown?: boolean;
  /** Button color variant */
  variant?: 'primary' | 'secondary';
  /** Extra class names on the outer wrapper */
  className?: string;
}

/**
 * Reusable dice-roll button primitive.
 *
 * Wraps useLoggedRoll2D + Button + an odds pill. Computes odds via
 * probability2DAtLeast(target, dm) and colors them green (>=50%) or
 * amber (<50%). Automatically disables itself while the roll is in
 * flight, and emits both the RollLogEntry and the raw dice total via
 * onRolled so callers can use either representation.
 */
export function DiceRollButton({
  label,
  context,
  target,
  dm,
  onRolled,
  disabled = false,
  showBreakdown = true,
  variant = 'primary',
  className = '',
}: DiceRollButtonProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const [rolling, setRolling] = useState(false);

  const odds = probability2DAtLeast(target, dm);
  const oddsColor =
    odds >= 50
      ? 'text-green-400 border-green-700'
      : 'text-amber-400 border-amber-700';
  const dmStr = dm >= 0 ? `+${dm}` : `${dm}`;
  const tooltip = showBreakdown ? `Target ${target}+, DM ${dmStr}` : undefined;

  const handleClick = useCallback(async () => {
    if (rolling || disabled) return;
    setRolling(true);
    try {
      const entry = await loggedRoll2D(context, dm, target);
      const diceTotal = entry.results.reduce((a, b) => a + b, 0);
      onRolled(entry, diceTotal);
    } finally {
      setRolling(false);
    }
  }, [rolling, disabled, loggedRoll2D, context, dm, target, onRolled]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={variant}
        onClick={handleClick}
        disabled={rolling || disabled}
        title={tooltip}
        className="flex-1"
      >
        {rolling ? 'Rolling...' : label}
      </Button>
      <span
        className={`px-2 py-1 rounded border text-xs font-mono ${oddsColor} bg-terminal-surface`}
        title={tooltip}
      >
        {odds}%
      </span>
    </div>
  );
}
