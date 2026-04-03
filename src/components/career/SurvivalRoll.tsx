import { useState, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { resolveSurvivalRoll } from '../../engine/career';
import { characteristicModifier } from '../../types/common';
import { rollDie } from '../../engine/dice';
import type { AssignmentData } from '../../types/careers';

interface SurvivalRollProps {
  assignment: AssignmentData;
  characteristicValue: number;
  onSurvived: () => void;
  onMishap: (rollValue: number) => void;
}

type RollState = 'pending' | 'survived' | 'mishap';

/**
 * Dramatic survival roll card (D-05).
 *
 * Shows the survival target, DM, and a high-stakes "Roll for Survival" button.
 * Pass: green relief glow. Fail: red flash + "MISHAP!" text.
 * Natural 2 always fails regardless of DM (CRER-07).
 */
export function SurvivalRoll({
  assignment,
  characteristicValue,
  onSurvived,
  onMishap,
}: SurvivalRollProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const [rollState, setRollState] = useState<RollState>('pending');
  const [rollTotal, setRollTotal] = useState(0);
  const [naturalTwo, setNaturalTwo] = useState(false);
  const [dm, setDm] = useState(0);

  const survivalTarget = assignment.survival;
  const characteristicDM = characteristicModifier(characteristicValue);

  const handleRoll = useCallback(async () => {
    const currentDM = characteristicDM;
    setDm(currentDM);

    const roll = await loggedRoll2D(
      `career.survival.${assignment.name}`,
      currentDM,
      survivalTarget.target,
    );

    const diceTotal = roll.results.reduce((a, b) => a + b, 0);
    setRollTotal(roll.total);

    const result = resolveSurvivalRoll(diceTotal, currentDM, survivalTarget.target);
    setNaturalTwo(result.naturalTwo);

    if (result.survived) {
      setRollState('survived');
      // Brief pause for dramatic effect then continue
      setTimeout(() => onSurvived(), 1500);
    } else {
      setRollState('mishap');
      // Roll 1D for mishap table index
      const mishapRoll = rollDie(6);
      setTimeout(() => onMishap(mishapRoll), 2000);
    }
  }, [
    assignment.name,
    characteristicDM,
    loggedRoll2D,
    onMishap,
    onSurvived,
    survivalTarget.target,
  ]);

  return (
    <Card
      className={`transition-all duration-500 ${
        rollState === 'survived'
          ? 'border-legitimate/60'
          : rollState === 'mishap'
            ? 'border-modified/60'
            : 'border-gray-700'
      }`}
      glowColor={
        rollState === 'survived'
          ? '#22c55e'
          : rollState === 'mishap'
            ? '#ef4444'
            : undefined
      }
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-sans font-medium text-white">Survival Roll</h3>
          <p className="text-sm text-gray-400 mt-1">
            Your Traveller must survive the dangers of this term.
          </p>
        </div>

        {/* Roll info */}
        <div className="space-y-1">
          <p className="text-sm text-gray-300">
            Target:{' '}
            <span className="text-scanner-blue font-mono font-bold">
              {survivalTarget.characteristic} {survivalTarget.target}+
            </span>
          </p>
          <p className="text-sm text-gray-300">
            {survivalTarget.characteristic} DM:{' '}
            <span className="font-mono">
              {characteristicDM >= 0 ? `+${characteristicDM}` : characteristicDM}
            </span>
          </p>
        </div>

        {/* Pending state: roll button */}
        {rollState === 'pending' && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleRoll}
            className="w-full bg-red-600 hover:bg-red-700 border-red-600 text-white font-bold tracking-wide"
          >
            Roll for Survival
          </Button>
        )}

        {/* Survived state */}
        {rollState === 'survived' && (
          <div className="text-center space-y-2">
            <p className="text-3xl font-mono font-bold text-legitimate">
              {rollTotal}
            </p>
            <p className="text-lg font-sans font-medium text-legitimate">
              SURVIVED
            </p>
          </div>
        )}

        {/* Mishap state */}
        {rollState === 'mishap' && (
          <div className="text-center space-y-2">
            <p className="text-3xl font-mono font-bold text-modified">
              {rollTotal}
            </p>
            {naturalTwo ? (
              <p className="text-lg font-sans font-bold text-modified animate-pulse">
                Natural 2 — Automatic Failure!
              </p>
            ) : (
              <p className="text-lg font-sans font-bold text-modified animate-pulse">
                MISHAP!
              </p>
            )}
            <p className="text-sm text-gray-400">
              Your career has ended badly...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
