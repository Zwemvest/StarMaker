import type { CharacteristicId } from '../types/common';
import { AGING_TABLE } from '../data/aging';

/** Result of a single aging check */
export interface AgingCheckResult {
  reduced: boolean;
  amount: number;
}

/**
 * Get the aging checks required for a character of the given age.
 * Returns null if age < 34 (no aging effects).
 * Returns the checks for the highest applicable bracket.
 *
 * Mongoose Traveller 2E: Aging checks occur at the end of each term
 * once a character reaches 34 years old. (AGNG-01)
 */
export function getAgingChecks(
  age: number,
): { characteristic: CharacteristicId; target: number }[] | null {
  if (age < 34) return null;

  // Find the highest bracket that applies (iterate backwards)
  for (let i = AGING_TABLE.length - 1; i >= 0; i--) {
    if (age >= AGING_TABLE[i].minAge) {
      return AGING_TABLE[i].checks.map((c) => ({
        characteristic: c.characteristic,
        target: c.target,
      }));
    }
  }

  return null;
}

/**
 * Resolve a single aging check.
 * If diceTotal + dm < target, the characteristic is reduced by the difference.
 * (AGNG-02)
 *
 * @param diceTotal - The 2D roll result (before DM)
 * @param dm - Dice modifier (e.g., from drugs or medical care)
 * @param target - The target number from the aging table
 */
export function resolveAgingCheck(
  diceTotal: number,
  dm: number,
  target: number,
): AgingCheckResult {
  const total = diceTotal + dm;
  if (total >= target) {
    return { reduced: false, amount: 0 };
  }
  return { reduced: true, amount: target - total };
}

/**
 * Determine if an aging reduction would cause an aging crisis.
 * An aging crisis occurs when a characteristic would be reduced to 0 or below.
 * (AGNG-03)
 *
 * @param currentValue - Current characteristic value
 * @param reduction - Amount the characteristic would be reduced
 */
export function isAgingCrisis(currentValue: number, reduction: number): boolean {
  return currentValue - reduction <= 0;
}
