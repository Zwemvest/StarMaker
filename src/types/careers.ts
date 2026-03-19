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
