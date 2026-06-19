import { describe, it, expect } from 'vitest';
import { resolveUnusualEvent } from '../../src/engine/unusual-events';
import { UNUSUAL_EVENTS } from '../../src/data/unusual-events';

describe('resolveUnusualEvent', () => {
  it('returns the result-1 entry which unlocks psionics (SHEE-05 / D-2)', () => {
    const event = resolveUnusualEvent(1);
    expect(event.rollValue).toBe(1);
    expect(event.unlocksPsionics).toBe(true);
  });

  it('returns result 2 which does not unlock psionics', () => {
    const event = resolveUnusualEvent(2);
    expect(event.rollValue).toBe(2);
    expect(event.unlocksPsionics).toBe(false);
  });

  it('returns the result-6 entry', () => {
    expect(resolveUnusualEvent(6).rollValue).toBe(6);
  });

  it('returns the canonical entry from UNUSUAL_EVENTS (matching description)', () => {
    const canonical = UNUSUAL_EVENTS.find((e) => e.rollValue === 1);
    expect(resolveUnusualEvent(1).description).toBe(canonical!.description);
  });

  it('throws on an out-of-range roll value below 1', () => {
    expect(() => resolveUnusualEvent(0)).toThrow();
  });

  it('throws on an out-of-range roll value above 6', () => {
    expect(() => resolveUnusualEvent(7)).toThrow();
  });

  it('returns the matching rollValue for every roll 1..6', () => {
    for (let v = 1; v <= 6; v++) {
      expect(resolveUnusualEvent(v).rollValue).toBe(v);
    }
  });
});
