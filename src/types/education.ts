import type { CharacteristicId } from './common';

/** Whether the Traveller attended university or a military academy */
export type EducationType = 'university' | 'academy';

/** Military academy branch options */
export type AcademyBranch = 'army' | 'marines' | 'navy';

/** An education path with entry requirements */
export interface EducationPath {
  type: EducationType;
  branch?: AcademyBranch;
  label: string;
  description: string;
  entryCharacteristic: CharacteristicId;
  entryTarget: number;
  /** SOC 9+ grants DM+1 (university only) */
  socBonus: boolean;
}

/** Type of mechanical effect from an education event */
export type EducationEventEffectType =
  | 'skill'
  | 'characteristic'
  | 'ally'
  | 'enemy'
  | 'choice'
  | 'special';

/** A single mechanical effect from an education event */
export interface EducationEventEffect {
  type: EducationEventEffectType;
  detail: string;
}

/** An entry in the education events table (roll 2D) */
export interface EducationEvent {
  rollValue: number;
  description: string;
  effectDescription: string;
  effects: EducationEventEffect[];
  hasChoice: boolean;
}

/** Outcome of a graduation roll */
export type GraduationResult = 'graduated' | 'honours' | 'failed';
