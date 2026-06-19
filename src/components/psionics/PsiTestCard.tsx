import { useState } from 'react';
import { Card } from '../ui/Card';
import { DiceRollButton } from '../shared/DiceRollButton';
import { rollPsiStrength } from '../../engine/psionics';
import { Button } from '../ui/Button';

interface PsiTestCardProps {
  termsServed: number;
  onComplete: (strength: number) => void;
}

/**
 * PSI strength roll card (PSIN-01).
 * strength = max(0, 2D - termsServed), rolled once, then handed up.
 */
export function PsiTestCard({ termsServed, onComplete }: PsiTestCardProps) {
  const [strength, setStrength] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Psionic Strength</h2>
        <p className="text-sm text-gray-400">
          Roll 2D and subtract your {termsServed} term{termsServed !== 1 ? 's' : ''} served to
          determine your PSI characteristic.
        </p>
      </div>
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Terms Served</p>
              <p className="font-mono text-white font-bold text-xl">{termsServed}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">PSI Strength</p>
              <p className="font-mono text-scanner-blue font-bold text-xl">
                {strength === null ? '—' : strength}
              </p>
            </div>
          </div>

          {strength === null ? (
            <DiceRollButton
              label="Roll PSI Strength"
              context="Psionics Strength"
              target={0}
              dm={0}
              showBreakdown={false}
              onRolled={(_entry, diceTotal) => {
                const s = rollPsiStrength(diceTotal, termsServed);
                setStrength(s);
              }}
            />
          ) : (
            <Button variant="primary" className="w-full" onClick={() => onComplete(strength)}>
              Continue to Talents
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
