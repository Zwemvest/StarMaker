/**
 * Career engine for Mongoose Traveller 2E.
 * Pure functions: no side effects, no state mutations.
 * All functions take raw inputs and return result objects.
 */

import type { CareerData, CareerName, SkillEntry } from '../types/careers';
import type { Skill } from '../types/character';

/**
 * Calculate the qualification DM penalty for having previous careers.
 * DM-1 per previous career (CRER-03, CRER-22).
 */
export function calculateQualificationDM(previousCareersCount: number): number {
  return previousCareersCount === 0 ? 0 : -previousCareersCount;
}

/**
 * Resolve a qualification roll against a target number.
 * Simple threshold check: total >= target means success.
 */
export function resolveQualificationRoll(
  diceTotal: number,
  dm: number,
  target: number,
): { success: boolean; total: number } {
  const total = diceTotal + dm;
  return {
    success: total >= target,
    total,
  };
}

/**
 * Resolve a survival roll.
 * CRER-07: Natural 2 on the dice ALWAYS fails, regardless of DM.
 * The natural 2 check is applied BEFORE adding DM.
 */
export function resolveSurvivalRoll(
  diceTotal: number,
  dm: number,
  target: number,
): { survived: boolean; isMishap: boolean; naturalTwo: boolean } {
  // Natural 2 always fails (CRER-07)
  if (diceTotal === 2) {
    return { survived: false, isMishap: true, naturalTwo: true };
  }

  const total = diceTotal + dm;
  const survived = total >= target;
  return {
    survived,
    isMishap: !survived,
    naturalTwo: false,
  };
}

/**
 * Resolve a commission roll for military careers.
 * CRER-10: Commission check uses characteristic DM.
 * CRER-11: DM-1 per term after the first in this career.
 */
export function resolveCommissionRoll(
  diceTotal: number,
  dm: number,
  target: number,
  termsInCareer: number,
): { success: boolean; total: number } {
  // DM-1 per term after the first
  const termPenalty = Math.max(0, termsInCareer - 1);
  const total = diceTotal + dm - termPenalty;
  return {
    success: total >= target,
    total,
  };
}

/**
 * Resolve an advancement roll.
 * CRER-14: Natural 12 forces the character to stay (cannot leave voluntarily).
 * CRER-13: If the Effect (total - terms) is <= 0, character is forced to leave.
 *          Simplified: if total <= termsServed, forced to leave.
 */
export function resolveAdvancementRoll(
  diceTotal: number,
  dm: number,
  target: number,
  termsServed: number,
): { advanced: boolean; forcedToLeave: boolean; forcedToStay: boolean } {
  const total = diceTotal + dm;
  const advanced = total >= target;
  const forcedToStay = diceTotal === 12;
  const forcedToLeave = total <= termsServed;

  return {
    advanced,
    forcedToLeave,
    forcedToStay,
  };
}

/**
 * Get the list of available skill tables for a career term.
 * CRER-17: personalDevelopment and serviceSkills always available.
 * Specialist skills always available (selected by assignment).
 * Officer table available if commissioned.
 * Advanced Education available if EDU >= 8.
 */
export function getAvailableSkillTables(
  career: CareerData,
  isCommissioned: boolean,
  edu: number,
): string[] {
  const tables = ['personalDevelopment', 'serviceSkills', 'specialist'];

  if (isCommissioned && career.skillTables.officer !== null) {
    tables.push('officer');
  }

  if (edu >= 8) {
    tables.push('advancedEducation');
  }

  return tables;
}

/**
 * Look up the bonus skill for reaching a new rank.
 * CRER-15: Some ranks grant an automatic skill at a specific level.
 * Returns null if no bonus skill at this rank.
 */
export function applyRankSkill(
  career: CareerData,
  newRank: number,
  isOfficer: boolean,
): { skill: string; level: number } | null {
  const rankTable = isOfficer ? career.ranks.officer : career.ranks.enlisted;
  if (!rankTable) return null;

  const rankEntry = rankTable.find((r) => r.level === newRank);
  if (!rankEntry || !rankEntry.bonusSkill) return null;

  return {
    skill: rankEntry.bonusSkill,
    level: rankEntry.bonusSkillLevel ?? 1,
  };
}

/**
 * Check if a skill has reached the level 4 cap.
 * CRER-18: No skill may exceed level 4 during character creation.
 */
export function isSkillAtCap(currentLevel: number): boolean {
  return currentLevel >= 4;
}

/**
 * Check if the character's total skill levels exceed the limit.
 * CRER-19: Total skill levels must not exceed 3 * (INT + EDU).
 */
export function isOverSkillLimit(skills: Skill[], int: number, edu: number): boolean {
  const total = getTotalSkillLevels(skills);
  const limit = 3 * (int + edu);
  return total > limit;
}

/**
 * Sum all skill levels across a character's skill list.
 */
export function getTotalSkillLevels(skills: Skill[]): number {
  return skills.reduce((sum, s) => sum + s.level, 0);
}

/**
 * Get the list of service/specialist skill candidates for a career's basic training.
 * CRER-04: First career grants ALL returned skills at level 0.
 *          Subsequent careers PICK ONE of the returned skills at level 0.
 *          (The grant-all vs pick-one distinction lives in BasicTrainingCard, not here.)
 * CRER-05: Citizen/Drifter exception (basicTrainingException=true): returns assignment
 *          specialist skills instead of service skills, for both first and subsequent
 *          careers.
 *
 * NOTE: `isFirstCareer` is retained in the signature for API stability and to make
 * the caller's intent explicit at the call site, even though it no longer affects
 * the return value. The caller uses `isFirstCareer` to decide grant-all vs pick-one.
 */
export function getBasicTrainingSkills(
  career: CareerData,
  isFirstCareer: boolean,
  assignmentIndex: number,
): SkillEntry[] {
  void isFirstCareer; // retained for API stability; see docstring

  if (career.basicTrainingException) {
    return career.assignments[assignmentIndex].specialistSkills;
  }

  return career.skillTables.serviceSkills;
}

/**
 * Get the career assigned by the draft table.
 * CRER-20: 1D lookup: 1=Navy, 2=Army, 3=Marine, 4=Merchant, 5=Scout, 6=Agent.
 */
export function getDraftCareer(rollValue: number): CareerName {
  const draftTable: Record<number, CareerName> = {
    1: 'navy',
    2: 'army',
    3: 'marine',
    4: 'merchant',
    5: 'scout',
    6: 'agent',
  };
  return draftTable[rollValue];
}

/**
 * Check if a character can return to a previously held career.
 * CRER-24: Cannot return to the same career immediately.
 */
export function canReturnToCareer(previousCareer: CareerName, targetCareer: CareerName): boolean {
  return previousCareer !== targetCareer;
}

/**
 * Resolve an assignment change between career terms.
 * CRER-23: Same career, different assignment = keep rank, no new qualification.
 *          Different career = lose rank, need new qualification.
 */
export function resolveAssignmentChange(
  currentCareer: CareerName,
  _currentAssignment: string,
  targetCareer: CareerName,
  _targetAssignment: string,
): { needsNewQualification: boolean; keepRank: boolean; changeType: 'same-career' | 'new-career' } {
  if (currentCareer === targetCareer) {
    return {
      needsNewQualification: false,
      keepRank: true,
      changeType: 'same-career',
    };
  }

  return {
    needsNewQualification: true,
    keepRank: false,
    changeType: 'new-career',
  };
}

/**
 * Get the noble title for a given Social Standing.
 * SOCL-02: 11=Knight, 12=Baron, 13=Marquis, 14=Count, 15+=Duke.
 */
export function getNobleTitle(soc: number): string | null {
  if (soc < 11) return null;
  if (soc === 11) return 'Knight';
  if (soc === 12) return 'Baron';
  if (soc === 13) return 'Marquis';
  if (soc === 14) return 'Count';
  return 'Duke';
}
