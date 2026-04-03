import { useState, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { resolveCommissionRoll, applyRankSkill } from '../../engine/career';
import { characteristicModifier } from '../../types/common';
import { useCharacterStore } from '../../stores/character';
import type { CheckTarget, CareerData } from '../../types/careers';

interface CommissionCardProps {
  commissionTarget: CheckTarget;
  characteristicValue: number;
  termsInCareer: number;
  career: CareerData;
  onResult: (success: boolean) => void;
}

type RollState = 'pending' | 'success' | 'failure';

/**
 * Commission roll card (D-06).
 *
 * Only shown for military careers when not yet commissioned.
 * Applies DM-1 per term after the first (CRER-11).
 * On success, grants officer rank 1 and applies bonus skill.
 */
export function CommissionCard({
  commissionTarget,
  characteristicValue,
  termsInCareer,
  career,
  onResult,
}: CommissionCardProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const addSkill = useCharacterStore((s) => s.addSkill);
  const [rollState, setRollState] = useState<RollState>('pending');
  const [rollTotal, setRollTotal] = useState(0);

  const characteristicDM = characteristicModifier(characteristicValue);
  // DM-1 per term after first (CRER-11)
  const termPenalty = termsInCareer > 1 ? -(termsInCareer - 1) : 0;
  const totalDM = characteristicDM + termPenalty;

  const handleRoll = useCallback(async () => {
    const roll = await loggedRoll2D(
      `career.commission.${career.name}`,
      totalDM,
      commissionTarget.target,
    );

    const diceTotal = roll.results.reduce((a, b) => a + b, 0);
    setRollTotal(roll.total);

    const result = resolveCommissionRoll(
      diceTotal,
      totalDM,
      commissionTarget.target,
      termsInCareer,
    );

    if (result.success) {
      setRollState('success');

      // Apply officer rank 1 bonus skill
      const rankSkill = applyRankSkill(career, 1, true);
      if (rankSkill) {
        addSkill(rankSkill.skill, rankSkill.level);
      }

      setTimeout(() => onResult(true), 1500);
    } else {
      setRollState('failure');
      setTimeout(() => onResult(false), 1000);
    }
  }, [loggedRoll2D, career, totalDM, commissionTarget.target, termsInCareer, addSkill, onResult]);

  return (
    <Card
      className={`transition-all duration-500 ${
        rollState === 'success'
          ? 'border-legitimate/60'
          : rollState === 'failure'
            ? 'border-gray-600'
            : 'border-gray-700'
      }`}
      glowColor={rollState === 'success' ? '#22c55e' : undefined}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-sans font-medium text-white">Commission Roll</h3>
          <p className="text-sm text-gray-400 mt-1">
            Apply for an officer commission in the {career.name}.
          </p>
        </div>

        {/* Roll info */}
        <div className="space-y-1">
          <p className="text-sm text-gray-300">
            Target:{' '}
            <span className="text-scanner-blue font-mono font-bold">
              {commissionTarget.characteristic} {commissionTarget.target}+
            </span>
          </p>
          <p className="text-sm text-gray-300">
            {commissionTarget.characteristic} DM:{' '}
            <span className="font-mono">
              {characteristicDM >= 0 ? `+${characteristicDM}` : characteristicDM}
            </span>
          </p>
          {termPenalty < 0 && (
            <p className="text-sm text-modified">
              Term penalty:{' '}
              <span className="font-mono">{termPenalty}</span>
              <span className="text-xs text-gray-500 ml-1">
                (-1 per term after first)
              </span>
            </p>
          )}
          <p className="text-sm text-gray-300">
            Total DM:{' '}
            <span className="font-mono font-bold">
              {totalDM >= 0 ? `+${totalDM}` : totalDM}
            </span>
          </p>
        </div>

        {/* Pending state */}
        {rollState === 'pending' && (
          <Button variant="primary" size="md" onClick={handleRoll} className="w-full">
            Roll for Commission
          </Button>
        )}

        {/* Success state */}
        {rollState === 'success' && (
          <div className="text-center space-y-2">
            <p className="text-3xl font-mono font-bold text-legitimate">{rollTotal}</p>
            <p className="text-lg font-sans font-medium text-legitimate">
              Commissioned!
            </p>
            <p className="text-sm text-gray-400">
              You have been granted an officer commission.
            </p>
          </div>
        )}

        {/* Failure state */}
        {rollState === 'failure' && (
          <div className="text-center space-y-2">
            <p className="text-3xl font-mono font-bold text-gray-500">{rollTotal}</p>
            <p className="text-lg font-sans font-medium text-gray-400">
              Not Commissioned
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
