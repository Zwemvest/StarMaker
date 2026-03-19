import type { EducationPath, AcademyBranch } from '../types/education';

/** All available pre-career education paths */
export const EDUCATION_PATHS: EducationPath[] = [
  {
    type: 'university',
    label: 'University',
    description: 'Academic education with skill training and EDU bonus',
    entryCharacteristic: 'EDU',
    entryTarget: 7,
    socBonus: true,
  },
  {
    type: 'academy',
    branch: 'army',
    label: 'Military Academy (Army)',
    description: 'Officer training for the Army with basic military skills',
    entryCharacteristic: 'END',
    entryTarget: 8,
    socBonus: false,
  },
  {
    type: 'academy',
    branch: 'marines',
    label: 'Military Academy (Marines)',
    description: 'Officer training for the Marines with combat specialisation',
    entryCharacteristic: 'END',
    entryTarget: 9,
    socBonus: false,
  },
  {
    type: 'academy',
    branch: 'navy',
    label: 'Military Academy (Navy)',
    description: 'Officer training for the Navy with technical and engineering focus',
    entryCharacteristic: 'INT',
    entryTarget: 9,
    socBonus: false,
  },
];

/** DM penalty per previous education attempt */
export const EDUCATION_TERM_DM = -1;

/** Maximum number of pre-career education terms (terms 1-3 only) */
export const MAX_EDUCATION_TERMS = 3;

/** Target number for graduation roll */
export const GRADUATION_TARGET = 7;

/** Roll total at or above this threshold = graduated with honours */
export const HONOURS_THRESHOLD = 11;

/** Academic skills available for selection during a university term */
export const UNIVERSITY_SKILLS: string[] = [
  'Admin',
  'Advocate',
  'Animals (Training)',
  'Art',
  'Astrogation',
  'Electronics',
  'Engineer',
  'Language',
  'Medic',
  'Navigation',
  'Science',
  'Survival',
];

/**
 * Service skills for each military academy branch.
 * Academy graduates receive all service skills of the tied career at Level 0.
 */
export const ACADEMY_SERVICE_SKILLS: Record<AcademyBranch, string[]> = {
  army: ['Athletics', 'Drive', 'Gun Combat', 'Medic', 'Melee', 'Recon'],
  marines: ['Athletics', 'Gun Combat', 'Heavy Weapons', 'Medic', 'Melee', 'Vacc Suit'],
  navy: ['Athletics', 'Electronics', 'Engineer', 'Gunner', 'Mechanic', 'Vacc Suit'],
};
