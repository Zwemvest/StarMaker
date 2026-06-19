/**
 * Psionics engine for Mongoose Traveller 2E.
 * Pure functions: no side effects, no state mutations, no randomness.
 * The dice total is always supplied by the caller; this module never rolls.
 */

import type { PsiTalentName } from '../types/psionics';
import { PSI_TALENTS, PSI_LEARN_TARGET } from '../data/psionics';

/**
 * PSI strength = 2D - terms served, clamped to a minimum of 0 (PSIN-01).
 * `diceTotal` is the already-summed 2D roll supplied by the caller.
 */
export function rollPsiStrength(diceTotal: number, termsServed: number): number {
  return Math.max(0, diceTotal - termsServed);
}

/** Talent learning DM from the PSI_TALENTS table (PSIN-02). */
export function getTalentLearnDM(talent: PsiTalentName): number {
  const data = PSI_TALENTS.find((t) => t.name === talent);
  if (!data) {
    throw new Error(`Unknown psionic talent: ${talent}`);
  }
  return data.learnDM;
}

/**
 * Telepathy chosen as the FIRST talent (no prior attempts) is auto-granted
 * without a roll (PSIN-04). Any other talent, or telepathy after other
 * attempts, must be rolled normally.
 */
export function isTelepathyAutoGranted(
  talent: PsiTalentName,
  priorAttempts: number,
): boolean {
  return talent === 'telepathy' && priorAttempts === 0;
}

/**
 * Resolve a talent learning roll (PSIN-02/03).
 * total = diceTotal + psiDM + talentLearnDM - priorAttempts (cumulative -1 each).
 * success when total >= PSI_LEARN_TARGET.
 */
export function resolveTalentLearn(
  diceTotal: number,
  psiDM: number,
  talent: PsiTalentName,
  priorAttempts: number,
): { success: boolean; total: number; target: number } {
  const total = diceTotal + psiDM + getTalentLearnDM(talent) - priorAttempts;
  return {
    success: total >= PSI_LEARN_TARGET,
    total,
    target: PSI_LEARN_TARGET,
  };
}
