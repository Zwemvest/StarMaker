import { describe, it, expect } from 'vitest';
import {
  EDUCATION_PATHS,
  EDUCATION_TERM_DM,
  MAX_EDUCATION_TERMS,
  GRADUATION_TARGET,
  HONOURS_THRESHOLD,
  UNIVERSITY_SKILLS,
  ACADEMY_SERVICE_SKILLS,
} from '../../src/data/education';
import type { EducationPath } from '../../src/types/education';

describe('EDUCATION_PATHS', () => {
  it('has exactly 4 entries', () => {
    expect(EDUCATION_PATHS).toHaveLength(4);
  });

  it('includes University with correct entry requirements', () => {
    const uni = EDUCATION_PATHS.find((p) => p.type === 'university');
    expect(uni).toBeDefined();
    expect(uni!.entryCharacteristic).toBe('EDU');
    expect(uni!.entryTarget).toBe(7);
    expect(uni!.socBonus).toBe(true);
  });

  it('includes Academy(Army) with END 8+', () => {
    const army = EDUCATION_PATHS.find((p) => p.type === 'academy' && p.branch === 'army');
    expect(army).toBeDefined();
    expect(army!.entryCharacteristic).toBe('END');
    expect(army!.entryTarget).toBe(8);
    expect(army!.socBonus).toBe(false);
  });

  it('includes Academy(Marines) with END 9+', () => {
    const marines = EDUCATION_PATHS.find((p) => p.type === 'academy' && p.branch === 'marines');
    expect(marines).toBeDefined();
    expect(marines!.entryCharacteristic).toBe('END');
    expect(marines!.entryTarget).toBe(9);
    expect(marines!.socBonus).toBe(false);
  });

  it('includes Academy(Navy) with INT 9+', () => {
    const navy = EDUCATION_PATHS.find((p) => p.type === 'academy' && p.branch === 'navy');
    expect(navy).toBeDefined();
    expect(navy!.entryCharacteristic).toBe('INT');
    expect(navy!.entryTarget).toBe(9);
    expect(navy!.socBonus).toBe(false);
  });

  it('each path has label and description', () => {
    for (const path of EDUCATION_PATHS) {
      expect(path.label).toBeTruthy();
      expect(path.description).toBeTruthy();
    }
  });
});

describe('Education constants', () => {
  it('EDUCATION_TERM_DM is -1', () => {
    expect(EDUCATION_TERM_DM).toBe(-1);
  });

  it('MAX_EDUCATION_TERMS is 3', () => {
    expect(MAX_EDUCATION_TERMS).toBe(3);
  });

  it('GRADUATION_TARGET is 7', () => {
    expect(GRADUATION_TARGET).toBe(7);
  });

  it('HONOURS_THRESHOLD is 11', () => {
    expect(HONOURS_THRESHOLD).toBe(11);
  });
});

describe('UNIVERSITY_SKILLS', () => {
  it('contains academic skills for university selection', () => {
    const expected = [
      'Admin', 'Advocate', 'Animals (Training)', 'Art', 'Astrogation',
      'Electronics', 'Engineer', 'Language', 'Medic', 'Navigation',
      'Science', 'Survival',
    ];
    for (const skill of expected) {
      expect(UNIVERSITY_SKILLS, `Missing: ${skill}`).toContain(skill);
    }
  });

  it('is non-empty', () => {
    expect(UNIVERSITY_SKILLS.length).toBeGreaterThan(0);
  });
});

describe('ACADEMY_SERVICE_SKILLS', () => {
  it('maps army to correct service skills', () => {
    expect(ACADEMY_SERVICE_SKILLS.army).toEqual(
      expect.arrayContaining(['Athletics', 'Drive', 'Gun Combat', 'Medic', 'Melee', 'Recon']),
    );
    expect(ACADEMY_SERVICE_SKILLS.army).toHaveLength(6);
  });

  it('maps marines to correct service skills', () => {
    expect(ACADEMY_SERVICE_SKILLS.marines).toEqual(
      expect.arrayContaining(['Athletics', 'Gun Combat', 'Heavy Weapons', 'Medic', 'Melee', 'Vacc Suit']),
    );
    expect(ACADEMY_SERVICE_SKILLS.marines).toHaveLength(6);
  });

  it('maps navy to correct service skills', () => {
    expect(ACADEMY_SERVICE_SKILLS.navy).toEqual(
      expect.arrayContaining(['Athletics', 'Electronics', 'Engineer', 'Gunner', 'Mechanic', 'Vacc Suit']),
    );
    expect(ACADEMY_SERVICE_SKILLS.navy).toHaveLength(6);
  });
});
