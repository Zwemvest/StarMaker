import type { Characteristics } from '../types/character';
import type { EducationPath, AcademyBranch, GraduationResult, EducationType } from '../types/education';
import {
  EDUCATION_TERM_DM,
  MAX_EDUCATION_TERMS,
  GRADUATION_TARGET,
  HONOURS_THRESHOLD,
  UNIVERSITY_SKILLS,
  ACADEMY_SERVICE_SKILLS,
} from '../data/education';

/**
 * Calculate the dice modifier for an education entry roll.
 * Includes term penalty (DM-1 per previous attempt) and SOC bonus for university.
 */
export function calculateEntryDM(
  educationTermsUsed: number,
  characteristics: Characteristics,
  path: EducationPath,
): number {
  let dm = educationTermsUsed > 0 ? EDUCATION_TERM_DM * educationTermsUsed : 0;

  if (path.socBonus && characteristics.SOC >= 9) {
    dm += 1;
  }

  return dm;
}

/**
 * Resolve an education entry roll against a target number.
 * Pure function: takes dice total, DM, and target; returns result.
 */
export function resolveEntryRoll(
  diceTotal: number,
  dm: number,
  target: number,
): { success: boolean; total: number; target: number; dm: number } {
  const total = diceTotal + dm;
  return {
    success: total >= target,
    total,
    target,
    dm,
  };
}

/**
 * Resolve a graduation roll.
 * Honours: total >= 11, Graduated: total >= 7, Failed: otherwise.
 */
export function resolveGraduation(
  diceTotal: number,
  dm: number,
): { result: GraduationResult; total: number } {
  const total = diceTotal + dm;

  let result: GraduationResult;
  if (total >= HONOURS_THRESHOLD) {
    result = 'honours';
  } else if (total >= GRADUATION_TARGET) {
    result = 'graduated';
  } else {
    result = 'failed';
  }

  return { result, total };
}

/**
 * Check if another education term can be attempted.
 * Maximum 3 terms (indices 0, 1, 2).
 */
export function canAttemptEducation(educationTermsUsed: number): boolean {
  return educationTermsUsed < MAX_EDUCATION_TERMS;
}

/**
 * Get the list of skills available during a university term.
 */
export function getAvailableUniversitySkills(): string[] {
  return UNIVERSITY_SKILLS;
}

/**
 * Get the basic training skills for a military academy branch.
 * Academy graduates receive all service skills of the tied career at Level 0.
 */
export function getAcademyBasicTraining(branch: AcademyBranch): string[] {
  return ACADEMY_SERVICE_SKILLS[branch];
}

/**
 * Calculate graduation benefits based on result and education type.
 *
 * Honours (university): EDU+2, +1 to chosen skill levels, commission eligible
 * Honours (academy): EDU+1, +1 skill level bonus, commission eligible
 * Graduated (university): EDU+1, no skill bonus, not commission eligible
 * Graduated (academy): no EDU bonus, no skill bonus, auto-entry but no commission (EDUC-10)
 * Failed: no benefits (skills earned during term are retained per EDUC-09)
 */
export function applyGraduationBenefits(
  result: GraduationResult,
  educationType: EducationType,
): { eduBonus: number; skillLevelBonus: number; commissionEligible: boolean } {
  if (result === 'failed') {
    return { eduBonus: 0, skillLevelBonus: 0, commissionEligible: false };
  }

  if (result === 'honours') {
    return {
      eduBonus: educationType === 'university' ? 2 : 1,
      skillLevelBonus: 1,
      commissionEligible: true,
    };
  }

  // graduated (not honours)
  return {
    eduBonus: educationType === 'university' ? 1 : 0,
    skillLevelBonus: 0,
    commissionEligible: false,
  };
}
