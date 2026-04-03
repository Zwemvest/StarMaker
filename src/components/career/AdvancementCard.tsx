import { useState, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { resolveAdvancementRoll, applyRankSkill } from '../../engine/career';
import { characteristicModifier } from '../../types/common';
import { useCharacterStore } from '../../stores/character';
import type { CheckTarget, CareerData } from '../../types/careers';

interface AdvancementResult {
  advanced: boolean;
  forcedToLeave: boolean;
  forcedToStay: boolean;
}

interface AdvancementCardProps {
  advancementTarget: CheckTarget;
  characteristicValue: number;
  termsServed: number;
  isOfficer: boolean;
  currentRank: number;
  career: CareerData;
  onResult: (result: AdvancementResult) => void;
}

type RollState = 'pending' | 'advanced' | 'not-advanced' | 'forced-leave' | 'forced-stay';

/**
 * Advancement roll card (D-06).
 *
 * Handles promotion within a career. Detects:
 * - Forced to leave: advancement roll total <= terms served (CRER-13)
 * - Forced to stay: natural 12 locks Traveller in (CRER-14)
 * - Rank bonus skills applied on promotion (CRER-15)
 */
export function AdvancementCard({
  advancementTarget,
  characteristicValue,
  termsServed,
  isOfficer,
  currentRank,
  career,
  onResult,
}: AdvancementCardProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const addSkill = useCharacterStore((s) => s.addSkill);
  const [rollState, setRollState] = useState<RollState>('pending');
  const [rollTotal, setRollTotal] = useState(0);
  const [forcedToLeave, setForcedToLeave] = useState(false);
  const [forcedToStay, setForcedToStay] = useState(false);

  const characteristicDM = characteristicModifier(characteristicValue);

  const handleRoll = useCallback(async () => {
    const roll = await loggedRoll2D(
      `career.advancement.${career.name}`,
      characteristicDM,
      advancementTarget.target,
    );

    const diceTotal = roll.results.reduce((a, b) => a + b, 0);
    setRollTotal(roll.total);

    const result = resolveAdvancementRoll(
      diceTotal,
      characteristicDM,
      advancementTarget.target,
      termsServed,
    );

    setForcedToLeave(result.forcedToLeave);
    setForcedToStay(result.forcedToStay);

    if (result.advanced) {
      setRollState('advanced');

      // Apply rank bonus skill on promotion (CRER-15)
      const newRank = currentRank + 1;
      const rankSkill = applyRankSkill(career, newRank, isOfficer);
      if (rankSkill) {
        addSkill(rankSkill.skill, rankSkill.level);
      }
    } else if (result.forcedToLeave) {
      setRollState('forced-leave');
    } else {
      setRollState('not-advanced');
    }

    // Also check for forced stay (natural 12) — can be true even if advanced
    if (result.forcedToStay) {
      setRollState('forced-stay');
    }

    setTimeout(
      () =>
        onResult({
          advanced: result.advanced,
          forcedToLeave: result.forcedToLeave,
          forcedToStay: result.forcedToStay,
        }),
      1500,
    );
  }, [
    loggedRoll2D,
    career,
    characteristicDM,
    advancementTarget.target,
    termsServed,
    currentRank,
    isOfficer,
    addSkill,
    onResult,
  ]);

  return (
    <Card
      className={`transition-all duration-500 ${
        rollState === 'advanced' || rollState === 'forced-stay'
          ? 'border-legitimate/60'
          : rollState === 'forced-leave'
            ? 'border-modified/60'
            : 'border-gray-700'
      }`}
      glowColor={
        rollState === 'advanced' || rollState === 'forced-stay'
          ? '#22c55e'
          : rollState === 'forced-leave'
            ? '#ef4444'
            : undefined
      }
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-sans font-medium text-white">Advancement Roll</h3>
          <p className="text-sm text-gray-400 mt-1">
            Can you earn a promotion this term?
          </p>
        </div>

        {/* Roll info */}
        <div className="space-y-1">
          <p className="text-sm text-gray-300">
            Target:{' '}
            <span className="text-scanner-blue font-mono font-bold">
              {advancementTarget.characteristic} {advancementTarget.target}+
            </span>
          </p>
          <p className="text-sm text-gray-300">
            {advancementTarget.characteristic} DM:{' '}
            <span className="font-mono">
              {characteristicDM >= 0 ? `+${characteristicDM}` : characteristicDM}
            </span>
          </p>
        </div>

        {/* Pending state */}
        {rollState === 'pending' && (
          <Button variant="primary" size="md" onClick={handleRoll} className="w-full">
            Roll for Advancement
          </Button>
        )}

        {/* Advanced state */}
        {rollState === 'advanced' && (
          <div className="text-center space-y-2">
            <p className="text-3xl font-mono font-bold text-legitimate">{rollTotal}</p>
            <p className="text-lg font-sans font-medium text-legitimate">
              Promoted!
            </p>
            {forcedToLeave && (
              <p className="text-sm text-modified italic">
                However, your career is stalling...
              </p>
            )}
          </div>
        )}

        {/* Not advanced state */}
        {rollState === 'not-advanced' && (
          <div className="text-center space-y-2">
            <p className="text-3xl font-mono font-bold text-gray-500">{rollTotal}</p>
            <p className="text-lg font-sans font-medium text-gray-400">
              No Promotion
            </p>
          </div>
        )}

        {/* Forced to leave state (CRER-13) */}
        {rollState === 'forced-leave' && (
          <div className="text-center space-y-2">
            <p className="text-3xl font-mono font-bold text-modified">{rollTotal}</p>
            <p className="text-lg font-sans font-medium text-modified">
              Your career is stalling...
            </p>
            <p className="text-sm text-gray-400 italic">
              Your advancement roll total ({rollTotal}) did not exceed your terms served (
              {termsServed}). You must leave this career at the end of this term.
            </p>
          </div>
        )}

        {/* Forced to stay state (CRER-14) */}
        {rollState === 'forced-stay' && (
          <div className="text-center space-y-2">
            <p className="text-3xl font-mono font-bold text-legitimate">{rollTotal}</p>
            <p className="text-lg font-sans font-medium text-legitimate">
              Your career is thriving!
            </p>
            <p className="text-sm text-scanner-blue italic">
              Natural 12 — you are forced to continue in this career. Promoted!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
