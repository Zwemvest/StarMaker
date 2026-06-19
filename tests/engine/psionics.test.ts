import { describe, it, expect } from 'vitest';
import {
  rollPsiStrength,
  getTalentLearnDM,
  isTelepathyAutoGranted,
  resolveTalentLearn,
} from '../../src/engine/psionics';
import { PSI_LEARN_TARGET } from '../../src/data/psionics';

describe('rollPsiStrength', () => {
  it('returns diceTotal - termsServed', () => {
    expect(rollPsiStrength(9, 4)).toBe(5);
  });

  it('clamps to 0 and never goes negative (PSIN-01)', () => {
    expect(rollPsiStrength(3, 5)).toBe(0);
    expect(rollPsiStrength(2, 2)).toBe(0);
  });

  it('returns the full dice total when no terms served', () => {
    expect(rollPsiStrength(7, 0)).toBe(7);
  });
});

describe('getTalentLearnDM', () => {
  it('returns the learning DM for each talent from PSI_TALENTS (PSIN-02)', () => {
    expect(getTalentLearnDM('telepathy')).toBe(4);
    expect(getTalentLearnDM('clairvoyance')).toBe(3);
    expect(getTalentLearnDM('telekinesis')).toBe(2);
    expect(getTalentLearnDM('awareness')).toBe(1);
    expect(getTalentLearnDM('teleportation')).toBe(0);
  });
});

describe('isTelepathyAutoGranted', () => {
  it('is true only for telepathy as the first attempt (PSIN-04)', () => {
    expect(isTelepathyAutoGranted('telepathy', 0)).toBe(true);
  });

  it('is false for telepathy after prior attempts', () => {
    expect(isTelepathyAutoGranted('telepathy', 1)).toBe(false);
  });

  it('is false for any other talent even as first pick', () => {
    expect(isTelepathyAutoGranted('clairvoyance', 0)).toBe(false);
    expect(isTelepathyAutoGranted('telekinesis', 0)).toBe(false);
  });
});

describe('resolveTalentLearn', () => {
  it('computes total = diceTotal + psiDM + talentLearnDM - priorAttempts', () => {
    const result = resolveTalentLearn(8, 1, 'teleportation', 0);
    expect(result.total).toBe(9); // 8 + 1 + 0 - 0
    expect(result.target).toBe(PSI_LEARN_TARGET);
    expect(result.success).toBe(9 >= PSI_LEARN_TARGET);
  });

  it('includes the talent learnDM (telepathy +4)', () => {
    const result = resolveTalentLearn(8, 1, 'telepathy', 0);
    expect(result.total).toBe(13); // 8 + 1 + 4 - 0
  });

  it('applies the cumulative -1 per prior attempt (PSIN-03)', () => {
    const result = resolveTalentLearn(8, 1, 'teleportation', 2);
    expect(result.total).toBe(7); // 8 + 1 + 0 - 2
  });

  it('strictly decreases total by 1 for each additional prior attempt (PSIN-03)', () => {
    const t0 = resolveTalentLearn(8, 1, 'teleportation', 0).total;
    const t1 = resolveTalentLearn(8, 1, 'teleportation', 1).total;
    const t2 = resolveTalentLearn(8, 1, 'teleportation', 2).total;
    expect(t1).toBe(t0 - 1);
    expect(t2).toBe(t0 - 2);
  });

  it('always returns target === PSI_LEARN_TARGET', () => {
    expect(resolveTalentLearn(8, 1, 'awareness', 0).target).toBe(PSI_LEARN_TARGET);
    expect(resolveTalentLearn(2, 0, 'telepathy', 5).target).toBe(PSI_LEARN_TARGET);
  });

  it('succeeds when total meets or exceeds the target', () => {
    // 8 + 0 + 0 - 0 = 8, target 8 -> success
    expect(resolveTalentLearn(8, 0, 'teleportation', 0).success).toBe(true);
    // 6 + 0 + 0 - 0 = 6, target 8 -> fail
    expect(resolveTalentLearn(6, 0, 'teleportation', 0).success).toBe(false);
  });
});
