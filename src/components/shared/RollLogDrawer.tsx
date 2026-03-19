import { useCharacterStore } from '../../stores/character';
import { DiceDisplay } from './DiceDisplay';

interface RollLogDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function RollLogDrawer({ isOpen, onToggle }: RollLogDrawerProps) {
  const rollLog = useCharacterStore((s) => s.rollLog);

  return (
    <div
      className={`
        fixed bottom-10 left-0 right-0 bg-terminal-surface border-t border-gray-700
        transition-transform duration-200 ease-out z-40
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}
      style={{ maxHeight: '40vh' }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <span className="text-sm font-mono text-gray-400">
          Roll Log ({rollLog.length} entries)
        </span>
        <button
          onClick={onToggle}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(40vh - 40px)' }}>
        {rollLog.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No rolls yet
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {[...rollLog].reverse().map((entry) => (
              <div
                key={entry.id}
                className="px-4 py-2 flex items-center justify-between gap-4"
              >
                <span className="text-xs text-gray-400 font-mono truncate max-w-48">
                  {entry.context}
                </span>
                <div className="flex items-center gap-3">
                  <DiceDisplay
                    dice={entry.results}
                    total={entry.total}
                    modifier={entry.modifier}
                  />
                  {entry.success !== null && (
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        entry.success
                          ? 'bg-legitimate/20 text-legitimate'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {entry.success ? 'Pass' : 'Fail'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
