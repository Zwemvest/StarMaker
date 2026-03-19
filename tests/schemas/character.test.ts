import { describe, it, expect } from 'vitest';
import { characteristicsSchema, characterSchema } from '../../src/schemas/character';

describe('characteristicsSchema', () => {
  const validChars = { STR: 7, DEX: 8, END: 6, INT: 9, EDU: 10, SOC: 5 };

  it('validates valid characteristics', () => {
    const result = characteristicsSchema.safeParse(validChars);
    expect(result.success).toBe(true);
  });

  it('rejects characteristics below 0', () => {
    const result = characteristicsSchema.safeParse({ ...validChars, STR: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects characteristics above 15', () => {
    const result = characteristicsSchema.safeParse({ ...validChars, STR: 16 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer characteristics', () => {
    const result = characteristicsSchema.safeParse({ ...validChars, STR: 7.5 });
    expect(result.success).toBe(false);
  });

  it('rejects missing characteristics', () => {
    const { SOC: _soc, ...missing } = validChars;
    const result = characteristicsSchema.safeParse(missing);
    expect(result.success).toBe(false);
  });
});

describe('characterSchema', () => {
  const validCharacter = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    info: {
      name: 'Test Character',
      age: 18,
      title: null,
      credits: 0,
      pension: 0,
    },
    characteristics: { STR: 7, DEX: 8, END: 6, INT: 9, EDU: 10, SOC: 5 },
    skills: [],
    careers: [],
    contacts: [],
    rollLog: [],
    legitimacyHash: '',
    isModified: false,
    createdAt: '2026-03-19T00:00:00.000Z',
  };

  it('validates a valid character', () => {
    const result = characterSchema.safeParse(validCharacter);
    expect(result.success).toBe(true);
  });

  it('rejects character with missing id', () => {
    const { id: _id, ...noId } = validCharacter;
    const result = characterSchema.safeParse(noId);
    expect(result.success).toBe(false);
  });

  it('rejects character with invalid characteristics', () => {
    const result = characterSchema.safeParse({
      ...validCharacter,
      characteristics: { STR: 20 },
    });
    expect(result.success).toBe(false);
  });
});
