import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { calculatePension } from '../../engine/mustering-out';

interface ContinueLeaveCardProps {
  currentRank: string;
  termsInCareer: number;
  totalTerms: number;
  age: number;
  forcedToLeave: boolean;
  forcedToStay: boolean;
  onContinue: () => void;
  onChangeCareer: () => void;
  onMusterOut: () => void;
}

/**
 * Continue/Leave decision card shown at the end of each career term.
 * Implements D-07: push-your-luck decision with rank, age, and pension info.
 * Handles forced leave (CRER-13), forced stay (CRER-14), and normal choice.
 * Shows pension eligibility per D-16.
 */
export function ContinueLeaveCard({
  currentRank,
  totalTerms,
  age,
  forcedToLeave,
  forcedToStay,
  onContinue,
  onChangeCareer,
  onMusterOut,
}: ContinueLeaveCardProps) {
  const pension = calculatePension(totalTerms);
  const termsUntilPension = Math.max(0, 5 - totalTerms);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">End of Term</h2>
        <p className="text-sm text-gray-400">
          What will you do next?
        </p>
      </div>

      {/* Status card */}
      <Card>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rank</p>
            <p className="text-lg font-mono text-white font-bold">{currentRank}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Terms Served</p>
            <p className="text-lg font-mono text-white font-bold">{totalTerms}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Age</p>
            <p className="text-lg font-mono text-white font-bold">{age}</p>
          </div>
        </div>
      </Card>

      {/* Aging warnings (D-15) */}
      {age >= 34 && (
        <div className="flex items-start gap-2 px-3 py-2 bg-red-900/20 border border-red-700/40 rounded-lg">
          <span className="text-red-400 text-sm font-medium">Aging check required each term</span>
        </div>
      )}
      {age >= 30 && age < 34 && (
        <div className="flex items-start gap-2 px-3 py-2 bg-amber-900/20 border border-amber-700/40 rounded-lg">
          <span className="text-amber-400 text-sm">Aging effects begin at 34 — {Math.ceil((34 - age) / 4)} term{Math.ceil((34 - age) / 4) !== 1 ? 's' : ''} away</span>
        </div>
      )}

      {/* Pension info (D-16) */}
      <Card className="border-scanner-blue/30">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Pension Status</p>
        {totalTerms >= 5 ? (
          <p className="text-scanner-blue font-medium">
            Annual Pension: Cr{pension.toLocaleString()}/year
          </p>
        ) : totalTerms === 4 ? (
          <p className="text-amber-400 text-sm">
            One more term qualifies for Cr10,000/year pension!
          </p>
        ) : (
          <p className="text-gray-400 text-sm">
            {termsUntilPension} more term{termsUntilPension !== 1 ? 's' : ''} required for pension eligibility (5 terms minimum)
          </p>
        )}
      </Card>

      {/* Forced leave */}
      {forcedToLeave && (
        <div className="space-y-4">
          <div className="px-3 py-2 bg-red-900/30 border border-red-700/50 rounded-lg">
            <p className="text-red-300 text-sm font-medium">Your career has stalled. You must leave.</p>
          </div>
          <Button variant="secondary" onClick={onMusterOut} className="w-full">
            Muster Out
          </Button>
        </div>
      )}

      {/* Forced stay */}
      {forcedToStay && !forcedToLeave && (
        <div className="space-y-4">
          <div className="px-3 py-2 bg-green-900/30 border border-green-700/50 rounded-lg">
            <p className="text-green-300 text-sm font-medium">Your career is thriving! You must continue.</p>
          </div>
          <Button variant="primary" onClick={onContinue} className="w-full">
            Serve Another Term
          </Button>
        </div>
      )}

      {/* Normal choice */}
      {!forcedToLeave && !forcedToStay && (
        <div className="space-y-3">
          <Button variant="primary" onClick={onContinue} className="w-full">
            Serve Another Term
          </Button>

          <div className="space-y-1">
            <Button variant="secondary" onClick={onChangeCareer} className="w-full">
              Change Career
            </Button>
            <p className="text-xs text-gray-500 text-center">
              DM-1 penalty on next qualification roll (CRER-22).
              Cannot return to current career (CRER-24).
            </p>
          </div>

          <Button variant="ghost" onClick={onMusterOut} className="w-full">
            Muster Out
          </Button>
        </div>
      )}
    </div>
  );
}
