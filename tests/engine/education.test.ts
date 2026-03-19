import { describe, it, expect } from 'vitest';
import {
  calculateEntryDM,
  resolveEntryRoll,
  resolveGraduation,
  canAttemptEducation,
  getAvailableUniversitySkills,
  getAcademyBasicTraining,
  applyGraduationBenefits,
} from '../../src/engine/education';
import { EDUCATION_PATHS, UNIVERSITY_SKILLS } from '../../src/data/education';
import type { Characteristics } from '../../src/types/character';

/** Helper to create characteristics with defaults */
function makeChars(overrides: Partial<Characteristics> = {}): Characteristics {
  return { STR: 7, DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 7, ...overrides };
}

describe('calculateEntryDM', () => {
  const universityPath = EDUCATION_PATHS.find((p) => p.type === 'university')!;
  const armyPath = EDUCATION_PATHS.find((p) => p.branch === 'army')!;

  it('returns 0 DM for first attempt without SOC bonus', () => {
    const dm = calculateEntryDM(0, makeChars({ SOC: 8 }), universityPath);
    expect(dm).toBe(0);
  });

  it('returns +1 for first attempt with SOC 9+ at university', () => {
    const dm = calculateEntryDM(0, makeChars({ SOC: 9 }), universityPath);
    expect(dm).toBe(1);
  });

  it('returns -1 for second attempt (1 term used)', () => {
    const dm = calculateEntryDM(1, makeChars({ SOC: 8 }), universityPath);
    expect(dm).toBe(-1);
  });

  it('returns -2 for third attempt (2 terms used)', () => {
    const dm = calculateEntryDM(2, makeChars({ SOC: 8 }), universityPath);
    expect(dm).toBe(-2);
  });

  it('combines SOC bonus with term penalty', () => {
    const dm = calculateEntryDM(1, makeChars({ SOC: 10 }), universityPath);
    expect(dm).toBe(0); // -1 term + +1 SOC = 0
  });

  it('does not apply SOC bonus for academy paths', () => {
    const dm = calculateEntryDM(0, makeChars({ SOC: 12 }), armyPath);
    expect(dm).toBe(0);
  });

  it('returns -2 for academy with 2 terms used', () => {
    const dm = calculateEntryDM(2, makeChars(), armyPath);
    expect(dm).toBe(-2);
  });
});

describe('resolveEntryRoll', () => {
  it('returns success: false when total < target', () => {
    const result = resolveEntryRoll(6, 0, 7);
    expect(result.success).toBe(false);
    expect(result.total).toBe(6);
    expect(result.target).toBe(7);
    expect(result.dm).toBe(0);
  });

  it('returns success: true when total = target', () => {
    const result = resolveEntryRoll(7, 0, 7);
    expect(result.success).toBe(true);
    expect(result.total).toBe(7);
  });

  it('returns success: true when total > target', () => {
    const result = resolveEntryRoll(10, 0, 7);
    expect(result.success).toBe(true);
    expect(result.total).toBe(10);
  });

  it('applies DM to total', () => {
    const result = resolveEntryRoll(6, 1, 7);
    expect(result.total).toBe(7);
    expect(result.success).toBe(true);
  });

  it('applies negative DM to total', () => {
    const result = resolveEntryRoll(7, -1, 7);
    expect(result.total).toBe(6);
    expect(result.success).toBe(false);
  });
});

describe('resolveGraduation', () => {
  it('returns honours for total >= 11', () => {
    const result = resolveGraduation(11, 0);
    expect(result.result).toBe('honours');
    expect(result.total).toBe(11);
  });

  it('returns graduated for total = 7', () => {
    const result = resolveGraduation(7, 0);
    expect(result.result).toBe('graduated');
    expect(result.total).toBe(7);
  });

  it('returns graduated for total between 7 and 10', () => {
    const result = resolveGraduation(10, 0);
    expect(result.result).toBe('graduated');
    expect(result.total).toBe(10);
  });

  it('returns failed for total = 6', () => {
    const result = resolveGraduation(6, 0);
    expect(result.result).toBe('failed');
    expect(result.total).toBe(6);
  });

  it('applies DM to graduation', () => {
    const result = resolveGraduation(9, 2);
    expect(result.result).toBe('honours');
    expect(result.total).toBe(11);
  });

  it('negative DM can cause failure', () => {
    const result = resolveGraduation(7, -1);
    expect(result.result).toBe('failed');
    expect(result.total).toBe(6);
  });
});

describe('canAttemptEducation', () => {
  it('returns true for 0 terms used', () => {
    expect(canAttemptEducation(0)).toBe(true);
  });

  it('returns true for 1 term used', () => {
    expect(canAttemptEducation(1)).toBe(true);
  });

  it('returns true for 2 terms used', () => {
    expect(canAttemptEducation(2)).toBe(true);
  });

  it('returns false for 3 terms used', () => {
    expect(canAttemptEducation(3)).toBe(false);
  });

  it('returns false for 4+ terms used', () => {
    expect(canAttemptEducation(4)).toBe(false);
  });
});

describe('getAvailableUniversitySkills', () => {
  it('returns the UNIVERSITY_SKILLS array', () => {
    expect(getAvailableUniversitySkills()).toEqual(UNIVERSITY_SKILLS);
  });

  it('returns a non-empty array', () => {
    expect(getAvailableUniversitySkills().length).toBeGreaterThan(0);
  });
});

describe('getAcademyBasicTraining', () => {
  it('returns correct skills for army', () => {
    const skills = getAcademyBasicTraining('army');
    expect(skills).toEqual(expect.arrayContaining(['Athletics', 'Drive', 'Gun Combat', 'Medic', 'Melee', 'Recon']));
    expect(skills).toHaveLength(6);
  });

  it('returns correct skills for marines', () => {
    const skills = getAcademyBasicTraining('marines');
    expect(skills).toEqual(expect.arrayContaining(['Athletics', 'Gun Combat', 'Heavy Weapons', 'Medic', 'Melee', 'Vacc Suit']));
    expect(skills).toHaveLength(6);
  });

  it('returns correct skills for navy', () => {
    const skills = getAcademyBasicTraining('navy');
    expect(skills).toEqual(expect.arrayContaining(['Athletics', 'Electronics', 'Engineer', 'Gunner', 'Mechanic', 'Vacc Suit']));
    expect(skills).toHaveLength(6);
  });
});

describe('applyGraduationBenefits', () => {
  describe('university', () => {
    it('honours: EDU+2, skill bonus +1, commission eligible', () => {
      const benefits = applyGraduationBenefits('honours', 'university');
      expect(benefits.eduBonus).toBe(2);
      expect(benefits.skillLevelBonus).toBe(1);
      expect(benefits.commissionEligible).toBe(true);
    });

    it('graduated: EDU+1, no skill bonus, not commission eligible', () => {
      const benefits = applyGraduationBenefits('graduated', 'university');
      expect(benefits.eduBonus).toBe(1);
      expect(benefits.skillLevelBonus).toBe(0);
      expect(benefits.commissionEligible).toBe(false);
    });

    it('failed: no bonuses', () => {
      const benefits = applyGraduationBenefits('failed', 'university');
      expect(benefits.eduBonus).toBe(0);
      expect(benefits.skillLevelBonus).toBe(0);
      expect(benefits.commissionEligible).toBe(false);
    });
  });

  describe('academy', () => {
    it('honours: EDU+1, skill bonus +1, commission eligible', () => {
      const benefits = applyGraduationBenefits('honours', 'academy');
      expect(benefits.eduBonus).toBe(1);
      expect(benefits.skillLevelBonus).toBe(1);
      expect(benefits.commissionEligible).toBe(true);
    });

    it('graduated: no EDU bonus, no skill bonus, not commission eligible', () => {
      const benefits = applyGraduationBenefits('graduated', 'academy');
      expect(benefits.eduBonus).toBe(0);
      expect(benefits.skillLevelBonus).toBe(0);
      expect(benefits.commissionEligible).toBe(false);
    });

    it('failed: no bonuses', () => {
      const benefits = applyGraduationBenefits('failed', 'academy');
      expect(benefits.eduBonus).toBe(0);
      expect(benefits.skillLevelBonus).toBe(0);
      expect(benefits.commissionEligible).toBe(false);
    });
  });
});
