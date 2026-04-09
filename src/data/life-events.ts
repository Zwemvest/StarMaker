import type { EventEffect } from '../types/careers';

/** A life event entry from the shared Life Events table */
export interface LifeEvent {
  rollValue: number;
  description: string;
  effectDescription: string;
  effects: EventEffect[];
}

/**
 * Life Events table from Mongoose Traveller 2E Core Rulebook (p.44).
 * Used across all careers when a career event directs the player to roll
 * on the Life Events table. Roll 2D for result.
 */
export const LIFE_EVENTS: readonly LifeEvent[] = [
  {
    rollValue: 2,
    description: 'Sickness or Injury',
    effectDescription:
      'You are severely injured. Roll on the Injury table.',
    effects: [
      { type: 'injury', detail: 'Roll on Injury table' },
    ],
  },
  {
    rollValue: 3,
    description: 'Birth or Death',
    effectDescription:
      'Someone close to you dies, or a new member is born into your family. You are profoundly affected.',
    effects: [
      { type: 'special', detail: 'Significant personal event — birth or death in family' },
    ],
  },
  {
    rollValue: 4,
    description: 'Ending of Relationship',
    effectDescription:
      'A romantic relationship or close friendship ends badly. Gain a Rival or Enemy.',
    effects: [
      { type: 'rival', detail: 'Gain a Rival or Enemy from ended relationship' },
    ],
  },
  {
    rollValue: 5,
    description: 'Improved Relationship',
    effectDescription:
      'A romantic relationship deepens or you make a lifelong friend. Gain an Ally.',
    effects: [
      { type: 'ally', detail: 'Gain an Ally from deepened relationship' },
    ],
  },
  {
    rollValue: 6,
    description: 'New Relationship',
    effectDescription:
      'You become involved in a romantic relationship. Gain a Contact.',
    effects: [
      { type: 'contact', detail: 'Gain a Contact from new relationship' },
    ],
  },
  {
    rollValue: 7,
    description: 'New Contact',
    effectDescription:
      'You gain a new Contact.',
    effects: [
      { type: 'contact', detail: 'Gain a new Contact' },
    ],
  },
  {
    rollValue: 8,
    description: 'Betrayal',
    effectDescription:
      'You are betrayed in some fashion by a friend. Convert one Contact or Ally into a Rival or Enemy.',
    effects: [
      { type: 'enemy', detail: 'Convert a Contact or Ally into a Rival or Enemy' },
    ],
  },
  {
    rollValue: 9,
    description: 'Travel',
    effectDescription:
      'You move to another world. Gain DM+2 to your next qualification roll.',
    effects: [
      { type: 'benefit', detail: 'DM+2 to next qualification roll' },
    ],
  },
  {
    rollValue: 10,
    description: 'Good Fortune',
    effectDescription:
      'Something good happens to you. Gain DM+2 to any one Benefit roll.',
    effects: [
      { type: 'benefit', detail: 'DM+2 to any one Benefit roll' },
    ],
  },
  {
    rollValue: 11,
    description: 'Crime',
    effectDescription:
      'You commit or are accused of a crime. Lose one Benefit roll or take the Prisoner career next term.',
    effects: [
      { type: 'special', detail: 'Lose one Benefit roll or become a Prisoner' },
    ],
  },
  {
    rollValue: 12,
    description: 'Unusual Event',
    effectDescription:
      'Something unusual occurs. Roll 1D: 1-Psionics tested, 2-Alien contact, 3-Unusual event, 4-Political upheaval, 5-Contact with unusual entity, 6-Ancient technology found.',
    effects: [
      { type: 'special', detail: 'Roll 1D for unusual event sub-table' },
    ],
  },
] as const;
