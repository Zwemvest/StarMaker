import type { CareerName } from '../types/careers';

/**
 * Draft table from Mongoose Traveller 2E Core Rulebook (p.18).
 * When a character fails qualification and chooses to be drafted,
 * roll 1D on this table to determine their career.
 */
export const DRAFT_TABLE: Record<number, CareerName> = {
  1: 'navy',
  2: 'army',
  3: 'marine',
  4: 'merchant',
  5: 'scout',
  6: 'agent',
} as const;
