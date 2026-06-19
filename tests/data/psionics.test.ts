import { describe, it, expect } from 'vitest';
import { PSI_TALENTS, PSI_LEARN_TARGET } from '../../src/data/psionics';
import { psiTalentDataSchema } from '../../src/schemas/psionics';
import type { PsiTalentName } from '../../src/types/psionics';

const EXPECTED_LEARN_DMS: Record<PsiTalentName, number> = {
  telepathy: 4,
  clairvoyance: 3,
  telekinesis: 2,
  awareness: 1,
  teleportation: 0,
};

describe('PSI_TALENTS data', () => {
  it('has exactly five talents', () => {
    expect(PSI_TALENTS).toHaveLength(5);
  });

  it('lists telepathy first', () => {
    expect(PSI_TALENTS[0].name).toBe('telepathy');
  });

  it('has the correct learning DMs', () => {
    for (const talent of PSI_TALENTS) {
      expect(talent.learnDM).toBe(EXPECTED_LEARN_DMS[talent.name]);
    }
  });

  it('covers all five talent names exactly once', () => {
    const names = PSI_TALENTS.map((t) => t.name).sort();
    expect(names).toEqual(
      ['awareness', 'clairvoyance', 'telekinesis', 'telepathy', 'teleportation'],
    );
  });

  it('validates every entry against the schema', () => {
    for (const talent of PSI_TALENTS) {
      expect(() => psiTalentDataSchema.parse(talent)).not.toThrow();
    }
  });

  it('gives each talent at least one power with numeric cost and string range', () => {
    for (const talent of PSI_TALENTS) {
      expect(talent.powers.length).toBeGreaterThanOrEqual(1);
      for (const power of talent.powers) {
        expect(typeof power.psiCost).toBe('number');
        expect(typeof power.range).toBe('string');
        expect(power.talent).toBe(talent.name);
      }
    }
  });

  it('uses the learning target number from the rulebook', () => {
    expect(PSI_LEARN_TARGET).toBe(8);
  });
});
