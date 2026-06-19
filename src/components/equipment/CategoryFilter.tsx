import type { EquipmentCategory } from '../../types/equipment';

interface CategoryFilterProps {
  category: EquipmentCategory | 'all';
  maxTL: number | null;
  onCategoryChange: (category: EquipmentCategory | 'all') => void;
  onMaxTLChange: (maxTL: number | null) => void;
}

const CATEGORIES: readonly (EquipmentCategory | 'all')[] = [
  'all',
  'weapons',
  'armour',
  'survival',
  'electronics',
  'medical',
  'tools',
];

/**
 * Category + max-TL filter controls (EQUP-02).
 */
export function CategoryFilter({
  category,
  maxTL,
  onCategoryChange,
  onMaxTLChange,
}: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`rounded-lg px-3 py-1 text-sm font-sans capitalize transition-colors ${
              category === cat
                ? 'bg-scanner-blue text-terminal-bg'
                : 'bg-terminal-surface text-gray-300 hover:text-white border border-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="maxTL" className="text-xs text-gray-500 uppercase tracking-wide">
          Max TL
        </label>
        <select
          id="maxTL"
          value={maxTL === null ? 'any' : String(maxTL)}
          onChange={(e) =>
            onMaxTLChange(e.target.value === 'any' ? null : Number(e.target.value))
          }
          className="rounded-lg bg-terminal-surface border border-gray-600 px-2 py-1 text-sm font-mono text-white"
        >
          <option value="any">Any</option>
          {Array.from({ length: 16 }, (_, i) => i).map((tl) => (
            <option key={tl} value={tl}>
              {tl}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
