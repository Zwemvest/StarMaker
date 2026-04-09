import { describe, it, expect } from 'vitest';
import { classifySkillBenefit } from '../../src/engine/skill-benefit';
import type { Skill } from '../../src/types/character';

describe('classifySkillBenefit', () => {
  it("returns 'new' when skill does not exist (empty list)", () => {
    const existing: Skill[] = [];
    expect(classifySkillBenefit(existing, 'Admin', 1)).toBe('new');
  });

  it("returns 'new' when skill does not exist (non-empty list)", () => {
    const existing: Skill[] = [{ name: 'Pilot', level: 2 }];
    expect(classifySkillBenefit(existing, 'Admin', 1)).toBe('new');
  });

  it("returns 'upgrade' when new level is higher than existing", () => {
    const existing: Skill[] = [{ name: 'Admin', level: 0 }];
    expect(classifySkillBenefit(existing, 'Admin', 1)).toBe('upgrade');
  });

  it("returns 'upgrade' when new level is much higher", () => {
    const existing: Skill[] = [{ name: 'Admin', level: 0 }];
    expect(classifySkillBenefit(existing, 'Admin', 3)).toBe('upgrade');
  });

  it("returns 'none' when existing level is equal", () => {
    const existing: Skill[] = [{ name: 'Admin', level: 1 }];
    expect(classifySkillBenefit(existing, 'Admin', 1)).toBe('none');
  });

  it("returns 'none' when existing level is higher", () => {
    const existing: Skill[] = [{ name: 'Admin', level: 2 }];
    expect(classifySkillBenefit(existing, 'Admin', 1)).toBe('none');
  });

  it('is case-sensitive (matches addSkill semantics)', () => {
    const existing: Skill[] = [{ name: 'admin', level: 2 }];
    // Different case — treated as a separate skill
    expect(classifySkillBenefit(existing, 'Admin', 1)).toBe('new');
  });

  it('does not mutate the existing skills array', () => {
    const existing: Skill[] = [{ name: 'Admin', level: 0 }];
    const snapshot = JSON.parse(JSON.stringify(existing));
    classifySkillBenefit(existing, 'Admin', 1);
    expect(existing).toEqual(snapshot);
  });

  it('finds the matching skill among many', () => {
    const existing: Skill[] = [
      { name: 'Pilot', level: 1 },
      { name: 'Admin', level: 2 },
      { name: 'Gun Combat', level: 0 },
    ];
    expect(classifySkillBenefit(existing, 'Admin', 1)).toBe('none');
    expect(classifySkillBenefit(existing, 'Admin', 3)).toBe('upgrade');
    expect(classifySkillBenefit(existing, 'Medic', 0)).toBe('new');
  });
});
