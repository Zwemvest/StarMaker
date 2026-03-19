/**
 * Append-only roll log management for Mongoose Traveller 2E.
 * Every dice roll is recorded with full context for audit trail and legitimacy hashing.
 */

import type { DiceNotation, RollLogEntry } from '../types/dice';

/**
 * Create a new roll log entry with UUID, calculated total, and audit fields.
 * @param context Dot-path context, e.g. "characteristics.STR"
 * @param notation Dice notation used
 * @param results Individual die results
 * @param modifier Optional modifier to apply to total (default 0)
 * @param target Optional target number for success/failure check
 * @returns A complete RollLogEntry
 */
export function createRollLogEntry(
  context: string,
  notation: DiceNotation,
  results: number[],
  modifier: number = 0,
  target?: number,
): RollLogEntry {
  const total = results.reduce((a, b) => a + b, 0) + modifier;
  const hasTarget = target !== undefined && target !== null;

  return {
    id: crypto.randomUUID(),
    context,
    notation,
    results,
    total,
    modifier,
    target: hasTarget ? target : null,
    success: hasTarget ? total >= target : null,
    overridden: false,
  };
}

/**
 * Append an entry to the roll log, returning a NEW array (immutable).
 * Does NOT mutate the input array.
 */
export function appendToLog(
  log: readonly RollLogEntry[],
  entry: RollLogEntry,
): RollLogEntry[] {
  return [...log, entry];
}
