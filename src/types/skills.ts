/** Skill category for grouping in the UI */
export type SkillCategory = 'Physical' | 'Mental' | 'Social' | 'Technical';

/** A background skill available during adolescence */
export interface BackgroundSkill {
  name: string;
  category: SkillCategory;
  description: string;
}
