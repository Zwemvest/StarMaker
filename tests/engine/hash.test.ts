import { describe, it, expect } from 'vitest';
import { canonicalizeRollLog, computeHash } from '../../src/engine/hash';
import type { RollLogEntry } from '../../src/types/dice';

function makeEntry(overrides: Partial<RollLogEntry> = {}): RollLogEntry {
  return {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    context: 'characteristics.STR',
    notation: '2D',
    results: [3, 4],
    total: 7,
    modifier: 0,
    target: null,
    success: null,
    overridden: false,
    ...overrides,
  };
}

describe('Legitimacy Hash', () => {
  describe('canonicalizeRollLog', () => {
    it('produces same output for same input (deterministic)', () => {
      const entries = [makeEntry()];
      const a = canonicalizeRollLog(entries);
      const b = canonicalizeRollLog(entries);
      expect(a).toBe(b);
    });

    it('produces consistent string for empty log', () => {
      const a = canonicalizeRollLog([]);
      const b = canonicalizeRollLog([]);
      expect(a).toBe(b);
      expect(typeof a).toBe('string');
      expect(a.length).toBeGreaterThan(0);
    });

    it('only uses id, context, and results (ignores other fields)', () => {
      const base = makeEntry();
      const withExtras = makeEntry({
        modifier: 99,
        target: 42,
        success: true,
        overridden: true,
        total: 999,
      });

      // Same id, context, results => same canonical output
      const a = canonicalizeRollLog([base]);
      const b = canonicalizeRollLog([withExtras]);
      expect(a).toBe(b);
    });

    it('sorts object keys alphabetically', () => {
      const entries = [makeEntry()];
      const canonical = canonicalizeRollLog(entries);
      const parsed = JSON.parse(canonical);
      const keys = Object.keys(parsed[0]);
      expect(keys).toEqual(['context', 'id', 'results']);
    });
  });

  describe('computeHash', () => {
    it('returns 8-character hex string', async () => {
      const entries = [makeEntry()];
      const hash = await computeHash(entries);
      expect(hash).toMatch(/^[0-9a-f]{8}$/);
    });

    it('is deterministic (same entries, same hash)', async () => {
      const entries = [makeEntry()];
      const hash1 = await computeHash(entries);
      const hash2 = await computeHash(entries);
      expect(hash1).toBe(hash2);
    });

    it('changes when entries differ', async () => {
      const entries1 = [makeEntry({ results: [3, 4] })];
      const entries2 = [makeEntry({ results: [5, 6] })];
      const hash1 = await computeHash(entries1);
      const hash2 = await computeHash(entries2);
      expect(hash1).not.toBe(hash2);
    });

    it('changes when entry order changes', async () => {
      const entry1 = makeEntry({ id: '11111111-1111-1111-1111-111111111111', results: [1, 2] });
      const entry2 = makeEntry({ id: '22222222-2222-2222-2222-222222222222', results: [5, 6] });

      const hash1 = await computeHash([entry1, entry2]);
      const hash2 = await computeHash([entry2, entry1]);
      expect(hash1).not.toBe(hash2);
    });

    it('returns valid hash for empty log (not empty string)', async () => {
      const hash = await computeHash([]);
      expect(hash).toMatch(/^[0-9a-f]{8}$/);
      expect(hash.length).toBe(8);
    });
  });
});
