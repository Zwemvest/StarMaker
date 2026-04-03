import type { Skill } from './character';
import type { CharacteristicId } from './common';

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

/** A specific assignment within a career */
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

// --- Extended career data types for Phase 3 ---

/** A skill table entry: plain string or object with optional specialty */
export type SkillEntry = string | { name: string; specialty?: string };

/** A characteristic-based check target */
export interface CheckTarget {
  characteristic: CharacteristicId;
  target: number;
}

/** Assignment data within a career, including survival/advancement targets and specialist skills */
export interface AssignmentData {
  name: string;
  description: string;
  survival: CheckTarget;
  advancement: CheckTarget;
  /** 6 specialist skills for this assignment */
  specialistSkills: SkillEntry[];
}

/** A rank entry with level, title, and optional bonus skill */
export interface RankEntry {
  level: number;
  title: string;
  bonusSkill: string | null;
  /** Optional: the level to grant (0 or 1). Defaults to 1 if omitted. */
  bonusSkillLevel?: number;
}

/** Effect type for career events and mishaps */
export type EventEffectType =
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

/** An effect produced by a career event or mishap */
export interface EventEffect {
  type: EventEffectType;
  detail: string;
  /** Optional choices when type is 'choice' */
  options?: string[];
}

/** A career event table entry (2D table, rolls 2-12) */
export interface CareerEventEntry {
  rollValue: number;
  description: string;
  effectDescription: string;
  effects: EventEffect[];
  hasChoice: boolean;
}

/** A mishap table entry (1D table, rolls 1-6) */
export interface MishapEntry {
  rollValue: number;
  description: string;
  effectDescription: string;
  effects: EventEffect[];
}

/** Mustering out tables: 7 entries each for cash and benefits */
export interface MusteringOutTable {
  /** 7 cash amounts indexed by roll 1-7 */
  cash: number[];
  /** 7 benefit descriptions indexed by roll 1-7 */
  benefits: string[];
}

/** Skill tables available during a career term */
export interface SkillTables {
  /** 6 entries - available to all */
  personalDevelopment: SkillEntry[];
  /** 6 entries - available to all */
  serviceSkills: SkillEntry[];
  /** 6 entries - available if EDU 8+ */
  advancedEducation: SkillEntry[];
  /** 6 entries - available if commissioned. Null for non-military careers. */
  officer: SkillEntry[] | null;
}

/** Rank tables for enlisted and optional officer tracks */
export interface RankTables {
  /** 7 entries (ranks 0-6) for enlisted personnel */
  enlisted: RankEntry[];
  /** 7 entries (ranks 0-6) for officers. Null for non-military careers. */
  officer: RankEntry[] | null;
}

/** Complete career data structure for a single career */
export interface CareerData {
  name: CareerName;
  description: string;
  /** Qualification check. Null for Drifter (auto-entry). */
  qualification: CheckTarget | null;
  /** Exactly 3 assignments per career */
  assignments: AssignmentData[];
  /** Whether this is a military career (Army, Marines, Navy) */
  isMilitary: boolean;
  /** Commission check. Null for non-military careers. */
  commission: CheckTarget | null;
  /** Rank tables for enlisted and optional officer tracks */
  ranks: RankTables;
  /** Skill tables available during career terms */
  skillTables: SkillTables;
  /** 11 career events (rolls 2-12) */
  events: CareerEventEntry[];
  /** 6 mishap entries (rolls 1-6) */
  mishaps: MishapEntry[];
  /** Mustering out cash and benefit tables */
  musteringOut: MusteringOutTable;
  /** True for Citizen/Drifter: basic training uses assignment specialist skills */
  basicTrainingException: boolean;
}
