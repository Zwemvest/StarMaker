/** The six core characteristics in Mongoose Traveller 2E */
export type CharacteristicId = 'STR' | 'DEX' | 'END' | 'INT' | 'EDU' | 'SOC';

/** All characteristic IDs as a readonly array for iteration */
export const CHARACTERISTIC_IDS: readonly CharacteristicId[] = [
  'STR', 'DEX', 'END', 'INT', 'EDU', 'SOC',
] as const;

/** Skill level during character creation (0-4 typical range) */
export type SkillLevel = number;

/**
 * Dice modifier lookup: characteristic value to DM.
 * Standard Traveller 2E modifier table:
 *   0: -3, 1-2: -2, 3-5: -1, 6-8: +0, 9-11: +1, 12-14: +2, 15+: +3
 */
export function characteristicModifier(value: number): number {
  if (value <= 0) return -3;
  if (value <= 2) return -2;
  if (value <= 5) return -1;
  if (value <= 8) return 0;
  if (value <= 11) return 1;
  if (value <= 14) return 2;
  return 3;
}
