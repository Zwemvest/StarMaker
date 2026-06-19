import { useCharacterStore } from '../../stores/character';

/**
 * Prominent Legitimate-vs-Modified indicator plus the legitimacy hash.
 * Reads the store directly so it can be dropped anywhere (sheet, near HashBar).
 * SHEE-04 (legitimacy verification) + SHEE-05 (Legitimate/Modified indicator).
 */
export function LegitimacyBadge({ className = '' }: { className?: string }) {
  const isModified = useCharacterStore((s) => s.isModified);
  const legitimacyHash = useCharacterStore((s) => s.legitimacyHash);

  return (
    <div
      className={`flex flex-col gap-2 rounded border p-4 ${
        isModified
          ? 'border-modified bg-modified/10'
          : 'border-legitimate bg-legitimate/10'
      } ${className}`}
    >
      <span
        className={`text-lg font-sans font-medium ${
          isModified ? 'text-modified' : 'text-legitimate'
        }`}
      >
        {isModified ? '▲ Modified' : '● Legitimate'}
      </span>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Legitimacy Hash</p>
        <p className="font-mono text-xs text-gray-400 break-all">
          {legitimacyHash || '—'}
        </p>
      </div>
    </div>
  );
}
