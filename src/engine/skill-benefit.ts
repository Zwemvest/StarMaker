import type { Skill } from '../types/character';

/** What effect adding a skill would have on an existing skill list. */
export type SkillBenefit = 'new' | 'upgrade' | 'none';

/**
 * Classify what happens if `name` at `level` is added to `existing`.
 *
 * Mirrors the addSkill reducer semantics in src/stores/character.ts:
 *   - 'new':     skill does not exist -> will be added
 *   - 'upgrade': skill exists at a lower level -> will be upgraded
 *   - 'none':    skill exists at equal or higher level -> no-op (no benefit)
 *
 * The match is case-sensitive, matching addSkill's behavior.
 */
export function classifySkillBenefit(
  existing: Skill[],
  name: string,
  level: number,
): SkillBenefit {
  const current = existing.find((s) => s.name === name);
  if (!current) return 'new';
  if (level > current.level) return 'upgrade';
  return 'none';
}
