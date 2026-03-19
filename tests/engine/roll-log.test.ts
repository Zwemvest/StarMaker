import { describe, it, expect } from 'vitest';
import { createRollLogEntry, appendToLog } from '../../src/engine/roll-log';
import { rollLogEntrySchema } from '../../src/schemas/roll-log';

describe('Roll Log', () => {
  describe('createRollLogEntry', () => {
    it('produces a valid entry with UUID, correct total, overridden=false', () => {
      const entry = createRollLogEntry('characteristics.STR', '2D', [3, 4]);
      expect(entry.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(entry.context).toBe('characteristics.STR');
      expect(entry.notation).toBe('2D');
      expect(entry.results).toEqual([3, 4]);
      expect(entry.total).toBe(7);
      expect(entry.overridden).toBe(false);
    });

    it('applies modifier to total', () => {
      const entry = createRollLogEntry('career.marines.survival', '2D', [4, 5], 2);
      expect(entry.total).toBe(11); // 4+5+2
      expect(entry.modifier).toBe(2);
    });

    it('sets target when provided', () => {
      const entry = createRollLogEntry('career.marines.survival', '2D', [4, 5], 0, 8);
      expect(entry.target).toBe(8);
      expect(entry.success).toBe(true); // 4+5 = 9 >= 8
    });

    it('evaluates success=false when total < target', () => {
      const entry = createRollLogEntry('career.marines.survival', '2D', [1, 2], 0, 8);
      expect(entry.total).toBe(3);
      expect(entry.success).toBe(false);
    });

    it('validates against Zod schema', () => {
      const entry = createRollLogEntry('characteristics.DEX', '2D', [2, 5]);
      const result = rollLogEntrySchema.safeParse(entry);
      expect(result.success).toBe(true);
    });
  });

  describe('appendToLog', () => {
    it('returns a new array (immutability)', () => {
      const log: ReturnType<typeof createRollLogEntry>[] = [];
      const entry = createRollLogEntry('characteristics.STR', '2D', [3, 4]);
      const newLog = appendToLog(log, entry);

      expect(newLog).not.toBe(log);
      expect(newLog).toHaveLength(1);
      expect(log).toHaveLength(0);
    });

    it('preserves existing entries', () => {
      const entry1 = createRollLogEntry('characteristics.STR', '2D', [3, 4]);
      const entry2 = createRollLogEntry('characteristics.DEX', '2D', [5, 2]);

      const log1 = appendToLog([], entry1);
      const log2 = appendToLog(log1, entry2);

      expect(log2).toHaveLength(2);
      expect(log2[0]).toEqual(entry1);
      expect(log2[1]).toEqual(entry2);
    });

    it('does not mutate input array', () => {
      const entry1 = createRollLogEntry('characteristics.STR', '2D', [3, 4]);
      const log = [entry1];
      const originalLength = log.length;

      const entry2 = createRollLogEntry('characteristics.DEX', '2D', [5, 2]);
      appendToLog(log, entry2);

      expect(log).toHaveLength(originalLength);
    });
  });
});
