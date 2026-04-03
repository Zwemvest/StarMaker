/**
 * Mustering Out Engine — Pure functions for benefit calculations.
 *
 * Implements the mustering out rules from Mongoose Traveller 2E Core Rulebook:
 * - Benefit roll counts based on terms served and rank
 * - Cash table maximum (3 rolls lifetime)
 * - Pension calculation (5+ terms)
 * - Rank DM for benefit table rolls
 */

/** Maximum number of cash table rolls allowed per character lifetime (MSTR-01) */
export const MAX_CASH_ROLLS = 3;

/** Pension base amount for 5 terms of service (MSTR-03) */
export const PENSION_BASE = 10000;

/** Additional pension per term beyond 5 (MSTR-03) */
export const PENSION_PER_EXTRA_TERM = 2000;

/** Minimum terms for pension eligibility (MSTR-03) */
export const PENSION_MIN_TERMS = 5;

/**
 * Calculate the number of benefit rolls a character receives on mustering out.
 * Equal to terms served, minus 1 if the final term ended in a mishap.
 * Minimum 0. (MSTR-04)
 *
 * Note: Rank bonus rolls are calculated separately via getRankBonusRolls.
 */
export function calculateBenefitRolls(
  termsServed: number,
  mishapTerm: boolean,
): number {
  const rolls = mishapTerm ? termsServed - 1 : termsServed;
  return Math.max(0, rolls);
}

/**
 * Calculate bonus benefit rolls from rank.
 * Rank 1-2: +1, Rank 3-4: +2, Rank 5-6: +3. (MSTR-02)
 */
export function getRankBonusRolls(rank: number): number {
  if (rank >= 5) return 3;
  if (rank >= 3) return 2;
  if (rank >= 1) return 1;
  return 0;
}

/**
 * Get the DM applied to benefit table rolls based on rank.
 * DM+1 for rank 5 or 6. (MSTR-02)
 */
export function getRankDM(rank: number): number {
  return rank >= 5 ? 1 : 0;
}

/**
 * Check if the character can still roll on the cash table.
 * Maximum 3 cash rolls per character lifetime. (MSTR-01)
 */
export function canRollCash(cashRollsUsed: number): boolean {
  return cashRollsUsed < MAX_CASH_ROLLS;
}

/**
 * Calculate annual pension based on total terms served across all careers.
 * No pension for < 5 terms. Cr10,000 for 5 terms, +Cr2,000 per additional term. (MSTR-03)
 */
export function calculatePension(totalTerms: number): number {
  if (totalTerms < PENSION_MIN_TERMS) return 0;
  return PENSION_BASE + (totalTerms - PENSION_MIN_TERMS) * PENSION_PER_EXTRA_TERM;
}

/**
 * Calculate combined rank for benefit roll purposes.
 * Sum of enlisted rank and officer rank. (MSTR-05)
 */
export function getCombinedRank(
  enlistedRank: number,
  officerRank: number,
): number {
  return enlistedRank + officerRank;
}
