import { useState, useCallback } from 'react';
import type { CharacteristicId } from '../../types/common';
import type { Characteristics } from '../../types/character';
import { getAgingChecks, resolveAgingCheck, isAgingCrisis } from '../../engine/aging';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { useCharacterStore } from '../../stores/character';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AgingCheckDisplay {
  characteristic: CharacteristicId;
  target: number;
  rolled: boolean;
  reduced: boolean;
  amount: number;
  crisis: boolean;
}

interface AgingCardProps {
  age: number;
  characteristics: Characteristics;
  onResolved: () => void;
}

/**
 * Aging effects card — shown when character reaches age 34+ (AGNG-01).
 * Rolls 2D for each of STR, DEX, END and applies reductions (AGNG-02).
 * Detects aging crises when a characteristic would reach 0 (AGNG-03).
 */
export function AgingCard({ age, characteristics, onResolved }: AgingCardProps) {
  const checks = getAgingChecks(age);
  const { loggedRoll2D } = useLoggedRoll();
  const reduceCharacteristic = useCharacterStore((s) => s.reduceCharacteristic);

  const [displayChecks, setDisplayChecks] = useState<AgingCheckDisplay[]>(
    () => {
      if (!checks) return [];
      return checks.map((c) => ({
        characteristic: c.characteristic,
        target: c.target,
        rolled: false,
        reduced: false,
        amount: 0,
        crisis: false,
      }));
    },
  );
  const [rolling, setRolling] = useState(false);
  const [allRolled, setAllRolled] = useState(false);
  const [currentCheckIndex, setCurrentCheckIndex] = useState(0);

  const rollNextCheck = useCallback(async () => {
    if (!checks || currentCheckIndex >= checks.length) return;
    setRolling(true);

    const check = checks[currentCheckIndex];
    const entry = await loggedRoll2D(`Aging Check (${check.characteristic})`, 0, check.target);
    const diceTotal = entry.results.reduce((a, b) => a + b, 0);
    const result = resolveAgingCheck(diceTotal, 0, check.target);

    const currentValue = characteristics[check.characteristic];
    const crisis = result.reduced && isAgingCrisis(currentValue, result.amount);

    if (result.reduced) {
      reduceCharacteristic(check.characteristic, result.amount);
    }

    setDisplayChecks((prev) => {
      const updated = [...prev];
      updated[currentCheckIndex] = {
        ...updated[currentCheckIndex],
        rolled: true,
        reduced: result.reduced,
        amount: result.amount,
        crisis,
      };
      return updated;
    });

    const nextIndex = currentCheckIndex + 1;
    setCurrentCheckIndex(nextIndex);
    if (nextIndex >= checks.length) {
      setAllRolled(true);
    }
    setRolling(false);
  }, [checks, currentCheckIndex, characteristics, loggedRoll2D, reduceCharacteristic]);

  // Should not render if no aging checks (age < 34)
  if (!checks) return null;

  const hasCrisis = displayChecks.some((c) => c.crisis);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Aging Check</h2>
        <p className="text-sm text-gray-400">
          Age {age} — your body begins to show the wear of years in service.
        </p>
      </div>

      {hasCrisis && (
        <div className="px-4 py-3 bg-red-900/40 border-2 border-red-600 rounded-lg">
          <p className="text-red-300 font-bold text-lg text-center">AGING CRISIS!</p>
          <p className="text-red-200 text-sm text-center mt-1">
            A characteristic has reached 0. Medical care required or the character may not survive.
            For character creation purposes, note the crisis and continue.
          </p>
        </div>
      )}

      {/* Check results */}
      <Card>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Aging Checks (2D vs target)</p>
        <div className="space-y-2">
          {displayChecks.map((check, i) => (
            <div
              key={check.characteristic}
              className={`flex items-center justify-between px-3 py-2 rounded ${
                i === currentCheckIndex && !check.rolled
                  ? 'bg-terminal-bg/60 border border-scanner-blue/30'
                  : 'bg-terminal-bg/30'
              }`}
            >
              <span className="text-sm font-mono text-gray-300 w-12">{check.characteristic}</span>
              <span className="text-xs text-gray-500">Target {check.target}+</span>
              <span className="text-sm font-mono w-24 text-right">
                {check.rolled ? (
                  check.reduced ? (
                    <span className={check.crisis ? 'text-red-400 font-bold' : 'text-red-400'}>
                      -{check.amount} {check.crisis ? '(CRISIS)' : ''}
                    </span>
                  ) : (
                    <span className="text-green-400">Passed</span>
                  )
                ) : i < currentCheckIndex ? (
                  <span className="text-gray-600">—</span>
                ) : (
                  <span className="text-gray-600">Pending</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Roll controls */}
      {!allRolled ? (
        <Button
          variant="primary"
          onClick={rollNextCheck}
          disabled={rolling}
          className="w-full"
        >
          {rolling ? 'Rolling...' : `Roll Aging Check (${displayChecks[currentCheckIndex]?.characteristic})`}
        </Button>
      ) : (
        <div className="space-y-3">
          {displayChecks.some((c) => c.reduced) && !hasCrisis && (
            <p className="text-sm text-gray-400 text-center">
              Aging has taken its toll. Your characteristics have been reduced.
            </p>
          )}
          {!displayChecks.some((c) => c.reduced) && (
            <p className="text-sm text-green-400 text-center">
              Vigorous health — all aging checks passed.
            </p>
          )}
          <Button variant="primary" onClick={onResolved} className="w-full">
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
