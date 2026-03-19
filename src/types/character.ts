import type { CharacteristicId } from './common';
import type { RollLogEntry } from './dice';
import type { CareerTerm } from './careers';

/** All six characteristics as a record */
export type Characteristics = Record<CharacteristicId, number>;

/** A single skill with name and level */
export interface Skill {
  name: string;
  level: number;
}

/** Basic character biographical info */
export interface CharacterInfo {
  name: string;
  age: number;
  title: string | null;
  credits: number;
  pension: number;
}

/** A contact, ally, rival, or enemy */
export interface Contact {
  type: 'contact' | 'ally' | 'rival' | 'enemy';
  name: string;
  notes: string;
}

/** Complete character state */
export interface Character {
  /** UUID v4 identifier */
  id: string;
  /** Biographical info */
  info: CharacterInfo;
  /** The six core characteristics */
  characteristics: Characteristics;
  /** Acquired skills */
  skills: Skill[];
  /** Career history (ordered terms) */
  careers: CareerTerm[];
  /** Contacts, allies, rivals, enemies */
  contacts: Contact[];
  /** Append-only roll log for legitimacy verification */
  rollLog: RollLogEntry[];
  /** Truncated SHA-256 hash of canonical roll log */
  legitimacyHash: string;
  /** Whether the character has been modified outside normal creation */
  isModified: boolean;
  /** ISO 8601 creation timestamp */
  createdAt: string;
}
