/**
 * Unusual Events engine for Mongoose Traveller 2E.
 * Pure function: no side effects, no state mutations, no randomness.
 */

import { UNUSUAL_EVENTS, type UnusualEvent } from '../data/unusual-events';

/**
 * Resolve a 1D Unusual Event by its roll value (1..6). Result 1 carries the
 * psionics-unlock flag (D-2). Throws on an out-of-range roll value.
 */
export function resolveUnusualEvent(rollValue: number): UnusualEvent {
  const event = UNUSUAL_EVENTS.find((e) => e.rollValue === rollValue);
  if (!event) {
    throw new Error(`No Unusual Event for roll value: ${rollValue}`);
  }
  return event;
}
