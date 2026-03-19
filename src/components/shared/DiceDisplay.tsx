interface DiceDisplayProps {
  dice: number[];
  total: number;
  modifier?: number;
}

export function DiceDisplay({ dice, total, modifier = 0 }: DiceDisplayProps) {
  return (
    <span className="inline-flex items-center gap-1 font-mono">
      {dice.map((die, i) => (
        <span
          key={i}
          className="inline-flex items-center justify-center w-7 h-7 rounded bg-terminal-surface border border-gray-600 text-sm text-white"
        >
          {die}
        </span>
      ))}
      {modifier !== 0 && (
        <span className="text-sm text-gray-400">
          {modifier > 0 ? `+${modifier}` : modifier}
        </span>
      )}
      <span className="text-sm text-gray-400">=</span>
      <span className="text-base text-scanner-blue font-bold">{total}</span>
    </span>
  );
}
