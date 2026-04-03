import { useState, useCallback } from 'react';
import type { AssignmentData } from '../../types/careers';
import { resolveSurvivalRoll } from '../../engine/career';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { characteristicModifier } from '../../types/common';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface SurvivalRollProps {
  assignment: AssignmentData;
  characteristicValue: number;
  onSurvived: () => void;
  onMishap: (rollValue: number) => void;
}

/**
 * Dramatic survival roll card (D-05).
 * Handles natural 2 always-fail (CRER-07) with special messaging.
 */
export function SurvivalRoll({ assignment, characteristicValue, onSurvived, onMishap }: SurvivalRollProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const [rolled, setRolled] = useState(false);
  const [result, setResult] = useState<{
    diceTotal: number;
    dm: number;
    survived: boolean;
    naturalTwo: boolean;
    mishapRoll: number;
  } | null>(null);
  const [rolling, setRolling] = useState(false);

  const dm = characteristicModifier(characteristicValue);
  const { characteristic, target } = assignment.survival;

  const handleRoll = useCallback(async () => {
    setRolling(true);
    const entry = await loggedRoll2D('Career Survival Roll', dm, target);
    const diceTotal = entry.results.reduce((a, b) => a + b, 0);
    const resolution = resolveSurvivalRoll(diceTotal, dm, target);

    let mishapRoll = 0;
    if (!resolution.survived) {
      // Roll 1D for mishap table (done synchronously for display)
      mishapRoll = Math.ceil(Math.random() * 6);
    }

    setResult({
      diceTotal,
      dm,
      survived: resolution.survived,
      naturalTwo: resolution.naturalTwo,
      mishapRoll,
    });
    setRolled(true);
    setRolling(false);
  }, [loggedRoll2D, dm, target]);

  const handleContinue = useCallback(() => {
    if (!result) return;
    if (result.survived) {
      onSurvived();
    } else {
      onMishap(result.mishapRoll);
    }
  }, [result, onSurvived, onMishap]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Survival Roll</h2>
        <p className="text-sm text-gray-400">
          Roll 2D against your survival target. Failure means a mishap — forced career exit.
        </p>
      </div>

      <Card>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Survival Target</p>
              <p className="text-2xl font-mono font-bold text-white">
                {characteristic} {target}+
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your DM</p>
              <p className={`text-2xl font-mono font-bold ${dm >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {dm >= 0 ? `+${dm}` : dm}
              </p>
            </div>
          </div>

          {!rolled && (
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold tracking-wide"
              onClick={handleRoll}
              disabled={rolling}
            >
              {rolling ? 'Rolling...' : 'Roll for Survival'}
            </Button>
          )}
        </div>
      </Card>

      {result && (
        <Card className={result.survived ? 'border-green-700/50 bg-green-900/10' : 'border-red-700/50 bg-red-900/10'}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Result</p>
                <p className={`text-3xl font-mono font-bold ${result.survived ? 'text-green-400' : 'text-red-400'}`}>
                  {result.diceTotal} + ({dm >= 0 ? `+${dm}` : dm}) = {result.diceTotal + dm}
                </p>
              </div>
              <div className="text-right">
                {result.survived ? (
                  <p className="text-2xl font-bold text-green-400">SURVIVED</p>
                ) : (
                  <p className="text-2xl font-bold text-red-400">MISHAP!</p>
                )}
              </div>
            </div>

            {result.naturalTwo && (
              <div className="px-3 py-2 bg-red-900/30 border border-red-700 rounded">
                <p className="text-red-300 font-bold text-center">
                  Natural 2 — Automatic Failure! (CRER-07)
                </p>
              </div>
            )}

            <Button
              variant={result.survived ? 'primary' : 'secondary'}
              className="w-full"
              onClick={handleContinue}
            >
              {result.survived ? 'Continue to Event' : 'See Mishap'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
