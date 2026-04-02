import { assign, setup } from 'xstate';
import { canAttemptEducation } from '../engine/education';

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
  educationTermsUsed: number;
}

/** All events the creation machine responds to */
export type CreationEvent =
  | { type: 'START_CREATION' }
  | { type: 'ROLL_ALL' }
  | { type: 'ASSIGN_COMPLETE' }
  | { type: 'CONFIRM' }
  | { type: 'CHARACTERISTICS_COMPLETE' }
  | { type: 'BACKGROUND_COMPLETE' }
  | { type: 'SKILLS_SELECTED' }
  | { type: 'EDUCATION_COMPLETE' }
  | { type: 'CAREER_TERM_COMPLETE' }
  | { type: 'MUSTER_OUT' }
  | { type: 'MUSTERING_COMPLETE' }
  | { type: 'CHOOSE_UNIVERSITY' }
  | { type: 'CHOOSE_ACADEMY'; branch: 'army' | 'marines' | 'navy' }
  | { type: 'SKIP_EDUCATION' }
  | { type: 'ENTRY_SUCCESS' }
  | { type: 'ENTRY_FAILURE' }
  | { type: 'TERM_COMPLETE' }
  | { type: 'GRADUATED' }
  | { type: 'GRADUATED_HONOURS' }
  | { type: 'FAILED_GRADUATION' }
  | { type: 'RETRY' }
  | { type: 'SKIP' }
  | { type: 'CONTINUE' };

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
    allCharacteristicsAssigned: () => true,
    canRetryEducation: ({ context }) =>
      canAttemptEducation(context.educationTermsUsed),
  },
}).createMachine({
  id: 'creation',
  initial: 'idle',
  context: {
    currentPhase: 'idle',
    characterId: '',
    termsServed: 0,
    educationTermsUsed: 0,
  },
  states: {
    idle: {
      on: {
        START_CREATION: 'characteristics',
      },
    },
    characteristics: {
      initial: 'rolling',
      states: {
        rolling: {
          on: {
            ROLL_ALL: 'assigning',
          },
        },
        assigning: {
          on: {
            ASSIGN_COMPLETE: {
              target: 'review',
              guard: 'allCharacteristicsAssigned',
            },
          },
        },
        review: {
          on: {
            CONFIRM: '#creation.backgroundSkills',
          },
        },
      },
    },
    backgroundSkills: {
      initial: 'selecting',
      states: {
        selecting: {
          on: {
            SKILLS_SELECTED: 'review',
          },
        },
        review: {
          on: {
            CONFIRM: '#creation.education',
          },
        },
      },
    },
    education: {
      initial: 'choosing',
      states: {
        choosing: {
          on: {
            CHOOSE_UNIVERSITY: 'universityEntry',
            CHOOSE_ACADEMY: 'academyEntry',
            SKIP_EDUCATION: '#creation.career',
          },
        },
        universityEntry: {
          entry: assign({
            educationTermsUsed: ({ context }) => context.educationTermsUsed + 1,
          }),
          on: {
            ENTRY_SUCCESS: 'universityTerm',
            ENTRY_FAILURE: 'entryFailed',
          },
        },
        academyEntry: {
          entry: assign({
            educationTermsUsed: ({ context }) => context.educationTermsUsed + 1,
          }),
          on: {
            ENTRY_SUCCESS: 'academyTerm',
            ENTRY_FAILURE: 'entryFailed',
          },
        },
        entryFailed: {
          on: {
            RETRY: {
              target: 'choosing',
              guard: 'canRetryEducation',
            },
            SKIP: '#creation.career',
          },
        },
        universityTerm: {
          on: {
            TERM_COMPLETE: 'graduation',
          },
        },
        academyTerm: {
          on: {
            TERM_COMPLETE: 'graduation',
          },
        },
        graduation: {
          on: {
            GRADUATED: 'graduated',
            GRADUATED_HONOURS: 'graduatedHonours',
            FAILED_GRADUATION: 'failedGraduation',
          },
        },
        graduated: {
          on: {
            CONTINUE: '#creation.career',
          },
        },
        graduatedHonours: {
          on: {
            CONTINUE: '#creation.career',
          },
        },
        failedGraduation: {
          on: {
            RETRY: {
              target: 'choosing',
              guard: 'canRetryEducation',
            },
            CONTINUE: '#creation.career',
          },
        },
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
