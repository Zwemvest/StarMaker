import { useState, useCallback } from 'react';
import type { CharacteristicCheck, CareerData } from '../../types/careers';
import { resolveAdvancementRoll, applyRankSkill } from '../../engine/career';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { characteristicModifier } from '../../types/common';
import { useCharacterStore } from '../../stores/character';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AdvancementResult {
  advanced: boolean;
  forcedToLeave: boolean;
  forcedToStay: boolean;
}

interface AdvancementCardProps {
  career: CareerData;
  advancementTarget: CharacteristicCheck;
  characteristicValue: number;
  termsServed: number;
  currentRank: number;
  isOfficer: boolean;
  /** Event-granted advancement DM for this term (CRER-11). */
  bonusDM?: number;
  onResult: (result: AdvancementResult) => void;
}

/**
 * Advancement roll card (D-06).
 * Detects forced leave (CRER-13) and forced stay on natural 12 (CRER-14).
 * Grants rank bonus skills on promotion (CRER-15).
 */
export function AdvancementCard({
  career,
  advancementTarget,
  characteristicValue,
  termsServed,
  currentRank,
  isOfficer,
  bonusDM = 0,
  onResult,
}: AdvancementCardProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const addSkill = useCharacterStore((s) => s.addSkill);

  const [rolled, setRolled] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{
    advanced: boolean;
    forcedToLeave: boolean;
    forcedToStay: boolean;
    total: number;
    diceTotal: number;
    newRankTitle: string | null;
  } | null>(null);

  const charDM = characteristicModifier(characteristicValue);
  const effectiveDM = charDM + bonusDM;

  const handleRoll = useCallback(async () => {
    setRolling(true);
    const entry = await loggedRoll2D('Advancement Roll', effectiveDM, advancementTarget.target);
    const diceTotal = entry.results.reduce((a, b) => a + b, 0);
    const res = resolveAdvancementRoll(diceTotal, effectiveDM, advancementTarget.target, termsServed);

    let newRankTitle: string | null = null;
    if (res.advanced) {
      const newRank = currentRank + 1;
      // Apply rank bonus skill
      const bonus = applyRankSkill(career, newRank, isOfficer);
      if (bonus) {
        addSkill(bonus.skill, bonus.level);
      }
      // Get new rank title
      const rankTable = isOfficer ? career.ranks.officer : career.ranks.enlisted;
      const rankEntry = rankTable?.find((r) => r.level === newRank);
      newRankTitle = rankEntry?.title ?? `Rank ${newRank}`;
    }

    setResult({
      advanced: res.advanced,
      forcedToLeave: res.forcedToLeave,
      forcedToStay: res.forcedToStay,
      total: diceTotal + effectiveDM,
      diceTotal,
      newRankTitle,
    });
    setRolled(true);
    setRolling(false);
  }, [loggedRoll2D, effectiveDM, advancementTarget, termsServed, currentRank, isOfficer, career, addSkill]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Advancement Roll</h2>
        <p className="text-sm text-gray-400">Roll 2D to see if you are promoted.</p>
      </div>

      <Card>
        <div className="space-y-3">
          <div className={`grid gap-4 ${bonusDM > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Target</p>
              <p className="font-mono text-white font-bold">
                {advancementTarget.characteristic} {advancementTarget.target}+
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your DM</p>
              <p className={`font-mono font-bold ${charDM >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {charDM >= 0 ? `+${charDM}` : charDM}
              </p>
            </div>
            {bonusDM > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Event DM</p>
                <p className="font-mono font-bold text-scanner-blue">+{bonusDM}</p>
              </div>
            )}
          </div>

          {!rolled && (
            <Button
              variant="primary"
              className="w-full"
              onClick={handleRoll}
              disabled={rolling}
            >
              {rolling ? 'Rolling...' : 'Roll for Advancement'}
            </Button>
          )}
        </div>
      </Card>

      {result && (
        <div className="space-y-3">
          <Card>
            <p className="text-xs text-gray-500 mb-1">
              Rolled {result.diceTotal} + ({effectiveDM >= 0 ? `+${effectiveDM}` : effectiveDM}) = {result.total}
            </p>
            {result.advanced ? (
              <p className="text-xl font-bold text-green-400">
                Promoted! {result.newRankTitle && `— ${result.newRankTitle}`}
              </p>
            ) : (
              <p className="text-lg text-gray-400">No Promotion.</p>
            )}
          </Card>

          {result.forcedToLeave && (
            <div className="px-3 py-2 bg-red-900/20 border border-red-700/40 rounded-lg">
              <p className="text-red-300 text-sm font-medium">
                Your career is stalling... You are forced to leave after this term. (CRER-13)
              </p>
            </div>
          )}

          {result.forcedToStay && (
            <div className="px-3 py-2 bg-green-900/20 border border-green-700/40 rounded-lg">
              <p className="text-green-300 text-sm font-medium">
                Natural 12! Your career is thriving — you must serve another term. (CRER-14)
              </p>
            </div>
          )}

          <Button
            variant="primary"
            className="w-full"
            onClick={() =>
              onResult({
                advanced: result.advanced,
                forcedToLeave: result.forcedToLeave,
                forcedToStay: result.forcedToStay,
              })
            }
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
