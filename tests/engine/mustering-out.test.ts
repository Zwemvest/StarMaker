import { describe, it, expect } from 'vitest';
import {
  calculateBenefitRolls,
  getRankBonusRolls,
  getRankDM,
  canRollCash,
  calculatePension,
  getCombinedRank,
} from '../../src/engine/mustering-out';

describe('calculateBenefitRolls', () => {
  it('returns terms served when no mishap', () => {
    expect(calculateBenefitRolls(3, false)).toBe(3);
  });

  it('returns terms minus 1 on mishap term', () => {
    expect(calculateBenefitRolls(3, true)).toBe(2);
  });

  it('returns 1 for single term with no mishap', () => {
    expect(calculateBenefitRolls(1, false)).toBe(1);
  });

  it('returns 0 for single term with mishap', () => {
    expect(calculateBenefitRolls(1, true)).toBe(0);
  });

  it('returns 0 minimum (never negative)', () => {
    expect(calculateBenefitRolls(0, true)).toBe(0);
  });
});

describe('getRankBonusRolls', () => {
  it('returns 0 for rank 0', () => {
    expect(getRankBonusRolls(0)).toBe(0);
  });

  it('returns 1 for rank 1', () => {
    expect(getRankBonusRolls(1)).toBe(1);
  });

  it('returns 1 for rank 2', () => {
    expect(getRankBonusRolls(2)).toBe(1);
  });

  it('returns 2 for rank 3', () => {
    expect(getRankBonusRolls(3)).toBe(2);
  });

  it('returns 2 for rank 4', () => {
    expect(getRankBonusRolls(4)).toBe(2);
  });

  it('returns 3 for rank 5', () => {
    expect(getRankBonusRolls(5)).toBe(3);
  });

  it('returns 3 for rank 6', () => {
    expect(getRankBonusRolls(6)).toBe(3);
  });
});

describe('getRankDM', () => {
  it('returns 0 for rank 0', () => {
    expect(getRankDM(0)).toBe(0);
  });

  it('returns 0 for rank 4', () => {
    expect(getRankDM(4)).toBe(0);
  });

  it('returns 1 for rank 5', () => {
    expect(getRankDM(5)).toBe(1);
  });

  it('returns 1 for rank 6', () => {
    expect(getRankDM(6)).toBe(1);
  });
});

describe('canRollCash', () => {
  it('returns true when 0 cash rolls used', () => {
    expect(canRollCash(0)).toBe(true);
  });

  it('returns true when 2 cash rolls used', () => {
    expect(canRollCash(2)).toBe(true);
  });

  it('returns false when 3 cash rolls used', () => {
    expect(canRollCash(3)).toBe(false);
  });

  it('returns false when more than 3 cash rolls used', () => {
    expect(canRollCash(5)).toBe(false);
  });
});

describe('calculatePension', () => {
  it('returns 0 for less than 5 terms', () => {
    expect(calculatePension(4)).toBe(0);
    expect(calculatePension(1)).toBe(0);
    expect(calculatePension(0)).toBe(0);
  });

  it('returns 10000 for 5 terms', () => {
    expect(calculatePension(5)).toBe(10000);
  });

  it('returns 12000 for 6 terms', () => {
    expect(calculatePension(6)).toBe(12000);
  });

  it('returns 14000 for 7 terms', () => {
    expect(calculatePension(7)).toBe(14000);
  });

  it('returns 20000 for 10 terms', () => {
    expect(calculatePension(10)).toBe(20000);
  });
});

describe('getCombinedRank', () => {
  it('returns sum of enlisted and officer rank', () => {
    expect(getCombinedRank(3, 2)).toBe(5);
  });

  it('returns enlisted rank when no officer rank', () => {
    expect(getCombinedRank(4, 0)).toBe(4);
  });

  it('returns officer rank when no enlisted rank', () => {
    expect(getCombinedRank(0, 3)).toBe(3);
  });

  it('returns 0 for both 0', () => {
    expect(getCombinedRank(0, 0)).toBe(0);
  });
});
