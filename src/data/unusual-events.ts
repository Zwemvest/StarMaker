/** A single entry on the Unusual Events 1D sub-table */
export interface UnusualEvent {
  rollValue: number;
  description: string;
  /** True if this result lets the Traveller test for psionic potential */
  unlocksPsionics: boolean;
}

/**
 * Unusual Events 1D sub-table from the Mongoose Traveller 2E Core Rulebook
 * (Life Events table, roll 12 — "Unusual Event"). Roll 1D for the result.
 * Only result 1 (Psionics) unlocks psionic testing.
 */
export const UNUSUAL_EVENTS: readonly UnusualEvent[] = [
  {
    rollValue: 1,
    description:
      'Psionics: You are tested for psionic potential and may determine your Psionic Strength.',
    unlocksPsionics: true,
  },
  {
    rollValue: 2,
    description: 'Alien contact: You make contact with an alien race.',
    unlocksPsionics: false,
  },
  {
    rollValue: 3,
    description: 'Unusual event: Something strange and inexplicable happens to you.',
    unlocksPsionics: false,
  },
  {
    rollValue: 4,
    description: 'Political upheaval: Your homeworld or current world is rocked by political turmoil.',
    unlocksPsionics: false,
  },
  {
    rollValue: 5,
    description: 'Contact with unusual entity: You encounter a strange and powerful being.',
    unlocksPsionics: false,
  },
  {
    rollValue: 6,
    description: 'Ancient technology found: You discover a piece of ancient technology.',
    unlocksPsionics: false,
  },
] as const;
