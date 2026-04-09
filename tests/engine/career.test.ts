import { describe, it, expect } from 'vitest';
import {
  calculateQualificationDM,
  resolveQualificationRoll,
  resolveSurvivalRoll,
  resolveCommissionRoll,
  resolveAdvancementRoll,
  getAvailableSkillTables,
  applyRankSkill,
  isSkillAtCap,
  isOverSkillLimit,
  getTotalSkillLevels,
  getBasicTrainingSkills,
  getDraftCareer,
  canReturnToCareer,
  resolveAssignmentChange,
  getNobleTitle,
} from '../../src/engine/career';
import type { CareerData, RankTables, SkillTables } from '../../src/types/careers';
import type { Skill } from '../../src/types/character';

/** Helper to create minimal career data for testing */
function makeCareerData(overrides: Partial<CareerData> = {}): CareerData {
  const defaultRanks: RankTables = {
    enlisted: Array.from({ length: 7 }, (_, i) => ({
      level: i,
      title: i === 0 ? '' : `Rank ${i}`,
      bonusSkill: i === 1 ? 'Gun Combat' : null,
      bonusSkillLevel: i === 1 ? 1 : undefined,
    })),
    officer: null,
  };

  const defaultSkillTables: SkillTables = {
    personalDevelopment: ['STR', 'DEX', 'END', 'Gun Combat', 'Melee', 'Athletics'],
    serviceSkills: ['Streetwise', 'Drive', 'Investigate', 'Flyer', 'Recon', 'Gun Combat'],
    advancedEducation: ['Advocate', 'Language', 'Explosives', 'Medic', 'Vacc Suit', 'Electronics'],
    officer: null,
  };

  return {
    name: 'agent',
    description: 'Test career',
    qualification: { characteristic: 'INT', target: 6 },
    assignments: [
      {
        name: 'Law Enforcement',
        description: 'Test',
        survival: { characteristic: 'END', target: 6 },
        advancement: { characteristic: 'INT', target: 7 },
        specialistSkills: ['Investigate', 'Recon', 'Streetwise', 'Stealth', 'Melee', 'Advocate'],
      },
      {
        name: 'Intelligence',
        description: 'Test',
        survival: { characteristic: 'INT', target: 7 },
        advancement: { characteristic: 'INT', target: 5 },
        specialistSkills: ['Investigate', 'Recon', 'Comms', 'Stealth', 'Persuade', 'Deception'],
      },
      {
        name: 'Corporate',
        description: 'Test',
        survival: { characteristic: 'INT', target: 5 },
        advancement: { characteristic: 'INT', target: 7 },
        specialistSkills: ['Investigate', 'Admin', 'Advocate', 'Diplomat', 'Stealth', 'Gun Combat'],
      },
    ],
    isMilitary: false,
    commission: null,
    ranks: defaultRanks,
    skillTables: defaultSkillTables,
    events: Array.from({ length: 11 }, (_, i) => ({
      rollValue: i + 2,
      description: `Event ${i + 2}`,
      effectDescription: `Effect ${i + 2}`,
      effects: [],
      hasChoice: false,
    })),
    mishaps: Array.from({ length: 6 }, (_, i) => ({
      rollValue: i + 1,
      description: `Mishap ${i + 1}`,
      effectDescription: `Effect ${i + 1}`,
      effects: [],
    })),
    musteringOut: {
      cash: [1000, 2000, 5000, 7500, 10000, 25000, 50000],
      benefits: ['Eq', 'INT +1', 'Ship', 'Weapon', 'Implant', 'SOC +1', 'TAS'],
    },
    basicTrainingException: false,
    ...overrides,
  };
}

describe('calculateQualificationDM', () => {
  it('returns 0 for no previous careers', () => {
    expect(calculateQualificationDM(0)).toBe(0);
  });

  it('returns -1 for 1 previous career', () => {
    expect(calculateQualificationDM(1)).toBe(-1);
  });

  it('returns -2 for 2 previous careers', () => {
    expect(calculateQualificationDM(2)).toBe(-2);
  });

  it('returns -3 for 3 previous careers', () => {
    expect(calculateQualificationDM(3)).toBe(-3);
  });
});

describe('resolveQualificationRoll', () => {
  it('succeeds when total meets target', () => {
    const result = resolveQualificationRoll(7, 0, 7);
    expect(result).toEqual({ success: true, total: 7 });
  });

  it('fails when total is below target', () => {
    const result = resolveQualificationRoll(6, 0, 7);
    expect(result).toEqual({ success: false, total: 6 });
  });

  it('succeeds with positive DM', () => {
    const result = resolveQualificationRoll(5, 2, 7);
    expect(result).toEqual({ success: true, total: 7 });
  });

  it('fails with negative DM', () => {
    const result = resolveQualificationRoll(7, -1, 7);
    expect(result).toEqual({ success: false, total: 6 });
  });
});

describe('resolveSurvivalRoll', () => {
  it('survives when total meets target', () => {
    const result = resolveSurvivalRoll(7, 0, 7);
    expect(result).toEqual({ survived: true, isMishap: false, naturalTwo: false });
  });

  it('fails when total below target', () => {
    const result = resolveSurvivalRoll(5, 0, 7);
    expect(result).toEqual({ survived: false, isMishap: true, naturalTwo: false });
  });

  it('natural 2 always fails even with high DM (CRER-07)', () => {
    const result = resolveSurvivalRoll(2, 5, 5);
    expect(result.survived).toBe(false);
    expect(result.isMishap).toBe(true);
    expect(result.naturalTwo).toBe(true);
  });

  it('natural 2 always fails even when total exceeds target', () => {
    // diceTotal=2, dm=+10, target=5 — total would be 12, but natural 2 overrides
    const result = resolveSurvivalRoll(2, 10, 5);
    expect(result.survived).toBe(false);
    expect(result.naturalTwo).toBe(true);
  });

  it('survives at exactly the target', () => {
    const result = resolveSurvivalRoll(6, 1, 7);
    expect(result.survived).toBe(true);
  });
});

describe('resolveCommissionRoll', () => {
  it('succeeds when total meets target', () => {
    const result = resolveCommissionRoll(8, 0, 8, 1);
    expect(result).toEqual({ success: true, total: 8 });
  });

  it('fails when total below target', () => {
    const result = resolveCommissionRoll(6, 0, 8, 1);
    expect(result).toEqual({ success: false, total: 6 });
  });

  it('applies DM-1 per term after first (CRER-11)', () => {
    // termsInCareer=3, so DM is -2 (terms after first)
    const result = resolveCommissionRoll(8, 0, 8, 3);
    expect(result.total).toBe(6); // 8 + 0 - 2 = 6
    expect(result.success).toBe(false);
  });

  it('no penalty on first term', () => {
    const result = resolveCommissionRoll(8, 0, 8, 1);
    expect(result.total).toBe(8);
    expect(result.success).toBe(true);
  });

  it('includes characteristic DM in total', () => {
    const result = resolveCommissionRoll(6, 2, 8, 1);
    expect(result.total).toBe(8); // 6 + 2 = 8
    expect(result.success).toBe(true);
  });
});

describe('resolveAdvancementRoll', () => {
  it('advances when total meets target', () => {
    const result = resolveAdvancementRoll(8, 0, 8, 1);
    expect(result.advanced).toBe(true);
    expect(result.forcedToLeave).toBe(false);
    expect(result.forcedToStay).toBe(false);
  });

  it('fails when total below target', () => {
    const result = resolveAdvancementRoll(5, 0, 8, 1);
    expect(result.advanced).toBe(false);
  });

  it('natural 12 forces staying regardless of target (CRER-14)', () => {
    const result = resolveAdvancementRoll(12, -5, 20, 1);
    expect(result.advanced).toBe(false); // total 7 < 20
    expect(result.forcedToStay).toBe(true);
    expect(result.forcedToLeave).toBe(false);
  });

  it('forced to leave when total <= terms served (CRER-13)', () => {
    const result = resolveAdvancementRoll(3, 0, 8, 5);
    expect(result.advanced).toBe(false);
    expect(result.forcedToLeave).toBe(true);
    expect(result.forcedToStay).toBe(false);
  });

  it('forced to leave takes priority over advancement when total <= terms', () => {
    // Total is 3 which is <= 5 terms, but let's check with higher total
    const result = resolveAdvancementRoll(5, 0, 4, 5);
    // total 5 >= target 4, so advanced, but also total 5 <= 5 terms
    // Per rules: advancement succeeds first, forced leave is separate check
    expect(result.advanced).toBe(true);
    expect(result.forcedToLeave).toBe(true);
  });

  it('natural 12 with advancement success forces stay', () => {
    const result = resolveAdvancementRoll(12, 0, 8, 1);
    expect(result.advanced).toBe(true); // 12 >= 8
    expect(result.forcedToStay).toBe(true);
  });
});

describe('getAvailableSkillTables', () => {
  it('returns base tables for non-commissioned with low EDU', () => {
    const tables = getAvailableSkillTables(makeCareerData(), false, 7);
    expect(tables).toEqual(['personalDevelopment', 'serviceSkills', 'specialist']);
  });

  it('adds advancedEducation when EDU >= 8 (CRER-17)', () => {
    const tables = getAvailableSkillTables(makeCareerData(), false, 8);
    expect(tables).toContain('advancedEducation');
  });

  it('adds officer table when commissioned', () => {
    const career = makeCareerData({
      isMilitary: true,
      skillTables: {
        personalDevelopment: ['STR', 'DEX', 'END', 'Gun Combat', 'Melee', 'Athletics'],
        serviceSkills: ['Streetwise', 'Drive', 'Investigate', 'Flyer', 'Recon', 'Gun Combat'],
        advancedEducation: ['Advocate', 'Language', 'Explosives', 'Medic', 'Vacc Suit', 'Electronics'],
        officer: ['Tactics', 'Leadership', 'Advocate', 'Diplomat', 'Electronics', 'Admin'],
      },
    });
    const tables = getAvailableSkillTables(career, true, 7);
    expect(tables).toContain('officer');
  });

  it('includes both officer and advancedEducation when applicable', () => {
    const career = makeCareerData({
      isMilitary: true,
      skillTables: {
        personalDevelopment: ['STR', 'DEX', 'END', 'Gun Combat', 'Melee', 'Athletics'],
        serviceSkills: ['Streetwise', 'Drive', 'Investigate', 'Flyer', 'Recon', 'Gun Combat'],
        advancedEducation: ['Advocate', 'Language', 'Explosives', 'Medic', 'Vacc Suit', 'Electronics'],
        officer: ['Tactics', 'Leadership', 'Advocate', 'Diplomat', 'Electronics', 'Admin'],
      },
    });
    const tables = getAvailableSkillTables(career, true, 8);
    expect(tables).toContain('officer');
    expect(tables).toContain('advancedEducation');
  });
});

describe('applyRankSkill', () => {
  it('returns bonus skill for rank with bonus', () => {
    const career = makeCareerData();
    const result = applyRankSkill(career, 1, false);
    expect(result).toEqual({ skill: 'Gun Combat', level: 1 });
  });

  it('returns null for rank without bonus', () => {
    const career = makeCareerData();
    const result = applyRankSkill(career, 0, false);
    expect(result).toBeNull();
  });

  it('uses officer ranks when isOfficer is true', () => {
    const career = makeCareerData({
      ranks: {
        enlisted: Array.from({ length: 7 }, (_, i) => ({
          level: i,
          title: '',
          bonusSkill: null,
        })),
        officer: Array.from({ length: 7 }, (_, i) => ({
          level: i,
          title: i === 1 ? 'Lieutenant' : '',
          bonusSkill: i === 1 ? 'Leadership' : null,
          bonusSkillLevel: 1,
        })),
      },
    });
    const result = applyRankSkill(career, 1, true);
    expect(result).toEqual({ skill: 'Leadership', level: 1 });
  });
});

describe('isSkillAtCap', () => {
  it('returns true for level 4 (CRER-18)', () => {
    expect(isSkillAtCap(4)).toBe(true);
  });

  it('returns true for level above 4', () => {
    expect(isSkillAtCap(5)).toBe(true);
  });

  it('returns false for level 3', () => {
    expect(isSkillAtCap(3)).toBe(false);
  });

  it('returns false for level 0', () => {
    expect(isSkillAtCap(0)).toBe(false);
  });
});

describe('isOverSkillLimit', () => {
  it('returns false when under limit (CRER-19)', () => {
    const skills: Skill[] = [{ name: 'a', level: 3 }, { name: 'b', level: 2 }];
    expect(isOverSkillLimit(skills, 7, 7)).toBe(false); // 5 <= 42
  });

  it('returns true when over limit', () => {
    const skills: Skill[] = [{ name: 'a', level: 20 }, { name: 'b', level: 25 }];
    expect(isOverSkillLimit(skills, 2, 2)).toBe(true); // 45 > 12
  });

  it('returns false when exactly at limit', () => {
    const skills: Skill[] = [{ name: 'a', level: 6 }];
    expect(isOverSkillLimit(skills, 1, 1)).toBe(false); // 6 <= 6
  });
});

describe('getTotalSkillLevels', () => {
  it('sums all skill levels', () => {
    const skills: Skill[] = [
      { name: 'a', level: 3 },
      { name: 'b', level: 2 },
      { name: 'c', level: 1 },
    ];
    expect(getTotalSkillLevels(skills)).toBe(6);
  });

  it('returns 0 for empty array', () => {
    expect(getTotalSkillLevels([])).toBe(0);
  });
});

describe('getBasicTrainingSkills', () => {
  it('returns all service skills for first career (CRER-04)', () => {
    const career = makeCareerData();
    const skills = getBasicTrainingSkills(career, true, 0);
    expect(skills).toEqual(career.skillTables.serviceSkills);
  });

  it('returns service skills pool for subsequent careers (CRER-04, caller picks one)', () => {
    const career = makeCareerData();
    const skills = getBasicTrainingSkills(career, false, 0);
    expect(skills).toEqual(career.skillTables.serviceSkills);
  });

  it('returns assignment specialist skills for Citizen/Drifter exception (CRER-05)', () => {
    const career = makeCareerData({ basicTrainingException: true });
    const skills = getBasicTrainingSkills(career, true, 0);
    expect(skills).toEqual(career.assignments[0].specialistSkills);
  });

  it('returns correct assignment specialist skills by index', () => {
    const career = makeCareerData({ basicTrainingException: true });
    const skills = getBasicTrainingSkills(career, true, 1);
    expect(skills).toEqual(career.assignments[1].specialistSkills);
  });

  it('returns assignment specialist skills for Citizen/Drifter subsequent career (CRER-05)', () => {
    const career = makeCareerData({ basicTrainingException: true });
    const skills = getBasicTrainingSkills(career, false, 2);
    expect(skills).toEqual(career.assignments[2].specialistSkills);
  });
});

describe('getDraftCareer', () => {
  it('returns Navy for roll 1 (CRER-20)', () => {
    expect(getDraftCareer(1)).toBe('navy');
  });

  it('returns Army for roll 2', () => {
    expect(getDraftCareer(2)).toBe('army');
  });

  it('returns Marine for roll 3', () => {
    expect(getDraftCareer(3)).toBe('marine');
  });

  it('returns Merchant for roll 4', () => {
    expect(getDraftCareer(4)).toBe('merchant');
  });

  it('returns Scout for roll 5', () => {
    expect(getDraftCareer(5)).toBe('scout');
  });

  it('returns Agent for roll 6', () => {
    expect(getDraftCareer(6)).toBe('agent');
  });
});

describe('canReturnToCareer', () => {
  it('returns false for same career (CRER-24)', () => {
    expect(canReturnToCareer('army', 'army')).toBe(false);
  });

  it('returns true for different career', () => {
    expect(canReturnToCareer('army', 'navy')).toBe(true);
  });
});

describe('resolveAssignmentChange', () => {
  it('same career different assignment: keep rank, no new qualification (CRER-23)', () => {
    const result = resolveAssignmentChange('army', 'Infantry', 'army', 'Cavalry');
    expect(result).toEqual({
      needsNewQualification: false,
      keepRank: true,
      changeType: 'same-career',
    });
  });

  it('different career: lose rank, need new qualification (CRER-23)', () => {
    const result = resolveAssignmentChange('army', 'Infantry', 'navy', 'Line/Crew');
    expect(result).toEqual({
      needsNewQualification: true,
      keepRank: false,
      changeType: 'new-career',
    });
  });
});

describe('getNobleTitle', () => {
  it('returns null for SOC below 11', () => {
    expect(getNobleTitle(10)).toBeNull();
  });

  it('returns Knight for SOC 11 (SOCL-02)', () => {
    expect(getNobleTitle(11)).toBe('Knight');
  });

  it('returns Baron for SOC 12', () => {
    expect(getNobleTitle(12)).toBe('Baron');
  });

  it('returns Marquis for SOC 13', () => {
    expect(getNobleTitle(13)).toBe('Marquis');
  });

  it('returns Count for SOC 14', () => {
    expect(getNobleTitle(14)).toBe('Count');
  });

  it('returns Duke for SOC 15', () => {
    expect(getNobleTitle(15)).toBe('Duke');
  });

  it('returns Duke for SOC 16+', () => {
    expect(getNobleTitle(16)).toBe('Duke');
  });
});
