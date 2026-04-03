import { useState, useCallback } from 'react';
import type { CharacteristicCheck } from '../../types/careers';
import { resolveCommissionRoll, applyRankSkill } from '../../engine/career';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { characteristicModifier } from '../../types/common';
import { useCharacterStore } from '../../stores/character';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { CareerData } from '../../types/careers';

interface CommissionCardProps {
  career: CareerData;
  commissionTarget: CharacteristicCheck;
  characteristicValue: number;
  termsInCareer: number;
  onResult: (success: boolean) => void;
}

/**
 * Commission roll card for military careers (D-06).
 * Applies DM-1 per term after the first (CRER-11).
 * On success, grants rank 1 officer bonus skill (CRER-15).
 */
export function CommissionCard({
  career,
  commissionTarget,
  characteristicValue,
  termsInCareer,
  onResult,
}: CommissionCardProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const addSkill = useCharacterStore((s) => s.addSkill);

  const [rolled, setRolled] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{ success: boolean; total: number; diceTotal: number } | null>(null);

  const charDM = characteristicModifier(characteristicValue);
  const termPenalty = -Math.max(0, termsInCareer - 1);
  const totalDM = charDM + termPenalty;

  const handleRoll = useCallback(async () => {
    setRolling(true);
    const entry = await loggedRoll2D('Commission Roll', charDM, commissionTarget.target);
    const diceTotal = entry.results.reduce((a, b) => a + b, 0);
    const res = resolveCommissionRoll(diceTotal, charDM, commissionTarget.target, termsInCareer);

    if (res.success) {
      // Apply rank 1 officer bonus skill
      const bonus = applyRankSkill(career, 1, true);
      if (bonus) {
        addSkill(bonus.skill, bonus.level);
      }
    }

    setResult({ success: res.success, total: res.total, diceTotal });
    setRolled(true);
    setRolling(false);
  }, [loggedRoll2D, charDM, commissionTarget, termsInCareer, career, addSkill]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Commission Roll</h2>
        <p className="text-sm text-gray-400">Roll 2D — success means you become an Officer.</p>
      </div>

      <Card>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Target</p>
              <p className="font-mono text-white font-bold">
                {commissionTarget.characteristic} {commissionTarget.target}+
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Char DM</p>
              <p className={`font-mono font-bold ${charDM >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {charDM >= 0 ? `+${charDM}` : charDM}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Term Penalty</p>
              <p className={`font-mono font-bold ${termPenalty < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {termPenalty === 0 ? '0' : termPenalty}
              </p>
            </div>
          </div>

          {!rolled && (
            <Button
              variant="primary"
              className="w-full"
              onClick={handleRoll}
              disabled={rolling}
            >
              {rolling ? 'Rolling...' : 'Roll for Commission'}
            </Button>
          )}
        </div>
      </Card>

      {result && (
        <Card className={result.success ? 'border-green-700/50' : 'border-gray-600'}>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              Rolled {result.diceTotal} + ({totalDM >= 0 ? `+${totalDM}` : totalDM}) = {result.total}
            </p>
            <p className={`text-xl font-bold ${result.success ? 'text-green-400' : 'text-gray-400'}`}>
              {result.success ? 'Commissioned! You are now an Officer.' : 'Not Commissioned.'}
            </p>
            <Button variant={result.success ? 'primary' : 'secondary'} className="w-full" onClick={() => onResult(result.success)}>
              Continue
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
