import { useState } from 'react';
import type { CareerTerm } from '../../types/careers';
import { TermSummary } from './TermSummary';

interface CurrentTermInfo {
  career: string;
  assignment: string;
  rank: number;
  termNumber: number;
}

interface TermTimelineProps {
  careerHistory: CareerTerm[];
  currentTerm?: CurrentTermInfo;
}

/**
 * Vertical timeline of career terms (D-02).
 * Completed terms shown as collapsed summary rows.
 * Current term shown expanded with details.
 * Uses Tailwind timeline line + dots pattern.
 */
export function TermTimeline({ careerHistory, currentTerm }: TermTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (careerHistory.length === 0 && !currentTerm) return null;

  const handleToggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Career History</p>
      <div className="relative">
        {/* Vertical timeline line */}
        {careerHistory.length > 0 && (
          <div className="absolute left-[1.1rem] top-0 bottom-0 w-px bg-gray-700" />
        )}

        <div className="space-y-2">
          {careerHistory.map((term, index) => (
            <div key={index} className="relative flex gap-3">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0 w-[1.375rem] flex items-start justify-center pt-2">
                <div className="w-2 h-2 rounded-full bg-gray-600 border border-gray-500" />
              </div>
              {/* Term card */}
              <div className="flex-1 min-w-0">
                <TermSummary
                  term={term}
                  isExpanded={expandedIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              </div>
            </div>
          ))}

          {/* Current term */}
          {currentTerm && (
            <div className="relative flex gap-3">
              <div className="relative z-10 flex-shrink-0 w-[1.375rem] flex items-start justify-center pt-2">
                <div className="w-2.5 h-2.5 rounded-full bg-scanner-blue border border-scanner-blue/60 shadow-[0_0_6px_1px] shadow-scanner-blue/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="border border-scanner-blue/50 bg-terminal-surface/60 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-scanner-blue font-mono w-8">T{currentTerm.termNumber}</span>
                      <span className="text-sm text-white font-medium capitalize">{currentTerm.career}</span>
                      <span className="text-xs text-gray-400">{currentTerm.assignment}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-scanner-blue font-mono">Rank {currentTerm.rank}</span>
                      <span className="text-xs text-scanner-blue/60 italic">Current</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
