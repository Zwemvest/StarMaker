import { assign, setup } from 'xstate';
import { canAttemptEducation } from '../engine/education';
import type { CareerName } from '../types/careers';

/** Phases of character creation that the machine tracks */
export type CreationPhase =
  | 'idle'
  | 'characteristics'
  | 'backgroundSkills'
  | 'education'
  | 'career'
  | 'musteringOut'
  | 'psionics'
  | 'equipment'
  | 'sheet'
  | 'complete';

/** Machine context — workflow position only, no character data */
interface CreationContext {
  currentPhase: CreationPhase;
  characterId: string;
  termsServed: number;
  educationTermsUsed: number;
  currentCareer: CareerName | null;
  currentAssignment: string | null;
  careerTermCount: number;
  totalTermsServed: number;
  isCommissioned: boolean;
  justCommissioned: boolean;
  forcedToLeave: boolean;
  forcedToStay: boolean;
  /** Event-granted advancement DM for the current term (CRER-11). Resets each term. */
  bonusAdvancementDM: number;
}

/** All events the creation machine responds to */
export type CreationEvent =
  | { type: 'START_CREATION' }
  | { type: 'RESTORE_COMPLETE' }
  | { type: 'RESTORE_POST_CAREER' }
  | { type: 'ROLL_ALL' }
  | { type: 'ASSIGN_COMPLETE' }
  | { type: 'CONFIRM' }
  | { type: 'EDIT' }
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
  | { type: 'CONTINUE' }
  | { type: 'GO_BACK' }
  | { type: 'CHOOSE_CAREER'; career: CareerName }
  | { type: 'CHOOSE_ASSIGNMENT'; assignment: string }
  | { type: 'QUALIFICATION_SUCCESS' }
  | { type: 'QUALIFICATION_FAILURE' }
  | { type: 'CHOOSE_DRAFT' }
  | { type: 'CHOOSE_DRIFTER' }
  | { type: 'BASIC_TRAINING_COMPLETE' }
  | { type: 'SURVIVAL_SUCCESS' }
  | { type: 'SURVIVAL_FAILURE' }
  | { type: 'MISHAP_RESOLVED' }
  | { type: 'EVENT_RESOLVED' }
  | { type: 'COMMISSION_RESULT'; success: boolean }
  | { type: 'ADVANCEMENT_RESULT'; advanced: boolean; forcedToLeave: boolean; forcedToStay: boolean }
  | { type: 'SKILL_SELECTED' }
  | { type: 'AGING_RESOLVED' }
  | { type: 'CONTINUE_CAREER' }
  | { type: 'CHANGE_CAREER' }
  | { type: 'SET_EVENT_BONUS_DM'; amount: number }
  | { type: 'BENEFIT_ROLLED' }
  | { type: 'PSIONICS_COMPLETE' }
  | { type: 'EQUIPMENT_COMPLETE' }
  | { type: 'SHEET_COMPLETE' }
  | { type: 'FORCE_PSIONICS' };

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
    isMilitary: ({ context }) => {
      const militaryCareers: CareerName[] = ['army', 'marine', 'navy'];
      return context.currentCareer !== null && militaryCareers.includes(context.currentCareer);
    },
    isCommissioned: ({ context }) => context.isCommissioned,
    notJustCommissioned: ({ context }) => !context.justCommissioned,
    needsAging: ({ context }) => {
      // Age starts at 18, +4 per term. Aging effects start at 34+ (AGNG-01)
      // totalTermsServed already incremented for this term
      const age = 18 + context.totalTermsServed * 4;
      return age >= 34;
    },
    canContinue: ({ context }) => !context.forcedToLeave,
    mustContinue: ({ context }) => context.forcedToStay,
  },
}).createMachine({
  id: 'creation',
  initial: 'idle',
  context: {
    currentPhase: 'idle',
    characterId: '',
    termsServed: 0,
    educationTermsUsed: 0,
    currentCareer: null,
    currentAssignment: null,
    careerTermCount: 0,
    totalTermsServed: 0,
    isCommissioned: false,
    justCommissioned: false,
    forcedToLeave: false,
    forcedToStay: false,
    bonusAdvancementDM: 0,
  },
  states: {
    idle: {
      on: {
        START_CREATION: 'characteristics',
        RESTORE_COMPLETE: '#creation.complete',
        RESTORE_POST_CAREER: '#creation.psionics',
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
            EDIT: 'assigning',
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
            EDIT: 'selecting',
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
            GO_BACK: {
              target: 'choosing',
              actions: assign({
                educationTermsUsed: ({ context }) => context.educationTermsUsed - 1,
              }),
            },
          },
        },
        academyEntry: {
          entry: assign({
            educationTermsUsed: ({ context }) => context.educationTermsUsed + 1,
          }),
          on: {
            ENTRY_SUCCESS: 'academyTerm',
            ENTRY_FAILURE: 'entryFailed',
            GO_BACK: {
              target: 'choosing',
              actions: assign({
                educationTermsUsed: ({ context }) => context.educationTermsUsed - 1,
              }),
            },
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
      id: 'career',
      initial: 'choosingCareer',
      states: {
        choosingCareer: {
          on: {
            CHOOSE_CAREER: {
              target: 'choosingAssignment',
              actions: assign({
                currentCareer: ({ event }) => event.career,
                careerTermCount: 0,
                isCommissioned: false,
                justCommissioned: false,
                forcedToLeave: false,
                forcedToStay: false,
                bonusAdvancementDM: 0,
              }),
            },
          },
        },
        choosingAssignment: {
          on: {
            CHOOSE_ASSIGNMENT: {
              target: 'qualificationRoll',
              actions: assign({
                currentAssignment: ({ event }) => event.assignment,
              }),
            },
          },
        },
        qualificationRoll: {
          on: {
            QUALIFICATION_SUCCESS: 'basicTraining',
            QUALIFICATION_FAILURE: 'qualificationFailed',
          },
        },
        qualificationFailed: {
          on: {
            CHOOSE_DRAFT: {
              target: 'basicTraining',
            },
            CHOOSE_DRIFTER: {
              target: 'basicTraining',
              actions: assign({
                currentCareer: 'drifter' as CareerName,
                currentAssignment: null,
              }),
            },
          },
        },
        basicTraining: {
          on: {
            BASIC_TRAINING_COMPLETE: {
              target: 'termLoop',
              actions: assign({
                careerTermCount: ({ context }) => context.careerTermCount + 1,
                totalTermsServed: ({ context }) => context.totalTermsServed + 1,
                justCommissioned: false,
                forcedToLeave: false,
                forcedToStay: false,
                bonusAdvancementDM: 0,
              }),
            },
          },
        },
        termLoop: {
          initial: 'survivalRoll',
          states: {
            survivalRoll: {
              on: {
                SURVIVAL_SUCCESS: 'event',
                SURVIVAL_FAILURE: 'mishap',
              },
            },
            mishap: {
              on: {
                MISHAP_RESOLVED: '#career.musteringOut',
              },
            },
            event: {
              on: {
                SET_EVENT_BONUS_DM: {
                  actions: assign({
                    bonusAdvancementDM: ({ event }) => event.amount,
                  }),
                },
                EVENT_RESOLVED: [
                  {
                    // Military + not yet commissioned -> commission roll
                    target: 'commission',
                    guard: { type: 'isMilitary' },
                  },
                  {
                    // Civilian careers -> straight to advancement
                    target: 'advancement',
                  },
                ],
              },
            },
            commission: {
              on: {
                COMMISSION_RESULT: [
                  {
                    // Already commissioned — skip commission, go to advancement
                    target: 'advancement',
                    guard: { type: 'isCommissioned' },
                  },
                  {
                    // Just earned commission — skip advancement this term (CRER-12)
                    target: 'skillSelection',
                    actions: assign({
                      isCommissioned: ({ event }) => event.success,
                      justCommissioned: ({ event }) => event.success,
                    }),
                  },
                ],
              },
            },
            advancement: {
              on: {
                ADVANCEMENT_RESULT: {
                  target: 'skillSelection',
                  actions: assign({
                    forcedToLeave: ({ event }) => event.forcedToLeave,
                    forcedToStay: ({ event }) => event.forcedToStay,
                  }),
                },
              },
            },
            skillSelection: {
              on: {
                SKILL_SELECTED: [
                  {
                    target: 'aging',
                    guard: { type: 'needsAging' },
                  },
                  {
                    target: 'continueOrLeave',
                  },
                ],
              },
            },
            aging: {
              on: {
                AGING_RESOLVED: 'continueOrLeave',
              },
            },
            continueOrLeave: {
              on: {
                CONTINUE_CAREER: {
                  target: 'survivalRoll',
                  actions: assign({
                    careerTermCount: ({ context }) => context.careerTermCount + 1,
                    totalTermsServed: ({ context }) => context.totalTermsServed + 1,
                    justCommissioned: false,
                    forcedToLeave: false,
                    forcedToStay: false,
                    bonusAdvancementDM: 0,
                  }),
                },
                CHANGE_CAREER: '#career.choosingCareer',
                MUSTER_OUT: '#career.musteringOut',
              },
            },
          },
        },
        musteringOut: {
          on: {
            BENEFIT_ROLLED: 'musteringOut',
            MUSTERING_COMPLETE: '#creation.psionics',
          },
        },
      },
    },
    psionics: {
      on: {
        // Acknowledged so the UI can fire it; the force-unlock side effect
        // (psionicsUnlocked + isModified + log marker) lives in the store.
        FORCE_PSIONICS: { target: 'psionics' },
        PSIONICS_COMPLETE: 'equipment',
      },
    },
    equipment: {
      on: {
        EQUIPMENT_COMPLETE: 'sheet',
      },
    },
    sheet: {
      on: {
        SHEET_COMPLETE: 'complete',
      },
    },
    complete: {
      type: 'final',
    },
  },
});
