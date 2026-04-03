import type { Skill } from './character';

/** All 12 career names from Mongoose Traveller 2E Core Rulebook */
export type CareerName =
  | 'agent'
  | 'army'
  | 'citizen'
  | 'drifter'
  | 'entertainer'
  | 'marine'
  | 'merchant'
  | 'navy'
  | 'noble'
  | 'rogue'
  | 'scholar'
  | 'scout';

/** A skill entry — either a simple name or an object with specialty */
export type SkillEntry = string | { name: string; specialty?: string };

/** Target roll for a characteristic check */
export interface CharacteristicCheck {
  characteristic: string;
  target: number;
}

/** A specific assignment within a career (full data) */
export interface AssignmentData {
  name: string;
  description: string;
  survival: CharacteristicCheck;
  advancement: CharacteristicCheck;
  specialistSkills: SkillEntry[];
}

/** A specific assignment within a career (runtime reference) */
export interface Assignment {
  career: CareerName;
  name: string;
  description: string;
}

/** A rank within a career */
export interface Rank {
  level: number;
  title: string;
  bonusSkill: string | null;
  bonusSkillLevel?: number;
}

/** Effect from a career event or mishap */
export interface EventEffect {
  type:
    | 'skill'
    | 'characteristic'
    | 'contact'
    | 'ally'
    | 'rival'
    | 'enemy'
    | 'choice'
    | 'special'
    | 'benefit'
    | 'injury';
  detail: string;
  options?: string[];
}

/** A career event entry (2D table, rolls 2-12) */
export interface CareerEvent {
  rollValue: number;
  description: string;
  effectDescription: string;
  effects: EventEffect[];
  hasChoice: boolean;
}

/** A mishap entry (1D table, rolls 1-6) */
export interface Mishap {
  rollValue: number;
  description: string;
  effectDescription: string;
  effects: EventEffect[];
}

/** Mustering out tables */
export interface MusteringOutTable {
  cash: number[];
  benefits: string[];
}

/** Full career data structure — one per career JSON file */
export interface CareerData {
  name: string;
  description: string;
  qualification: CharacteristicCheck | null;
  assignments: AssignmentData[];
  isMilitary: boolean;
  commission: CharacteristicCheck | null;
  ranks: {
    enlisted: Rank[];
    officer?: Rank[];
  };
  skillTables: {
    personalDevelopment: SkillEntry[];
    serviceSkills: SkillEntry[];
    advancedEducation: SkillEntry[];
    officer?: SkillEntry[];
  };
  events: CareerEvent[];
  mishaps: Mishap[];
  musteringOut: MusteringOutTable;
  basicTrainingException: boolean;
}

/** A single term of career service */
export interface CareerTerm {
  career: CareerName;
  assignment: string;
  term: number;
  rank: number;
  skills: Skill[];
  events: string[];
}

/** Ordered history of career terms */
export type CareerHistory = CareerTerm[];

/** Types of effects that events can produce */
export type EventEffectType =
  | 'skill'
  | 'characteristic'
  | 'contact'
  | 'ally'
  | 'rival'
  | 'enemy'
  | 'benefit'
  | 'injury'
  | 'special';

/** An effect produced by a career or life event */
export interface EventEffect {
  type: EventEffectType;
  /** Description of what this effect does */
  description: string;
  /** Optional target (skill name, characteristic ID, etc.) */
  target?: string;
  /** Optional value (skill level, characteristic change, credit amount, etc.) */
  value?: number;
}
