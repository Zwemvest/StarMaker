import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { creationMachine } from '../../src/machines/creation';

/** Helper: navigate from idle to the education.choosing state */
function navigateToEducation() {
  const actor = createActor(creationMachine);
  actor.start();
  actor.send({ type: 'START_CREATION' });
  actor.send({ type: 'ROLL_ALL' });
  actor.send({ type: 'ASSIGN_COMPLETE' });
  actor.send({ type: 'CONFIRM' });
  actor.send({ type: 'SKILLS_SELECTED' });
  actor.send({ type: 'CONFIRM' });
  return actor;
}

describe('Creation State Machine', () => {
  it('starts in idle state', () => {
    const actor = createActor(creationMachine);
    actor.start();
    expect(actor.getSnapshot().value).toBe('idle');
    actor.stop();
  });

  it('transitions from idle to characteristics.rolling on START_CREATION', () => {
    const actor = createActor(creationMachine);
    actor.start();
    actor.send({ type: 'START_CREATION' });
    expect(actor.getSnapshot().value).toEqual({ characteristics: 'rolling' });
    actor.stop();
  });

  it('follows the full happy path through all states (university)', () => {
    const actor = navigateToEducation();
    expect(actor.getSnapshot().value).toEqual({ education: 'choosing' });

    // Choose university -> entry success -> term -> graduation -> graduated -> career
    actor.send({ type: 'CHOOSE_UNIVERSITY' });
    expect(actor.getSnapshot().value).toEqual({ education: 'universityEntry' });

    actor.send({ type: 'ENTRY_SUCCESS' });
    expect(actor.getSnapshot().value).toEqual({ education: 'universityTerm' });

    actor.send({ type: 'TERM_COMPLETE' });
    expect(actor.getSnapshot().value).toEqual({ education: 'graduation' });

    actor.send({ type: 'GRADUATED' });
    expect(actor.getSnapshot().value).toEqual({ education: 'graduated' });

    actor.send({ type: 'CONTINUE' });
    expect(actor.getSnapshot().value).toBe('career');

    actor.send({ type: 'MUSTER_OUT' });
    expect(actor.getSnapshot().value).toBe('musteringOut');

    actor.send({ type: 'MUSTERING_COMPLETE' });
    expect(actor.getSnapshot().value).toBe('complete');

    actor.stop();
  });

  it('ignores invalid transitions (idle + MUSTER_OUT stays in idle)', () => {
    const actor = createActor(creationMachine);
    actor.start();
    actor.send({ type: 'MUSTER_OUT' });
    expect(actor.getSnapshot().value).toBe('idle');
    actor.stop();
  });

  it('complete is a final state (no transitions out)', () => {
    const actor = navigateToEducation();
    actor.send({ type: 'SKIP_EDUCATION' });
    actor.send({ type: 'MUSTER_OUT' });
    actor.send({ type: 'MUSTERING_COMPLETE' });
    expect(actor.getSnapshot().value).toBe('complete');
    expect(actor.getSnapshot().status).toBe('done');
    actor.stop();
  });

  it('has expected initial context values', () => {
    const actor = createActor(creationMachine);
    actor.start();
    const ctx = actor.getSnapshot().context;
    expect(ctx.currentPhase).toBe('idle');
    expect(ctx.characterId).toBe('');
    expect(ctx.termsServed).toBe(0);
    expect(ctx.educationTermsUsed).toBe(0);
    actor.stop();
  });

  it('allows career term looping (CAREER_TERM_COMPLETE stays in career)', () => {
    const actor = navigateToEducation();
    actor.send({ type: 'SKIP_EDUCATION' });

    // Do multiple career terms
    actor.send({ type: 'CAREER_TERM_COMPLETE' });
    expect(actor.getSnapshot().value).toBe('career');

    actor.send({ type: 'CAREER_TERM_COMPLETE' });
    expect(actor.getSnapshot().value).toBe('career');

    actor.send({ type: 'CAREER_TERM_COMPLETE' });
    expect(actor.getSnapshot().value).toBe('career');

    // Then muster out
    actor.send({ type: 'MUSTER_OUT' });
    expect(actor.getSnapshot().value).toBe('musteringOut');

    actor.stop();
  });

  it('cannot skip steps (e.g., idle directly to career)', () => {
    const actor = createActor(creationMachine);
    actor.start();

    // Try to skip to career from idle
    actor.send({ type: 'EDUCATION_COMPLETE' });
    expect(actor.getSnapshot().value).toBe('idle');

    actor.send({ type: 'CAREER_TERM_COMPLETE' });
    expect(actor.getSnapshot().value).toBe('idle');

    actor.stop();
  });

  describe('Characteristics nested states', () => {
    it('starts in rolling sub-state', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'rolling' });
      actor.stop();
    });

    it('transitions rolling -> assigning on ROLL_ALL', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'assigning' });
      actor.stop();
    });

    it('transitions assigning -> review on ASSIGN_COMPLETE', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      actor.send({ type: 'ASSIGN_COMPLETE' });
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'review' });
      actor.stop();
    });

    it('transitions review -> backgroundSkills.selecting on CONFIRM', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      actor.send({ type: 'ASSIGN_COMPLETE' });
      actor.send({ type: 'CONFIRM' });
      expect(actor.getSnapshot().value).toEqual({ backgroundSkills: 'selecting' });
      actor.stop();
    });

    it('ignores ASSIGN_COMPLETE from rolling state', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      // Try to skip rolling
      actor.send({ type: 'ASSIGN_COMPLETE' });
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'rolling' });
      actor.stop();
    });

    it('ignores CONFIRM from assigning state', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      // Try to skip assigning
      actor.send({ type: 'CONFIRM' });
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'assigning' });
      actor.stop();
    });
  });

  describe('BackgroundSkills nested states', () => {
    it('starts in selecting sub-state', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      actor.send({ type: 'ASSIGN_COMPLETE' });
      actor.send({ type: 'CONFIRM' });
      expect(actor.getSnapshot().value).toEqual({ backgroundSkills: 'selecting' });
      actor.stop();
    });

    it('transitions selecting -> review on SKILLS_SELECTED', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      actor.send({ type: 'ASSIGN_COMPLETE' });
      actor.send({ type: 'CONFIRM' });
      actor.send({ type: 'SKILLS_SELECTED' });
      expect(actor.getSnapshot().value).toEqual({ backgroundSkills: 'review' });
      actor.stop();
    });

    it('transitions review -> education on CONFIRM', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      actor.send({ type: 'ASSIGN_COMPLETE' });
      actor.send({ type: 'CONFIRM' });
      actor.send({ type: 'SKILLS_SELECTED' });
      actor.send({ type: 'CONFIRM' });
      expect(actor.getSnapshot().value).toEqual({ education: 'choosing' });
      actor.stop();
    });
  });

  describe('Education nested states', () => {
    it('starts in choosing sub-state', () => {
      const actor = navigateToEducation();
      expect(actor.getSnapshot().value).toEqual({ education: 'choosing' });
      actor.stop();
    });

    it('transitions choosing -> universityEntry on CHOOSE_UNIVERSITY', () => {
      const actor = navigateToEducation();
      actor.send({ type: 'CHOOSE_UNIVERSITY' });
      expect(actor.getSnapshot().value).toEqual({ education: 'universityEntry' });
      actor.stop();
    });

    it('transitions choosing -> academyEntry on CHOOSE_ACADEMY', () => {
      const actor = navigateToEducation();
      actor.send({ type: 'CHOOSE_ACADEMY', branch: 'army' });
      expect(actor.getSnapshot().value).toEqual({ education: 'academyEntry' });
      actor.stop();
    });

    it('transitions choosing -> career on SKIP_EDUCATION', () => {
      const actor = navigateToEducation();
      actor.send({ type: 'SKIP_EDUCATION' });
      expect(actor.getSnapshot().value).toBe('career');
      actor.stop();
    });

    describe('university happy path', () => {
      it('entry success -> term -> graduation -> graduated -> career', () => {
        const actor = navigateToEducation();
        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        actor.send({ type: 'ENTRY_SUCCESS' });
        expect(actor.getSnapshot().value).toEqual({ education: 'universityTerm' });

        actor.send({ type: 'TERM_COMPLETE' });
        expect(actor.getSnapshot().value).toEqual({ education: 'graduation' });

        actor.send({ type: 'GRADUATED' });
        expect(actor.getSnapshot().value).toEqual({ education: 'graduated' });

        actor.send({ type: 'CONTINUE' });
        expect(actor.getSnapshot().value).toBe('career');
        actor.stop();
      });
    });

    describe('academy happy path', () => {
      it('entry success -> term -> graduation -> honours -> career', () => {
        const actor = navigateToEducation();
        actor.send({ type: 'CHOOSE_ACADEMY', branch: 'navy' });
        actor.send({ type: 'ENTRY_SUCCESS' });
        expect(actor.getSnapshot().value).toEqual({ education: 'academyTerm' });

        actor.send({ type: 'TERM_COMPLETE' });
        expect(actor.getSnapshot().value).toEqual({ education: 'graduation' });

        actor.send({ type: 'GRADUATED_HONOURS' });
        expect(actor.getSnapshot().value).toEqual({ education: 'graduatedHonours' });

        actor.send({ type: 'CONTINUE' });
        expect(actor.getSnapshot().value).toBe('career');
        actor.stop();
      });
    });

    describe('entry failure path', () => {
      it('entry failure -> entryFailed with retry/skip options', () => {
        const actor = navigateToEducation();
        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        actor.send({ type: 'ENTRY_FAILURE' });
        expect(actor.getSnapshot().value).toEqual({ education: 'entryFailed' });
        actor.stop();
      });

      it('entry failure -> retry returns to choosing', () => {
        const actor = navigateToEducation();
        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        actor.send({ type: 'ENTRY_FAILURE' });
        actor.send({ type: 'RETRY' });
        expect(actor.getSnapshot().value).toEqual({ education: 'choosing' });
        actor.stop();
      });

      it('entry failure -> skip goes to career', () => {
        const actor = navigateToEducation();
        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        actor.send({ type: 'ENTRY_FAILURE' });
        actor.send({ type: 'SKIP' });
        expect(actor.getSnapshot().value).toBe('career');
        actor.stop();
      });
    });

    describe('failed graduation path', () => {
      it('failed graduation shows correct state', () => {
        const actor = navigateToEducation();
        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        actor.send({ type: 'ENTRY_SUCCESS' });
        actor.send({ type: 'TERM_COMPLETE' });
        actor.send({ type: 'FAILED_GRADUATION' });
        expect(actor.getSnapshot().value).toEqual({ education: 'failedGraduation' });
        actor.stop();
      });

      it('failed graduation -> retry returns to choosing', () => {
        const actor = navigateToEducation();
        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        actor.send({ type: 'ENTRY_SUCCESS' });
        actor.send({ type: 'TERM_COMPLETE' });
        actor.send({ type: 'FAILED_GRADUATION' });
        actor.send({ type: 'RETRY' });
        expect(actor.getSnapshot().value).toEqual({ education: 'choosing' });
        actor.stop();
      });

      it('failed graduation -> continue goes to career', () => {
        const actor = navigateToEducation();
        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        actor.send({ type: 'ENTRY_SUCCESS' });
        actor.send({ type: 'TERM_COMPLETE' });
        actor.send({ type: 'FAILED_GRADUATION' });
        actor.send({ type: 'CONTINUE' });
        expect(actor.getSnapshot().value).toBe('career');
        actor.stop();
      });
    });

    describe('GO_BACK from entry states', () => {
      it('GO_BACK from universityEntry returns to choosing and decrements educationTermsUsed', () => {
        const actor = navigateToEducation();
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(0);

        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(1);

        actor.send({ type: 'GO_BACK' });
        expect(actor.getSnapshot().value).toEqual({ education: 'choosing' });
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(0);
        actor.stop();
      });

      it('GO_BACK from academyEntry returns to choosing and decrements educationTermsUsed', () => {
        const actor = navigateToEducation();
        actor.send({ type: 'CHOOSE_ACADEMY', branch: 'navy' });
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(1);

        actor.send({ type: 'GO_BACK' });
        expect(actor.getSnapshot().value).toEqual({ education: 'choosing' });
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(0);
        actor.stop();
      });
    });

    describe('educationTermsUsed tracking', () => {
      it('increments on university entry', () => {
        const actor = navigateToEducation();
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(0);

        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(1);
        actor.stop();
      });

      it('increments on academy entry', () => {
        const actor = navigateToEducation();
        actor.send({ type: 'CHOOSE_ACADEMY', branch: 'marines' });
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(1);
        actor.stop();
      });

      it('accumulates across retries', () => {
        const actor = navigateToEducation();

        // First attempt: fail
        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(1);
        actor.send({ type: 'ENTRY_FAILURE' });
        actor.send({ type: 'RETRY' });

        // Second attempt: fail
        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(2);
        actor.send({ type: 'ENTRY_FAILURE' });
        actor.send({ type: 'RETRY' });

        // Third attempt
        actor.send({ type: 'CHOOSE_UNIVERSITY' });
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(3);
        actor.stop();
      });
    });

    describe('canRetryEducation guard', () => {
      it('blocks retry after 3 education terms used', () => {
        const actor = navigateToEducation();

        // Use all 3 terms
        actor.send({ type: 'CHOOSE_UNIVERSITY' }); // term 1
        actor.send({ type: 'ENTRY_FAILURE' });
        actor.send({ type: 'RETRY' });

        actor.send({ type: 'CHOOSE_UNIVERSITY' }); // term 2
        actor.send({ type: 'ENTRY_FAILURE' });
        actor.send({ type: 'RETRY' });

        actor.send({ type: 'CHOOSE_UNIVERSITY' }); // term 3
        actor.send({ type: 'ENTRY_FAILURE' });

        // Retry should be blocked - stays in entryFailed
        actor.send({ type: 'RETRY' });
        expect(actor.getSnapshot().value).toEqual({ education: 'entryFailed' });
        expect(actor.getSnapshot().context.educationTermsUsed).toBe(3);

        // But SKIP still works
        actor.send({ type: 'SKIP' });
        expect(actor.getSnapshot().value).toBe('career');
        actor.stop();
      });

      it('blocks retry from failedGraduation after 3 terms', () => {
        const actor = navigateToEducation();

        // Term 1: entry success but fail graduation
        actor.send({ type: 'CHOOSE_UNIVERSITY' }); // term 1
        actor.send({ type: 'ENTRY_SUCCESS' });
        actor.send({ type: 'TERM_COMPLETE' });
        actor.send({ type: 'FAILED_GRADUATION' });
        actor.send({ type: 'RETRY' });

        // Term 2: entry fail
        actor.send({ type: 'CHOOSE_UNIVERSITY' }); // term 2
        actor.send({ type: 'ENTRY_FAILURE' });
        actor.send({ type: 'RETRY' });

        // Term 3: entry success but fail graduation
        actor.send({ type: 'CHOOSE_UNIVERSITY' }); // term 3
        actor.send({ type: 'ENTRY_SUCCESS' });
        actor.send({ type: 'TERM_COMPLETE' });
        actor.send({ type: 'FAILED_GRADUATION' });

        // Retry should be blocked
        actor.send({ type: 'RETRY' });
        expect(actor.getSnapshot().value).toEqual({ education: 'failedGraduation' });

        // CONTINUE still works
        actor.send({ type: 'CONTINUE' });
        expect(actor.getSnapshot().value).toBe('career');
        actor.stop();
      });
    });
  });
});
