import { describe, it, expect } from 'vitest';
import { BACKGROUND_SKILLS } from '../../src/data/background-skills';
import type { SkillCategory } from '../../src/types/skills';

describe('BACKGROUND_SKILLS', () => {
  it('contains at least 17 skills', () => {
    expect(BACKGROUND_SKILLS.length).toBeGreaterThanOrEqual(17);
  });

  it('each skill has name, category, and description', () => {
    for (const skill of BACKGROUND_SKILLS) {
      expect(skill.name).toBeTruthy();
      expect(skill.category).toBeTruthy();
      expect(skill.description).toBeTruthy();
    }
  });

  it('categories are valid SkillCategory values', () => {
    const validCategories: SkillCategory[] = ['Physical', 'Mental', 'Social', 'Technical'];
    for (const skill of BACKGROUND_SKILLS) {
      expect(validCategories).toContain(skill.category);
    }
  });

  it('includes all required Traveller 2E adolescence skills', () => {
    const requiredSkills = [
      'Admin', 'Animals', 'Art', 'Athletics', 'Carouse', 'Drive',
      'Electronics', 'Flyer', 'Language', 'Mechanic', 'Medic',
      'Profession', 'Science', 'Seafarer', 'Streetwise', 'Survival', 'Vacc Suit',
    ];
    const skillNames = BACKGROUND_SKILLS.map((s) => s.name);
    for (const required of requiredSkills) {
      expect(skillNames).toContain(required);
    }
  });

  it('assigns correct categories per plan specification', () => {
    const expectedCategories: Record<string, SkillCategory> = {
      Athletics: 'Physical',
      Drive: 'Physical',
      Flyer: 'Physical',
      Seafarer: 'Physical',
      'Vacc Suit': 'Physical',
      Admin: 'Mental',
      Electronics: 'Mental',
      Mechanic: 'Mental',
      Medic: 'Mental',
      Science: 'Mental',
      Art: 'Social',
      Carouse: 'Social',
      Language: 'Social',
      Streetwise: 'Social',
      Animals: 'Technical',
      Profession: 'Technical',
      Survival: 'Technical',
    };

    for (const [name, category] of Object.entries(expectedCategories)) {
      const skill = BACKGROUND_SKILLS.find((s) => s.name === name);
      expect(skill, `Skill "${name}" should exist`).toBeDefined();
      expect(skill!.category, `"${name}" should be ${category}`).toBe(category);
    }
  });

  it('has unique skill names (no duplicates)', () => {
    const names = BACKGROUND_SKILLS.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
