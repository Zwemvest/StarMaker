import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EDUCATION_PATHS } from '../../src/data/education';
import { EDUCATION_EVENTS } from '../../src/data/education-events';
import {
  resolveEntryRoll,
  resolveGraduation,
  applyGraduationBenefits,
  calculateEntryDM,
  canAttemptEducation,
  getAvailableUniversitySkills,
  getAcademyBasicTraining,
} from '../../src/engine/education';

describe('Education Components - Integration', () => {
  describe('Education Card Selection', () => {
    it('has university path available', () => {
      const university = EDUCATION_PATHS.find((p) => p.type === 'university');
      expect(university).toBeDefined();
      expect(university!.label).toBe('University');
      expect(university!.entryTarget).toBe(7);
      expect(university!.entryCharacteristic).toBe('EDU');
    });

    it('has all 3 academy branches available', () => {
      const academies = EDUCATION_PATHS.filter((p) => p.type === 'academy');
      expect(academies).toHaveLength(3);
      expect(academies.map((a) => a.branch)).toEqual(['army', 'marines', 'navy']);
    });

    it('academy branches have correct entry requirements', () => {
      const army = EDUCATION_PATHS.find((p) => p.branch === 'army')!;
      expect(army.entryCharacteristic).toBe('END');
      expect(army.entryTarget).toBe(8);

      const marines = EDUCATION_PATHS.find((p) => p.branch === 'marines')!;
      expect(marines.entryCharacteristic).toBe('END');
      expect(marines.entryTarget).toBe(9);

      const navy = EDUCATION_PATHS.find((p) => p.branch === 'navy')!;
      expect(navy.entryCharacteristic).toBe('INT');
      expect(navy.entryTarget).toBe(9);
    });
  });

  describe('Entry Roll Results', () => {
    it('success when total meets target', () => {
      const result = resolveEntryRoll(7, 0, 7);
      expect(result.success).toBe(true);
      expect(result.total).toBe(7);
    });

    it('success when total exceeds target', () => {
      const result = resolveEntryRoll(9, 1, 7);
      expect(result.success).toBe(true);
      expect(result.total).toBe(10);
    });

    it('failure when total below target', () => {
      const result = resolveEntryRoll(5, 0, 7);
      expect(result.success).toBe(false);
      expect(result.total).toBe(5);
    });

    it('failure with negative DM', () => {
      const result = resolveEntryRoll(7, -1, 7);
      expect(result.success).toBe(false);
      expect(result.total).toBe(6);
    });

    it('includes DM in result', () => {
      const result = resolveEntryRoll(6, 2, 7);
      expect(result.dm).toBe(2);
    });
  });

  describe('Graduation Results', () => {
    it('honours at 11+', () => {
      const result = resolveGraduation(11, 0);
      expect(result.result).toBe('honours');
    });

    it('honours at 12', () => {
      const result = resolveGraduation(12, 0);
      expect(result.result).toBe('honours');
    });

    it('graduated at 7-10', () => {
      for (let roll = 7; roll <= 10; roll++) {
        const result = resolveGraduation(roll, 0);
        expect(result.result).toBe('graduated');
      }
    });

    it('failed below 7', () => {
      const result = resolveGraduation(6, 0);
      expect(result.result).toBe('failed');
    });

    it('DM+2 can push to honours', () => {
      const result = resolveGraduation(9, 2);
      expect(result.result).toBe('honours');
      expect(result.total).toBe(11);
    });
  });

  describe('Graduation Benefits', () => {
    it('university honours: EDU+2, skill+1, commission eligible', () => {
      const benefits = applyGraduationBenefits('honours', 'university');
      expect(benefits.eduBonus).toBe(2);
      expect(benefits.skillLevelBonus).toBe(1);
      expect(benefits.commissionEligible).toBe(true);
    });

    it('academy honours: EDU+1, skill+1, commission eligible', () => {
      const benefits = applyGraduationBenefits('honours', 'academy');
      expect(benefits.eduBonus).toBe(1);
      expect(benefits.skillLevelBonus).toBe(1);
      expect(benefits.commissionEligible).toBe(true);
    });

    it('university graduated: EDU+1, no skill bonus, no commission', () => {
      const benefits = applyGraduationBenefits('graduated', 'university');
      expect(benefits.eduBonus).toBe(1);
      expect(benefits.skillLevelBonus).toBe(0);
      expect(benefits.commissionEligible).toBe(false);
    });

    it('academy graduated without honours: no EDU bonus, auto-entry but no commission (EDUC-10)', () => {
      const benefits = applyGraduationBenefits('graduated', 'academy');
      expect(benefits.eduBonus).toBe(0);
      expect(benefits.skillLevelBonus).toBe(0);
      expect(benefits.commissionEligible).toBe(false);
    });

    it('failed graduation: no benefits (EDUC-09)', () => {
      const benefits = applyGraduationBenefits('failed', 'university');
      expect(benefits.eduBonus).toBe(0);
      expect(benefits.skillLevelBonus).toBe(0);
      expect(benefits.commissionEligible).toBe(false);
    });
  });

  describe('Education Events', () => {
    it('has 11 events covering rolls 2-12', () => {
      expect(EDUCATION_EVENTS).toHaveLength(11);
      const rollValues = EDUCATION_EVENTS.map((e) => e.rollValue);
      for (let i = 2; i <= 12; i++) {
        expect(rollValues).toContain(i);
      }
    });

    it('each event has description and effect', () => {
      for (const event of EDUCATION_EVENTS) {
        expect(event.description).toBeTruthy();
        expect(event.effectDescription).toBeTruthy();
        expect(event.effects.length).toBeGreaterThan(0);
      }
    });

    it('events with hasChoice have choice effects', () => {
      const choiceEvents = EDUCATION_EVENTS.filter((e) => e.hasChoice);
      expect(choiceEvents.length).toBeGreaterThan(0);
      for (const event of choiceEvents) {
        const hasChoiceEffect = event.effects.some((e) => e.type === 'choice');
        expect(hasChoiceEffect).toBe(true);
      }
    });
  });

  describe('University Skills', () => {
    it('returns available university skills', () => {
      const skills = getAvailableUniversitySkills();
      expect(skills.length).toBeGreaterThan(0);
      expect(skills).toContain('Science');
      expect(skills).toContain('Medic');
    });
  });

  describe('Academy Basic Training', () => {
    it('army has 6 service skills', () => {
      const skills = getAcademyBasicTraining('army');
      expect(skills).toHaveLength(6);
      expect(skills).toContain('Gun Combat');
    });

    it('marines has 6 service skills', () => {
      const skills = getAcademyBasicTraining('marines');
      expect(skills).toHaveLength(6);
      expect(skills).toContain('Vacc Suit');
    });

    it('navy has 6 service skills', () => {
      const skills = getAcademyBasicTraining('navy');
      expect(skills).toHaveLength(6);
      expect(skills).toContain('Engineer');
    });
  });

  describe('Skip to Career', () => {
    it('SKIP_EDUCATION transitions to career state', () => {
      // This is tested in the XState machine tests (creation.test.ts)
      // Here we verify the path data supports it
      const university = EDUCATION_PATHS.find((p) => p.type === 'university');
      expect(university).toBeDefined();
      // Skip is handled as a direct event, not a path selection
    });
  });

  describe('Education DM Calculation', () => {
    it('no penalty for first attempt', () => {
      const dm = calculateEntryDM(0, { STR: 7, DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 7 }, EDUCATION_PATHS[0]);
      expect(dm).toBe(0);
    });

    it('DM-1 for second attempt', () => {
      const dm = calculateEntryDM(1, { STR: 7, DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 7 }, EDUCATION_PATHS[0]);
      expect(dm).toBe(-1);
    });

    it('SOC 9+ gives DM+1 for university', () => {
      const dm = calculateEntryDM(0, { STR: 7, DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 9 }, EDUCATION_PATHS[0]);
      expect(dm).toBe(1);
    });

    it('SOC 9+ does NOT give bonus for academy', () => {
      const armyPath = EDUCATION_PATHS.find((p) => p.branch === 'army')!;
      const dm = calculateEntryDM(0, { STR: 7, DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 9 }, armyPath);
      expect(dm).toBe(0);
    });
  });

  describe('Term Limits', () => {
    it('can attempt education with 0 terms used', () => {
      expect(canAttemptEducation(0)).toBe(true);
    });

    it('can attempt education with 2 terms used', () => {
      expect(canAttemptEducation(2)).toBe(true);
    });

    it('cannot attempt education with 3 terms used', () => {
      expect(canAttemptEducation(3)).toBe(false);
    });
  });
});
