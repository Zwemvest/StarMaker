/**
 * Equipment budget/filter engine for Mongoose Traveller 2E.
 * Pure functions: no side effects, no state mutations.
 */

import type { Equipment, EquipmentCategory } from '../types/equipment';

/** True when the balance can cover the cost (exact balance is affordable). EQUP-03. */
export function canAfford(credits: number, cost: number): boolean {
  return credits >= cost;
}

/**
 * Subtract a purchase from the balance. Throws if unaffordable so the caller
 * can never reach a negative balance (overspend guard, EQUP-03).
 */
export function applyPurchase(credits: number, cost: number): number {
  if (!canAfford(credits, cost)) {
    throw new Error(
      `Cannot afford purchase: cost ${cost} exceeds balance ${credits}`,
    );
  }
  return credits - cost;
}

/**
 * Filter a catalog by category and a max tech level (EQUP-02).
 * category 'all' = no category filter; maxTL null = no TL ceiling.
 * Returns a new array; never mutates the input.
 */
export function filterCatalog(
  items: readonly Equipment[],
  category: EquipmentCategory | 'all',
  maxTL: number | null,
): Equipment[] {
  return items.filter((item) => {
    const categoryOk = category === 'all' || item.category === category;
    const tlOk = maxTL === null || item.tl <= maxTL;
    return categoryOk && tlOk;
  });
}
