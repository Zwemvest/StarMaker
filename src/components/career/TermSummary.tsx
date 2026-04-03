import type { CareerTerm } from '../../types/careers';

interface TermSummaryProps {
  term: CareerTerm;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * A single term in the career timeline.
 * Collapsed: shows career name, rank, term number on one row.
 * Expanded: shows skills gained, events, survival status.
 */
export function TermSummary({ term, isExpanded, onToggle }: TermSummaryProps) {
  return (
    <div
      className={`border rounded-lg cursor-pointer transition-colors ${
        isExpanded
          ? 'border-scanner-blue/50 bg-terminal-surface/60'
          : 'border-gray-700 bg-terminal-surface/30 hover:border-gray-600'
      }`}
      onClick={onToggle}
    >
      {/* Collapsed header — always visible */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono w-8">T{term.term}</span>
          <span className="text-sm text-white font-medium capitalize">{term.career}</span>
          <span className="text-xs text-gray-400">{term.assignment}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-scanner-blue font-mono">Rank {term.rank}</span>
          <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-700/50 space-y-2 pt-2">
          {term.skills.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Skills Gained</p>
              <div className="flex flex-wrap gap-1">
                {term.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-scanner-blue/10 border border-scanner-blue/30 rounded text-xs text-scanner-blue font-mono"
                  >
                    {skill.name} {skill.level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {term.events.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Events</p>
              <ul className="space-y-0.5">
                {term.events.map((event, i) => (
                  <li key={i} className="text-xs text-gray-400 truncate">
                    {event}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {term.skills.length === 0 && term.events.length === 0 && (
            <p className="text-xs text-gray-500 italic">No additional details recorded.</p>
          )}
        </div>
      )}
    </div>
  );
}
