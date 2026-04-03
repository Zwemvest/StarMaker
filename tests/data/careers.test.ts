import { describe, it, expect } from 'vitest';
import { CAREERS, getCareer, ALL_CAREER_NAMES } from '../../src/data/careers/index';
import type { CareerName } from '../../src/types/careers';

const MILITARY_CAREERS: CareerName[] = ['army', 'marine', 'navy'];
const CIVILIAN_CAREERS: CareerName[] = [
  'agent',
  'citizen',
  'drifter',
  'entertainer',
  'merchant',
  'noble',
  'rogue',
  'scholar',
  'scout',
];
const BASIC_TRAINING_EXCEPTION_CAREERS: CareerName[] = ['citizen', 'drifter'];

describe('Career Data Index', () => {
  it('exports all 12 career names', () => {
    expect(ALL_CAREER_NAMES).toHaveLength(12);
  });

  it('has all 12 careers in the CAREERS map', () => {
    expect(Object.keys(CAREERS)).toHaveLength(12);
    for (const name of ALL_CAREER_NAMES) {
      expect(CAREERS[name]).toBeDefined();
    }
  });

  it('getCareer returns valid data for each career', () => {
    for (const name of ALL_CAREER_NAMES) {
      const career = getCareer(name);
      expect(career).toBeDefined();
      expect(career.name).toBeTruthy();
    }
  });
});

describe('Career Assignments', () => {
  it.each(ALL_CAREER_NAMES)('%s has exactly 3 assignments', (name) => {
    const career = getCareer(name);
    expect(career.assignments).toHaveLength(3);
  });

  it.each(ALL_CAREER_NAMES)('%s has 6 specialist skills per assignment', (name) => {
    const career = getCareer(name);
    for (const assignment of career.assignments) {
      expect(assignment.specialistSkills).toHaveLength(6);
    }
  });

  it.each(ALL_CAREER_NAMES)('%s assignments have survival and advancement targets', (name) => {
    const career = getCareer(name);
    for (const assignment of career.assignments) {
      expect(assignment.survival.characteristic).toBeTruthy();
      expect(assignment.survival.target).toBeGreaterThanOrEqual(2);
      expect(assignment.advancement.characteristic).toBeTruthy();
      expect(assignment.advancement.target).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('Career Events', () => {
  it.each(ALL_CAREER_NAMES)('%s has exactly 11 events (rolls 2-12)', (name) => {
    const career = getCareer(name);
    expect(career.events).toHaveLength(11);
  });

  it.each(ALL_CAREER_NAMES)('%s events have sequential roll values 2-12', (name) => {
    const career = getCareer(name);
    for (let i = 0; i < career.events.length; i++) {
      expect(career.events[i].rollValue).toBe(i + 2);
    }
  });

  it.each(ALL_CAREER_NAMES)('%s has exactly 6 mishaps (rolls 1-6)', (name) => {
    const career = getCareer(name);
    expect(career.mishaps).toHaveLength(6);
  });

  it.each(ALL_CAREER_NAMES)('%s mishaps have sequential roll values 1-6', (name) => {
    const career = getCareer(name);
    for (let i = 0; i < career.mishaps.length; i++) {
      expect(career.mishaps[i].rollValue).toBe(i + 1);
    }
  });
});

describe('Military vs Civilian Careers', () => {
  it.each(MILITARY_CAREERS)('%s is military with commission', (name) => {
    const career = getCareer(name);
    expect(career.isMilitary).toBe(true);
    expect(career.commission).not.toBeNull();
    expect(career.commission!.characteristic).toBeTruthy();
    expect(career.commission!.target).toBeGreaterThan(0);
  });

  it.each(MILITARY_CAREERS)('%s has officer ranks', (name) => {
    const career = getCareer(name);
    expect(career.ranks.officer).toBeDefined();
    expect(career.ranks.officer!.length).toBeGreaterThan(0);
  });

  it.each(MILITARY_CAREERS)('%s has officer skill table', (name) => {
    const career = getCareer(name);
    expect(career.skillTables.officer).toBeDefined();
    expect(career.skillTables.officer).toHaveLength(6);
  });

  it.each(CIVILIAN_CAREERS)('%s is civilian without commission', (name) => {
    const career = getCareer(name);
    expect(career.isMilitary).toBe(false);
    expect(career.commission).toBeNull();
  });
});

describe('Special Career Rules', () => {
  it.each(BASIC_TRAINING_EXCEPTION_CAREERS)(
    '%s has basicTrainingException set to true',
    (name) => {
      const career = getCareer(name);
      expect(career.basicTrainingException).toBe(true);
    },
  );

  it('drifter has null qualification (auto-entry)', () => {
    const drifter = getCareer('drifter');
    expect(drifter.qualification).toBeNull();
  });

  it.each(ALL_CAREER_NAMES.filter((n) => n !== 'drifter'))(
    '%s has a qualification requirement',
    (name) => {
      const career = getCareer(name);
      expect(career.qualification).not.toBeNull();
      expect(career.qualification!.characteristic).toBeTruthy();
      expect(career.qualification!.target).toBeGreaterThan(0);
    },
  );
});

describe('Mustering Out Tables', () => {
  it.each(ALL_CAREER_NAMES)('%s has 7 cash values', (name) => {
    const career = getCareer(name);
    expect(career.musteringOut.cash).toHaveLength(7);
  });

  it.each(ALL_CAREER_NAMES)('%s has 7 benefit entries', (name) => {
    const career = getCareer(name);
    expect(career.musteringOut.benefits).toHaveLength(7);
  });

  it.each(ALL_CAREER_NAMES)('%s cash values are non-negative integers', (name) => {
    const career = getCareer(name);
    for (const cash of career.musteringOut.cash) {
      expect(cash).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(cash)).toBe(true);
    }
  });
});

describe('Rank Tables', () => {
  it.each(ALL_CAREER_NAMES)('%s has enlisted ranks', (name) => {
    const career = getCareer(name);
    expect(career.ranks.enlisted.length).toBeGreaterThan(0);
  });

  it.each(ALL_CAREER_NAMES)('%s enlisted ranks have valid level structure', (name) => {
    const career = getCareer(name);
    for (const rank of career.ranks.enlisted) {
      expect(rank.level).toBeGreaterThanOrEqual(0);
      expect(rank.level).toBeLessThanOrEqual(6);
      expect(typeof rank.title).toBe('string');
    }
  });
});

describe('Skill Tables', () => {
  it.each(ALL_CAREER_NAMES)('%s has 6 personal development skills', (name) => {
    const career = getCareer(name);
    expect(career.skillTables.personalDevelopment).toHaveLength(6);
  });

  it.each(ALL_CAREER_NAMES)('%s has 6 service skills', (name) => {
    const career = getCareer(name);
    expect(career.skillTables.serviceSkills).toHaveLength(6);
  });

  it.each(ALL_CAREER_NAMES)('%s has 6 advanced education skills', (name) => {
    const career = getCareer(name);
    expect(career.skillTables.advancedEducation).toHaveLength(6);
  });
});
