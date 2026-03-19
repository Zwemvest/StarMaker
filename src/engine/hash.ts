/**
 * SHA-256 legitimacy hash computation for Mongoose Traveller 2E.
 *
 * CANONICAL FORMAT v1 -- changing this invalidates all existing hashes.
 * Format: JSON array of objects with keys sorted alphabetically (context, id, results),
 * entries in log order. No timestamps, no modifier, no total.
 */

import type { RollLogEntry } from '../types/dice';

/**
 * Canonicalize roll log entries for deterministic hashing.
 * Extracts only hash-relevant fields (context, id, results) with sorted keys.
 * @param entries Roll log entries in order
 * @returns Deterministic JSON string
 */
export function canonicalizeRollLog(entries: readonly RollLogEntry[]): string {
  const canonical = entries.map((entry) => ({
    context: entry.context,
    id: entry.id,
    results: entry.results,
  }));
  return JSON.stringify(canonical);
}

/**
 * Compute the legitimacy hash for a roll log.
 * Uses SHA-256 via Web Crypto API, returns first 8 hex characters.
 * @param entries Roll log entries in order
 * @returns 8-character hex string (truncated SHA-256)
 */
export async function computeHash(
  entries: readonly RollLogEntry[],
): Promise<string> {
  const canonical = canonicalizeRollLog(entries);
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex.substring(0, 8);
}
