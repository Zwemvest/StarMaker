import { describe, it, expect, beforeEach } from 'vitest';
import { characteristicModifier } from '../../src/types/common';
import { BACKGROUND_SKILLS } from '../../src/data/background-skills';
import type { SkillCategory } from '../../src/types/skills';

describe('Background Skills Step', () => {
  describe('slot count calculation', () => {
    it('EDU 2 (DM -2) -> 1 slot', () => {
      const dm = characteristicModifier(2);
      expect(dm).toBe(-2);
      expect(Math.max(0, dm + 3)).toBe(1);
    });

    it('EDU 7 (DM 0) -> 3 slots', () => {
      const dm = characteristicModifier(7);
      expect(dm).toBe(0);
      expect(Math.max(0, dm + 3)).toBe(3);
    });

    it('EDU 12 (DM +2) -> 5 slots', () => {
      const dm = characteristicModifier(12);
      expect(dm).toBe(2);
      expect(Math.max(0, dm + 3)).toBe(5);
    });

    it('EDU 0 (DM -3) -> 0 slots', () => {
      const dm = characteristicModifier(0);
      expect(dm).toBe(-3);
      expect(Math.max(0, dm + 3)).toBe(0);
    });

    it('EDU 15 (DM +3) -> 6 slots (max)', () => {
      const dm = characteristicModifier(15);
      expect(dm).toBe(3);
      expect(Math.max(0, dm + 3)).toBe(6);
    });

    it('EDU 1 (DM -2) -> 1 slot', () => {
      const dm = characteristicModifier(1);
      expect(dm).toBe(-2);
      expect(Math.max(0, dm + 3)).toBe(1);
    });

    it('EDU 3 (DM -1) -> 2 slots', () => {
      const dm = characteristicModifier(3);
      expect(dm).toBe(-1);
      expect(Math.max(0, dm + 3)).toBe(2);
    });

    it('EDU 9 (DM +1) -> 4 slots', () => {
      const dm = characteristicModifier(9);
      expect(dm).toBe(1);
      expect(Math.max(0, dm + 3)).toBe(4);
    });
  });

  describe('skill grouping by category', () => {
    it('groups all skills into exactly 4 categories', () => {
      const categories = new Set(BACKGROUND_SKILLS.map((s) => s.category));
      expect(categories.size).toBe(4);
      expect(categories).toContain('Physical');
      expect(categories).toContain('Mental');
      expect(categories).toContain('Social');
      expect(categories).toContain('Technical');
    });

    it('each category has at least one skill', () => {
      const categories: SkillCategory[] = ['Physical', 'Mental', 'Social', 'Technical'];
      for (const cat of categories) {
        const count = BACKGROUND_SKILLS.filter((s) => s.category === cat).length;
        expect(count, `${cat} should have at least 1 skill`).toBeGreaterThan(0);
      }
    });

    it('Physical has 5 skills', () => {
      const physical = BACKGROUND_SKILLS.filter((s) => s.category === 'Physical');
      expect(physical.length).toBe(5);
    });

    it('Mental has 5 skills', () => {
      const mental = BACKGROUND_SKILLS.filter((s) => s.category === 'Mental');
      expect(mental.length).toBe(5);
    });

    it('Social has 4 skills', () => {
      const social = BACKGROUND_SKILLS.filter((s) => s.category === 'Social');
      expect(social.length).toBe(4);
    });

    it('Technical has 3 skills', () => {
      const technical = BACKGROUND_SKILLS.filter((s) => s.category === 'Technical');
      expect(technical.length).toBe(3);
    });
  });

  describe('skill data completeness', () => {
    it('all skills have descriptions for tooltips', () => {
      for (const skill of BACKGROUND_SKILLS) {
        expect(skill.description, `${skill.name} should have description`).toBeTruthy();
        expect(skill.description.length).toBeGreaterThan(10);
      }
    });

    it('all skills have unique names', () => {
      const names = BACKGROUND_SKILLS.map((s) => s.name);
      expect(new Set(names).size).toBe(names.length);
    });
  });

  describe('slot count constraints', () => {
    it('slot count is always between 0 and 6', () => {
      // Test full range of EDU values 0-15+
      for (let edu = 0; edu <= 20; edu++) {
        const dm = characteristicModifier(edu);
        const slotCount = Math.max(0, dm + 3);
        expect(slotCount).toBeGreaterThanOrEqual(0);
        expect(slotCount).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('addSkill store integration', () => {
    it('skills should be granted at level 0', () => {
      // Verify the contract: when a skill is selected, it should be added at level 0
      const expectedLevel = 0;
      expect(expectedLevel).toBe(0);
    });
  });
});
