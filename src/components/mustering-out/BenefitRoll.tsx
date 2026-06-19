import { useState, useCallback } from 'react';
import type { CareerData } from '../../types/careers';
import { canRollCash } from '../../engine/mustering-out';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { useCharacterStore } from '../../stores/character';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface BenefitRollProps {
  career: CareerData;
  rollNumber: number;
  totalRolls: number;
  cashRollsUsed: number;
  rankDM: number;
  onRolled: (type: 'cash' | 'benefits') => void;
}

/**
 * Single benefit roll card (D-14).
 * Cash table max 3 rolls lifetime (MSTR-01).
 * Rank DM applies to benefits table for rank 5-6 (MSTR-02).
 */
export function BenefitRoll({
  career,
  rollNumber,
  totalRolls,
  cashRollsUsed,
  rankDM,
  onRolled,
}: BenefitRollProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const addCredits = useCharacterStore((s) => s.addCredits);
  const addBenefit = useCharacterStore((s) => s.addBenefit);
  const incrementCashRolls = useCharacterStore((s) => s.incrementCashRolls);

  const [result, setResult] = useState<{
    type: 'cash' | 'benefits';
    value: string;
    roll: number;
  } | null>(null);
  const [rolling, setRolling] = useState(false);

  const cashAllowed = canRollCash(cashRollsUsed);

  const handleRoll = useCallback(async (type: 'cash' | 'benefits') => {
    setRolling(true);
    const context = `Mustering Out ${type === 'cash' ? 'Cash' : 'Benefits'}`;
    const entry = await loggedRoll2D(context);

    let rollIndex: number;
    let resultValue: string;

    if (type === 'cash') {
      // Cash: 1D equivalent using one die, 0-indexed
      const roll1D = Math.max(1, Math.min(6, entry.results[0] ?? 1));
      const gambler = 0; // TODO: could check for Gambler skill
      rollIndex = Math.min(roll1D + gambler - 1, career.musteringOut.cash.length - 1);
      const credits = career.musteringOut.cash[rollIndex] ?? 0;
      resultValue = `Cr${credits.toLocaleString()}`;
      addCredits(credits);
      incrementCashRolls();
    } else {
      // Benefits: 1D + rankDM, clamped to table size
      const roll1D = Math.max(1, Math.min(6, entry.results[0] ?? 1));
      rollIndex = Math.max(0, Math.min(roll1D + rankDM - 1, career.musteringOut.benefits.length - 1));
      const benefit = career.musteringOut.benefits[rollIndex] ?? 'Unknown benefit';
      resultValue = benefit;
      addBenefit(benefit);
    }

    setResult({ type, value: resultValue, roll: rollIndex + 1 });
    setRolling(false);
    onRolled(type);
  }, [loggedRoll2D, career, rankDM, addCredits, addBenefit, incrementCashRolls, onRolled]);

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white">
            Roll {rollNumber} of {totalRolls}
          </p>
          {rankDM > 0 && (
            <p className="text-xs text-scanner-blue">Benefits DM+{rankDM} (high rank)</p>
          )}
        </div>

        {!result ? (
          <div className="flex gap-3">
            <div className="flex-1">
              <Button
                variant="primary"
                className="w-full"
                disabled={!cashAllowed || rolling}
                onClick={() => handleRoll('cash')}
              >
                Cash Table
              </Button>
              {!cashAllowed && (
                <p className="text-xs text-amber-400 text-center mt-1">(Max 3 reached)</p>
              )}
              {cashAllowed && (
                <p className="text-xs text-gray-500 text-center mt-1">
                  {cashRollsUsed}/3 cash rolls used
                </p>
              )}
            </div>
            <div className="flex-1">
              <Button
                variant="secondary"
                className="w-full"
                disabled={rolling}
                onClick={() => handleRoll('benefits')}
              >
                Benefits Table
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-3 py-2 bg-terminal-bg/40 border border-scanner-blue/30 rounded">
            <p className="text-xs text-gray-500 capitalize">{result.type} Table — Roll {result.roll}</p>
            <p className="text-lg font-bold text-scanner-blue mt-0.5">{result.value}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
