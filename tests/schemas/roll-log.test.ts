import { describe, it, expect } from 'vitest';
import { rollLogEntrySchema } from '../../src/schemas/roll-log';

describe('rollLogEntrySchema', () => {
  const validEntry = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    context: 'characteristics.STR',
    notation: '2D' as const,
    results: [4, 3],
    total: 7,
    modifier: 0,
    target: 8,
    success: false,
    overridden: false,
  };

  it('validates a well-formed roll log entry', () => {
    const result = rollLogEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it('rejects entry with missing id', () => {
    const { id: _id, ...noId } = validEntry;
    const result = rollLogEntrySchema.safeParse(noId);
    expect(result.success).toBe(false);
  });

  it('rejects entry with empty context', () => {
    const result = rollLogEntrySchema.safeParse({ ...validEntry, context: '' });
    expect(result.success).toBe(false);
  });

  it('rejects entry with invalid notation', () => {
    const result = rollLogEntrySchema.safeParse({ ...validEntry, notation: '4D' });
    expect(result.success).toBe(false);
  });

  it('rejects entry with non-positive results', () => {
    const result = rollLogEntrySchema.safeParse({ ...validEntry, results: [0, 3] });
    expect(result.success).toBe(false);
  });

  it('rejects entry with empty results array', () => {
    const result = rollLogEntrySchema.safeParse({ ...validEntry, results: [] });
    expect(result.success).toBe(false);
  });

  it('accepts entry with null target and null success', () => {
    const entry = { ...validEntry, target: null, success: null };
    const result = rollLogEntrySchema.safeParse(entry);
    expect(result.success).toBe(true);
  });

  it('defaults overridden to false', () => {
    const { overridden: _o, ...noOverridden } = validEntry;
    const result = rollLogEntrySchema.safeParse(noOverridden);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.overridden).toBe(false);
    }
  });
});
