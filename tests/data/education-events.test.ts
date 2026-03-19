import { describe, it, expect } from 'vitest';
import { EDUCATION_EVENTS } from '../../src/data/education-events';

describe('EDUCATION_EVENTS', () => {
  it('has exactly 11 entries for rolls 2-12', () => {
    expect(EDUCATION_EVENTS).toHaveLength(11);
  });

  it('covers roll values 2 through 12', () => {
    const rollValues = EDUCATION_EVENTS.map((e) => e.rollValue);
    for (let i = 2; i <= 12; i++) {
      expect(rollValues, `Missing roll value ${i}`).toContain(i);
    }
  });

  it('entries are ordered by rollValue ascending', () => {
    for (let i = 1; i < EDUCATION_EVENTS.length; i++) {
      expect(EDUCATION_EVENTS[i].rollValue).toBeGreaterThan(EDUCATION_EVENTS[i - 1].rollValue);
    }
  });

  it('each event has description and effectDescription', () => {
    for (const event of EDUCATION_EVENTS) {
      expect(event.description, `Event ${event.rollValue} missing description`).toBeTruthy();
      expect(event.effectDescription, `Event ${event.rollValue} missing effectDescription`).toBeTruthy();
    }
  });

  it('each event has a non-empty effects array', () => {
    for (const event of EDUCATION_EVENTS) {
      expect(event.effects.length, `Event ${event.rollValue} has no effects`).toBeGreaterThan(0);
    }
  });

  it('each effect has valid type', () => {
    const validTypes = ['skill', 'characteristic', 'ally', 'enemy', 'choice', 'special'];
    for (const event of EDUCATION_EVENTS) {
      for (const effect of event.effects) {
        expect(validTypes, `Invalid effect type "${effect.type}" in event ${event.rollValue}`).toContain(effect.type);
        expect(effect.detail).toBeTruthy();
      }
    }
  });

  it('hasChoice is a boolean for each event', () => {
    for (const event of EDUCATION_EVENTS) {
      expect(typeof event.hasChoice).toBe('boolean');
    }
  });

  it('at least some events have hasChoice=true', () => {
    const withChoices = EDUCATION_EVENTS.filter((e) => e.hasChoice);
    expect(withChoices.length).toBeGreaterThan(0);
  });
});
