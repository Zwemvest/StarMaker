import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface PsiGateProps {
  onSkip: () => void;
  onForce: () => void;
}

/**
 * Locked-state psionics gate (D-2).
 *
 * By the rules, psionic testing requires a triggering event. The legitimate
 * path is to skip. A clearly-secondary "Test anyway" path exists for players
 * who knowingly want to roll, but it requires an explicit confirm before the
 * character is flipped to ▲ Modified.
 */
export function PsiGate({ onSkip, onForce }: PsiGateProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Psionic Testing</h2>
        <p className="text-sm text-gray-400">
          Your character was never flagged for psionic potential. By the rules, testing
          requires a triggering event — so the legitimate path is to skip.
        </p>
      </div>
      <Card>
        <div className="space-y-4">
          <Button variant="primary" className="w-full" onClick={onSkip}>
            Skip Psionic Testing
          </Button>
          {!confirming ? (
            <button
              type="button"
              className="w-full text-xs text-gray-500 underline hover:text-gray-300"
              onClick={() => setConfirming(true)}
            >
              Test anyway (untested path)
            </button>
          ) : (
            <div className="space-y-3 rounded-lg border border-amber-700 bg-amber-950/20 p-3">
              <p className="text-xs text-amber-300">
                Testing without a trigger flips your character to ▲ Modified (logged). Continue?
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={onForce}>
                  Yes, test anyway
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
