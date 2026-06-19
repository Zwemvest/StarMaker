import { describe, it, expect } from 'vitest';
import { UNUSUAL_EVENTS } from '../../src/data/unusual-events';

describe('UNUSUAL_EVENTS data', () => {
  it('has exactly six entries', () => {
    expect(UNUSUAL_EVENTS).toHaveLength(6);
  });

  it('has rollValues 1..6 in order', () => {
    expect(UNUSUAL_EVENTS.map((e) => e.rollValue)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('flags exactly one entry as unlocking psionics, and it is rollValue 1', () => {
    const unlocking = UNUSUAL_EVENTS.filter((e) => e.unlocksPsionics);
    expect(unlocking).toHaveLength(1);
    expect(unlocking[0].rollValue).toBe(1);
  });

  it('describes result 1 as the psionics outcome', () => {
    const first = UNUSUAL_EVENTS.find((e) => e.rollValue === 1);
    expect(first?.description).toMatch(/psionic/i);
  });

  it('has non-empty descriptions for every entry', () => {
    for (const event of UNUSUAL_EVENTS) {
      expect(event.description.length).toBeGreaterThan(0);
    }
  });
});
