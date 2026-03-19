import { setup } from 'xstate';

/** Phases of character creation that the machine tracks */
export type CreationPhase =
  | 'idle'
  | 'characteristics'
  | 'backgroundSkills'
  | 'education'
  | 'career'
  | 'musteringOut'
  | 'complete';

/** Machine context — workflow position only, no character data */
interface CreationContext {
  currentPhase: CreationPhase;
  characterId: string;
  termsServed: number;
}

/** All events the creation machine responds to */
type CreationEvent =
  | { type: 'START_CREATION' }
  | { type: 'CHARACTERISTICS_COMPLETE' }
  | { type: 'BACKGROUND_COMPLETE' }
  | { type: 'EDUCATION_COMPLETE' }
  | { type: 'CAREER_TERM_COMPLETE' }
  | { type: 'MUSTER_OUT' }
  | { type: 'MUSTERING_COMPLETE' };

/**
 * XState 5 creation workflow state machine.
 *
 * Manages ONLY workflow position (what step the user is on).
 * Character data lives in the Zustand store — never duplicated here.
 *
 * States: idle -> characteristics -> backgroundSkills -> education -> career -> musteringOut -> complete
 * Career allows looping (multiple terms) before mustering out.
 */
export const creationMachine = setup({
  types: {
    context: {} as CreationContext,
    events: {} as CreationEvent,
  },
  guards: {
    hasCharacteristics: () => true,
    hasBackgroundSkills: () => true,
  },
}).createMachine({
  id: 'creation',
  initial: 'idle',
  context: {
    currentPhase: 'idle',
    characterId: '',
    termsServed: 0,
  },
  states: {
    idle: {
      on: {
        START_CREATION: 'characteristics',
      },
    },
    characteristics: {
      on: {
        CHARACTERISTICS_COMPLETE: {
          target: 'backgroundSkills',
          guard: 'hasCharacteristics',
        },
      },
    },
    backgroundSkills: {
      on: {
        BACKGROUND_COMPLETE: {
          target: 'education',
          guard: 'hasBackgroundSkills',
        },
      },
    },
    education: {
      on: {
        EDUCATION_COMPLETE: 'career',
      },
    },
    career: {
      on: {
        CAREER_TERM_COMPLETE: 'career',
        MUSTER_OUT: 'musteringOut',
      },
    },
    musteringOut: {
      on: {
        MUSTERING_COMPLETE: 'complete',
      },
    },
    complete: {
      type: 'final',
    },
  },
});
