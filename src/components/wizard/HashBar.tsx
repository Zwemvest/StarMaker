import { useState } from 'react';
import { useCharacterStore } from '../../stores/character';
import { RollLogDrawer } from '../shared/RollLogDrawer';

export function HashBar() {
  const legitimacyHash = useCharacterStore((s) => s.legitimacyHash);
  const isModified = useCharacterStore((s) => s.isModified);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const displayHash = legitimacyHash
    ? legitimacyHash.substring(0, 8)
    : '--------';

  return (
    <>
      <RollLogDrawer
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen((o) => !o)}
      />

      <footer className="fixed bottom-0 left-0 right-0 h-10 bg-terminal-surface border-t border-gray-700 flex items-center justify-between px-4 z-50">
        {/* Left: Hash */}
        <span className="font-mono text-sm text-gray-400 tracking-wider">
          {displayHash}
        </span>

        {/* Center: Legitimacy badge */}
        <span
          className={`
            text-xs font-mono px-3 py-1 rounded-full border
            ${isModified
              ? 'border-modified text-modified bg-modified/10'
              : 'border-legitimate text-legitimate bg-legitimate/10'
            }
          `}
        >
          {isModified ? 'Modified' : 'Legitimate'}
        </span>

        {/* Right: Roll Log toggle */}
        <button
          onClick={() => setIsDrawerOpen((o) => !o)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors font-mono"
        >
          <span>Roll Log</span>
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${isDrawerOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </footer>
    </>
  );
}
