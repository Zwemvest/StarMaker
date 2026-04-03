import { describe, it, expect } from 'vitest';
import { LIFE_EVENTS } from '../../src/data/life-events';

describe('LIFE_EVENTS', () => {
  it('has exactly 11 entries (rolls 2-12)', () => {
    expect(LIFE_EVENTS).toHaveLength(11);
  });

  it('rollValues are sequential 2-12 with no gaps', () => {
    const rollValues = LIFE_EVENTS.map((e) => e.rollValue);
    expect(rollValues).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('has no duplicate rollValues', () => {
    const rollValues = LIFE_EVENTS.map((e) => e.rollValue);
    const unique = new Set(rollValues);
    expect(unique.size).toBe(rollValues.length);
  });

  it('each entry has non-empty description', () => {
    for (const event of LIFE_EVENTS) {
      expect(event.description).toBeTruthy();
      expect(event.description.length).toBeGreaterThan(0);
    }
  });

  it('each entry has non-empty effectDescription', () => {
    for (const event of LIFE_EVENTS) {
      expect(event.effectDescription).toBeTruthy();
      expect(event.effectDescription.length).toBeGreaterThan(0);
    }
  });

  it('each entry has an effects array', () => {
    for (const event of LIFE_EVENTS) {
      expect(Array.isArray(event.effects)).toBe(true);
    }
  });

  it('at least one entry creates a contact, ally, rival, or enemy (SOCL-01)', () => {
    const contactTypes = ['contact', 'ally', 'rival', 'enemy'];
    const hasContactEffect = LIFE_EVENTS.some((event) =>
      event.effects.some((effect) => contactTypes.includes(effect.type)),
    );
    expect(hasContactEffect).toBe(true);
  });

  it('all effect types are valid', () => {
    const validTypes = [
      'skill',
      'characteristic',
      'contact',
      'ally',
      'rival',
      'enemy',
      'benefit',
      'injury',
      'special',
    ];
    for (const event of LIFE_EVENTS) {
      for (const effect of event.effects) {
        expect(validTypes).toContain(effect.type);
      }
    }
  });
});
