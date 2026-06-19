import { describe, it, expect } from 'vitest';
import { canAfford, applyPurchase, filterCatalog } from '../../src/engine/equipment';
import type { Equipment } from '../../src/types/equipment';

const FIXTURE: readonly Equipment[] = [
  {
    name: 'Autopistol',
    tl: 8,
    cost: 200,
    mass: 0.5,
    traits: [],
    category: 'weapons',
    range: '10m',
    damage: '3D-3',
    magazine: 15,
    magazineCost: 10,
  },
  {
    name: 'Combat Armour',
    tl: 12,
    cost: 24000,
    mass: 20,
    traits: [],
    category: 'armour',
    protection: 16,
    rad: 100,
  },
  {
    name: 'Toolkit',
    tl: 9,
    cost: 1000,
    mass: 6,
    traits: [],
    category: 'tools',
    description: 'A basic mechanical toolkit.',
  },
] as const;

describe('canAfford', () => {
  it('is true when balance exceeds cost', () => {
    expect(canAfford(5000, 4000)).toBe(true);
  });

  it('treats an exact balance as affordable (EQUP-03)', () => {
    expect(canAfford(5000, 5000)).toBe(true);
  });

  it('is false when cost exceeds balance', () => {
    expect(canAfford(5000, 6000)).toBe(false);
  });

  it('is true for zero cost with zero balance', () => {
    expect(canAfford(0, 0)).toBe(true);
  });
});

describe('applyPurchase', () => {
  it('subtracts the cost from the balance', () => {
    expect(applyPurchase(5000, 4000)).toBe(1000);
  });

  it('returns 0 when buying with an exact balance', () => {
    expect(applyPurchase(5000, 5000)).toBe(0);
  });

  it('throws on overspend and never returns a negative balance (EQUP-03)', () => {
    expect(() => applyPurchase(5000, 6000)).toThrow();
  });
});

describe('filterCatalog', () => {
  it("returns all items for category 'all' and no TL ceiling", () => {
    const result = filterCatalog(FIXTURE, 'all', null);
    expect(result).toHaveLength(FIXTURE.length);
  });

  it('filters by category', () => {
    const result = filterCatalog(FIXTURE, 'weapons', null);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('weapons');
  });

  it('filters by max tech level', () => {
    const result = filterCatalog(FIXTURE, 'all', 9);
    expect(result.every((i) => i.tl <= 9)).toBe(true);
    expect(result).toHaveLength(2); // Autopistol TL8, Toolkit TL9
  });

  it('applies both category and TL filters together', () => {
    const result = filterCatalog(FIXTURE, 'armour', 12);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('armour');
    expect(result[0].tl).toBeLessThanOrEqual(12);
  });

  it('does not mutate the input array', () => {
    const before = FIXTURE.length;
    filterCatalog(FIXTURE, 'weapons', 8);
    expect(FIXTURE).toHaveLength(before);
  });

  it("returns a new array reference even for 'all'/null", () => {
    const result = filterCatalog(FIXTURE, 'all', null);
    expect(result).not.toBe(FIXTURE);
  });
});
