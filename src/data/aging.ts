import type { CharacteristicId } from '../types/common';

/** A single aging check: roll 2D against target for a characteristic */
export interface AgingCheck {
  characteristic: CharacteristicId;
  target: number;
}

/** An aging bracket: applies from minAge onward until next bracket */
export interface AgingBracket {
  minAge: number;
  checks: AgingCheck[];
}

/**
 * Aging table from Mongoose Traveller 2E Core Rulebook.
 * Each bracket lists the 2D target numbers for STR, DEX, END checks.
 * If the check roll is below the target, the characteristic is reduced
 * by the difference.
 *
 * Aging Effects Table (p.47):
 * Age 34-45: -1 STR(8+), -1 DEX(7+), -1 END(8+)
 * Age 46-57: -1 STR(9+), -1 DEX(8+), -1 END(9+)
 * Age 58-69: -1 STR(10+), -1 DEX(9+), -1 END(10+)
 * Age 70+:   -1 STR(11+), -1 DEX(10+), -1 END(11+)
 */
export const AGING_TABLE: readonly AgingBracket[] = [
  {
    minAge: 34,
    checks: [
      { characteristic: 'STR', target: 8 },
      { characteristic: 'DEX', target: 7 },
      { characteristic: 'END', target: 8 },
    ],
  },
  {
    minAge: 46,
    checks: [
      { characteristic: 'STR', target: 9 },
      { characteristic: 'DEX', target: 8 },
      { characteristic: 'END', target: 9 },
    ],
  },
  {
    minAge: 58,
    checks: [
      { characteristic: 'STR', target: 10 },
      { characteristic: 'DEX', target: 9 },
      { characteristic: 'END', target: 10 },
    ],
  },
  {
    minAge: 70,
    checks: [
      { characteristic: 'STR', target: 11 },
      { characteristic: 'DEX', target: 10 },
      { characteristic: 'END', target: 11 },
    ],
  },
] as const;
