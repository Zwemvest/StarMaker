import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface PensionSummaryProps {
  totalTerms: number;
  totalCredits: number;
  benefits: string[];
  pension: number;
  onComplete: () => void;
}

/**
 * Mustering out summary card (D-16).
 * Shows total credits, benefit items, and pension for 5+ terms (MSTR-03).
 * "Complete Character Creation" button dispatches MUSTERING_COMPLETE.
 */
export function PensionSummary({ totalTerms, totalCredits, benefits, pension, onComplete }: PensionSummaryProps) {
  const hasPension = totalTerms >= 5;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Mustering Out Complete</h2>
        <p className="text-sm text-gray-400">
          You have served {totalTerms} term{totalTerms !== 1 ? 's' : ''} across your career.
        </p>
      </div>

      {/* Pension — prominent if earned */}
      {hasPension && (
        <Card className="border-scanner-blue/50 bg-scanner-blue/5">
          <div className="text-center space-y-1">
            <p className="text-xs text-scanner-blue uppercase tracking-wide">Annual Pension</p>
            <p className="text-3xl font-mono font-bold text-scanner-blue">
              Cr{pension.toLocaleString()}/year
            </p>
            <p className="text-xs text-gray-400">
              Earned after {totalTerms} terms of service (MSTR-03)
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credits */}
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Credits Earned</p>
          <p className="text-2xl font-mono font-bold text-white">
            Cr{totalCredits.toLocaleString()}
          </p>
        </Card>

        {/* Benefits */}
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Benefits ({benefits.length})
          </p>
          {benefits.length > 0 ? (
            <ul className="space-y-1">
              {benefits.map((benefit, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                  <span className="text-scanner-blue">·</span>
                  {benefit}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No benefit items received.</p>
          )}
        </Card>
      </div>

      {!hasPension && totalTerms === 4 && (
        <div className="px-3 py-2 bg-amber-900/20 border border-amber-700/40 rounded-lg">
          <p className="text-amber-400 text-sm">
            One more term would have qualified for a pension. Better luck next time!
          </p>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={onComplete}
      >
        Complete Character Creation
      </Button>
    </div>
  );
}
