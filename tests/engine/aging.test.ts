import { describe, it, expect } from 'vitest';
import {
  getAgingChecks,
  resolveAgingCheck,
  isAgingCrisis,
} from '../../src/engine/aging';
import { AGING_TABLE } from '../../src/data/aging';

describe('AGING_TABLE', () => {
  it('has exactly 4 brackets', () => {
    expect(AGING_TABLE).toHaveLength(4);
  });

  it('brackets start at ages 34, 46, 58, 70', () => {
    expect(AGING_TABLE.map((b) => b.minAge)).toEqual([34, 46, 58, 70]);
  });

  it('each bracket checks STR, DEX, END', () => {
    for (const bracket of AGING_TABLE) {
      const chars = bracket.checks.map((c) => c.characteristic);
      expect(chars).toEqual(['STR', 'DEX', 'END']);
    }
  });
});

describe('getAgingChecks', () => {
  it('returns null for age < 34', () => {
    expect(getAgingChecks(30)).toBeNull();
    expect(getAgingChecks(18)).toBeNull();
    expect(getAgingChecks(33)).toBeNull();
  });

  it('returns correct checks for age 34 (34-45 bracket)', () => {
    const checks = getAgingChecks(34)!;
    expect(checks).not.toBeNull();
    expect(checks).toHaveLength(3);

    const strCheck = checks.find((c) => c.characteristic === 'STR')!;
    const dexCheck = checks.find((c) => c.characteristic === 'DEX')!;
    const endCheck = checks.find((c) => c.characteristic === 'END')!;

    expect(strCheck.target).toBe(8);
    expect(dexCheck.target).toBe(7);
    expect(endCheck.target).toBe(8);
  });

  it('returns correct checks for age 45 (still 34-45 bracket)', () => {
    const checks = getAgingChecks(45)!;
    expect(checks).not.toBeNull();
    const strCheck = checks.find((c) => c.characteristic === 'STR')!;
    expect(strCheck.target).toBe(8);
  });

  it('returns correct checks for age 46 (46-57 bracket)', () => {
    const checks = getAgingChecks(46)!;
    expect(checks).not.toBeNull();

    const strCheck = checks.find((c) => c.characteristic === 'STR')!;
    const dexCheck = checks.find((c) => c.characteristic === 'DEX')!;
    const endCheck = checks.find((c) => c.characteristic === 'END')!;

    expect(strCheck.target).toBe(9);
    expect(dexCheck.target).toBe(8);
    expect(endCheck.target).toBe(9);
  });

  it('returns correct checks for age 58 (58-69 bracket)', () => {
    const checks = getAgingChecks(58)!;
    expect(checks).not.toBeNull();

    const strCheck = checks.find((c) => c.characteristic === 'STR')!;
    const dexCheck = checks.find((c) => c.characteristic === 'DEX')!;
    const endCheck = checks.find((c) => c.characteristic === 'END')!;

    expect(strCheck.target).toBe(10);
    expect(dexCheck.target).toBe(9);
    expect(endCheck.target).toBe(10);
  });

  it('returns correct checks for age 70 (70+ bracket)', () => {
    const checks = getAgingChecks(70)!;
    expect(checks).not.toBeNull();

    const strCheck = checks.find((c) => c.characteristic === 'STR')!;
    const dexCheck = checks.find((c) => c.characteristic === 'DEX')!;
    const endCheck = checks.find((c) => c.characteristic === 'END')!;

    expect(strCheck.target).toBe(11);
    expect(dexCheck.target).toBe(10);
    expect(endCheck.target).toBe(11);
  });

  it('returns 70+ bracket for age 80', () => {
    const checks = getAgingChecks(80)!;
    expect(checks).not.toBeNull();

    const strCheck = checks.find((c) => c.characteristic === 'STR')!;
    expect(strCheck.target).toBe(11);
  });
});

describe('resolveAgingCheck', () => {
  it('returns no reduction when roll meets target', () => {
    const result = resolveAgingCheck(8, 0, 8);
    expect(result.reduced).toBe(false);
    expect(result.amount).toBe(0);
  });

  it('returns no reduction when roll exceeds target', () => {
    const result = resolveAgingCheck(10, 0, 8);
    expect(result.reduced).toBe(false);
    expect(result.amount).toBe(0);
  });

  it('returns reduction when roll misses target by 2', () => {
    const result = resolveAgingCheck(6, 0, 8);
    expect(result.reduced).toBe(true);
    expect(result.amount).toBe(2);
  });

  it('returns reduction when roll misses target by 1', () => {
    const result = resolveAgingCheck(7, 0, 8);
    expect(result.reduced).toBe(true);
    expect(result.amount).toBe(1);
  });

  it('accounts for DM in check', () => {
    // Roll 6 + DM 2 = 8, meets target 8
    const result = resolveAgingCheck(6, 2, 8);
    expect(result.reduced).toBe(false);
    expect(result.amount).toBe(0);
  });

  it('accounts for negative DM', () => {
    // Roll 8 + DM -1 = 7, misses target 8 by 1
    const result = resolveAgingCheck(8, -1, 8);
    expect(result.reduced).toBe(true);
    expect(result.amount).toBe(1);
  });
});

describe('isAgingCrisis', () => {
  it('returns true when reduction would go below 0', () => {
    expect(isAgingCrisis(2, 3)).toBe(true);
  });

  it('returns false when characteristic stays above 0', () => {
    expect(isAgingCrisis(5, 3)).toBe(false);
  });

  it('returns true when characteristic would reach exactly 0', () => {
    expect(isAgingCrisis(1, 1)).toBe(true);
  });

  it('returns true when current value is 0 with any reduction', () => {
    expect(isAgingCrisis(0, 1)).toBe(true);
  });

  it('returns false when no reduction', () => {
    expect(isAgingCrisis(5, 0)).toBe(false);
  });
});
