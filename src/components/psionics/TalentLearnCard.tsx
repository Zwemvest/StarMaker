import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DiceRollButton } from '../shared/DiceRollButton';
import { resolveTalentLearn, getTalentLearnDM } from '../../engine/psionics';
import { PSI_LEARN_TARGET } from '../../data/psionics';
import type { PsiTalentData } from '../../types/psionics';

interface TalentLearnCardProps {
  talent: PsiTalentData;
  psiDM: number;
  priorAttempts: number;
  autoGranted: boolean;
  alreadyOwned: boolean;
  onLearned: (talent: PsiTalentData) => void;
  onSkip: () => void;
}

function dmText(dm: number): string {
  return dm >= 0 ? `+${dm}` : `${dm}`;
}

/**
 * Talent learning card (PSIN-02/03/04/06).
 *
 * - Telepathy-first is auto-granted with no roll (autoGranted).
 * - Otherwise a roll resolves via resolveTalentLearn, applying the cumulative
 *   -priorAttempts penalty (PSIN-03).
 * - Always lists the talent's powers with PSI cost and range (PSIN-06).
 */
export function TalentLearnCard({
  talent,
  psiDM,
  priorAttempts,
  autoGranted,
  onLearned,
  onSkip,
}: TalentLearnCardProps) {
  const [result, setResult] = useState<{ success: boolean; total: number; target: number } | null>(
    null,
  );

  const learnDM = getTalentLearnDM(talent.name);
  const totalDM = psiDM + learnDM - priorAttempts;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1 capitalize">
          Learn {talent.name}
        </h2>
        <p className="text-sm text-gray-400">
          {autoGranted
            ? 'Telepathy is granted automatically as your first talent — no roll required.'
            : `Roll ${PSI_LEARN_TARGET}+ to learn this talent.`}
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">PSI DM</p>
              <p className={`font-mono font-bold text-xl ${psiDM >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {dmText(psiDM)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Learn DM</p>
              <p className={`font-mono font-bold text-xl ${learnDM >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {dmText(learnDM)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Penalty</p>
              <p className={`font-mono font-bold text-xl ${priorAttempts === 0 ? 'text-gray-400' : 'text-red-400'}`}>
                {priorAttempts === 0 ? '0' : `-${priorAttempts}`}
              </p>
            </div>
          </div>

          {/* Powers (PSIN-06) */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Powers</p>
            <ul className="space-y-2">
              {talent.powers.map((power) => (
                <li
                  key={power.name}
                  className="rounded border border-gray-700 bg-terminal-bg/40 p-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-white">{power.name}</span>
                    <span className="flex gap-2 text-xs font-mono">
                      <span className="text-amber-400">PSI {power.psiCost}</span>
                      <span className="text-scanner-blue">Range {power.range}</span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{power.description}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Action */}
          {result && (
            <p className={`text-sm font-mono ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? 'Success' : 'Failed'} — rolled {result.total} vs {result.target}+
            </p>
          )}

          {autoGranted ? (
            <Button
              variant="primary"
              className="w-full capitalize"
              onClick={() => {
                onLearned(talent);
                onSkip();
              }}
            >
              Learn {talent.name}
            </Button>
          ) : result === null ? (
            <DiceRollButton
              label={`Roll to Learn ${talent.name}`}
              context="Psionics Talent Learn"
              target={PSI_LEARN_TARGET}
              dm={totalDM}
              onRolled={(_entry, diceTotal) => {
                const r = resolveTalentLearn(diceTotal, psiDM, talent.name, priorAttempts);
                setResult(r);
                if (r.success) {
                  onLearned(talent);
                }
              }}
            />
          ) : null}

          <Button variant="ghost" size="sm" className="w-full" onClick={onSkip}>
            {result || autoGranted ? 'Next talent' : 'Skip this talent'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
