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

/** Helper: navigate from idle to the career.choosingCareer state */
function navigateToCareer() {
  const actor = navigateToEducation();
  actor.send({ type: 'SKIP_EDUCATION' });
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
    expect(actor.getSnapshot().value).toEqual({ career: 'choosingCareer' });

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
    const actor = navigateToCareer();
    // Do a full career flow to reach complete
    actor.send({ type: 'CHOOSE_CAREER', career: 'merchant' });
    actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Free Trader' });
    actor.send({ type: 'QUALIFICATION_SUCCESS' });
    actor.send({ type: 'BASIC_TRAINING_COMPLETE' });
    actor.send({ type: 'SURVIVAL_SUCCESS' });
    actor.send({ type: 'EVENT_RESOLVED' });
    actor.send({ type: 'ADVANCEMENT_RESULT', advanced: false, forcedToLeave: false, forcedToStay: false });
    actor.send({ type: 'SKILL_SELECTED' });
    actor.send({ type: 'MUSTER_OUT' });
    actor.send({ type: 'MUSTERING_COMPLETE' });
    // Post-career sequence: psionics -> equipment -> sheet -> complete
    actor.send({ type: 'PSIONICS_COMPLETE' });
    actor.send({ type: 'EQUIPMENT_COMPLETE' });
    actor.send({ type: 'SHEET_COMPLETE' });
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
    expect(ctx.currentCareer).toBeNull();
    expect(ctx.currentAssignment).toBeNull();
    expect(ctx.careerTermCount).toBe(0);
    expect(ctx.totalTermsServed).toBe(0);
    expect(ctx.isCommissioned).toBe(false);
    expect(ctx.justCommissioned).toBe(false);
    expect(ctx.forcedToLeave).toBe(false);
    expect(ctx.forcedToStay).toBe(false);
    actor.stop();
  });

  it('allows career term looping via CONTINUE_CAREER', () => {
    const actor = navigateToCareer();

    // Choose career and complete a term
    actor.send({ type: 'CHOOSE_CAREER', career: 'merchant' });
    actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Free Trader' });
    actor.send({ type: 'QUALIFICATION_SUCCESS' });
    actor.send({ type: 'BASIC_TRAINING_COMPLETE' });
    actor.send({ type: 'SURVIVAL_SUCCESS' });
    actor.send({ type: 'EVENT_RESOLVED' });
    actor.send({ type: 'ADVANCEMENT_RESULT', advanced: false, forcedToLeave: false, forcedToStay: false });
    actor.send({ type: 'SKILL_SELECTED' });
    // Continue for another term
    actor.send({ type: 'CONTINUE_CAREER' });
    expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'survivalRoll' } });

    // Do another term
    actor.send({ type: 'SURVIVAL_SUCCESS' });
    actor.send({ type: 'EVENT_RESOLVED' });
    actor.send({ type: 'ADVANCEMENT_RESULT', advanced: false, forcedToLeave: false, forcedToStay: false });
    actor.send({ type: 'SKILL_SELECTED' });

    // Muster out
    actor.send({ type: 'MUSTER_OUT' });
    expect(actor.getSnapshot().value).toEqual({ career: 'musteringOut' });

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

    it('transitions backgroundSkills.review -> selecting on EDIT (decline path)', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      actor.send({ type: 'ASSIGN_COMPLETE' });
      actor.send({ type: 'CONFIRM' });
      actor.send({ type: 'SKILLS_SELECTED' });
      expect(actor.getSnapshot().value).toEqual({ backgroundSkills: 'review' });

      actor.send({ type: 'EDIT' });
      expect(actor.getSnapshot().value).toEqual({ backgroundSkills: 'selecting' });
      actor.stop();
    });
  });

  describe('EDIT decline event', () => {
    it('transitions characteristics.review -> assigning on EDIT', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      actor.send({ type: 'ASSIGN_COMPLETE' });
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'review' });

      actor.send({ type: 'EDIT' });
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'assigning' });
      actor.stop();
    });

    it('EDIT from characteristics.assigning is ignored (no-op)', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'assigning' });

      actor.send({ type: 'EDIT' });
      // Still in assigning — no transition defined from here
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'assigning' });
      actor.stop();
    });

    it('can round-trip review -> assigning -> review via EDIT + ASSIGN_COMPLETE', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      actor.send({ type: 'ASSIGN_COMPLETE' });
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'review' });

      actor.send({ type: 'EDIT' });
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'assigning' });

      actor.send({ type: 'ASSIGN_COMPLETE' });
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'review' });
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

    it('transitions choosing -> career.choosingCareer on SKIP_EDUCATION', () => {
      const actor = navigateToEducation();
      actor.send({ type: 'SKIP_EDUCATION' });
      expect(actor.getSnapshot().value).toEqual({ career: 'choosingCareer' });
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
        expect(actor.getSnapshot().value).toEqual({ career: 'choosingCareer' });
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
        expect(actor.getSnapshot().value).toEqual({ career: 'choosingCareer' });
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
        expect(actor.getSnapshot().value).toEqual({ career: 'choosingCareer' });
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
        expect(actor.getSnapshot().value).toEqual({ career: 'choosingCareer' });
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
        expect(actor.getSnapshot().value).toEqual({ career: 'choosingCareer' });
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
        expect(actor.getSnapshot().value).toEqual({ career: 'choosingCareer' });
        actor.stop();
      });
    });
  });

  describe('Career nested states', () => {
    it('transitions from education SKIP_EDUCATION to career.choosingCareer', () => {
      const actor = navigateToCareer();
      expect(actor.getSnapshot().value).toEqual({ career: 'choosingCareer' });
      actor.stop();
    });

    it('completes full civilian career flow: choose -> qualify -> basic -> survival -> event -> advancement -> skill -> continue', () => {
      const actor = navigateToCareer();

      actor.send({ type: 'CHOOSE_CAREER', career: 'merchant' });
      expect(actor.getSnapshot().value).toEqual({ career: 'choosingAssignment' });
      expect(actor.getSnapshot().context.currentCareer).toBe('merchant');

      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Free Trader' });
      expect(actor.getSnapshot().value).toEqual({ career: 'qualificationRoll' });

      actor.send({ type: 'QUALIFICATION_SUCCESS' });
      expect(actor.getSnapshot().value).toEqual({ career: 'basicTraining' });

      actor.send({ type: 'BASIC_TRAINING_COMPLETE' });
      expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'survivalRoll' } });

      actor.send({ type: 'SURVIVAL_SUCCESS' });
      expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'event' } });

      actor.send({ type: 'EVENT_RESOLVED' });
      // Civilian -> straight to advancement (no commission)
      expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'advancement' } });

      actor.send({ type: 'ADVANCEMENT_RESULT', advanced: true, forcedToLeave: false, forcedToStay: false });
      expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'skillSelection' } });

      actor.send({ type: 'SKILL_SELECTED' });
      // Age < 34 (18 + 1*4 = 22), no aging needed
      expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'continueOrLeave' } });

      actor.stop();
    });

    it('military career includes commission step', () => {
      const actor = navigateToCareer();

      actor.send({ type: 'CHOOSE_CAREER', career: 'army' });
      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Infantry' });
      actor.send({ type: 'QUALIFICATION_SUCCESS' });
      actor.send({ type: 'BASIC_TRAINING_COMPLETE' });
      actor.send({ type: 'SURVIVAL_SUCCESS' });
      actor.send({ type: 'EVENT_RESOLVED' });
      // Military -> goes to commission
      expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'commission' } });

      actor.stop();
    });

    it('mishap sends to musteringOut', () => {
      const actor = navigateToCareer();

      actor.send({ type: 'CHOOSE_CAREER', career: 'scout' });
      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Courier' });
      actor.send({ type: 'QUALIFICATION_SUCCESS' });
      actor.send({ type: 'BASIC_TRAINING_COMPLETE' });
      actor.send({ type: 'SURVIVAL_FAILURE' });
      expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'mishap' } });

      actor.send({ type: 'MISHAP_RESOLVED' });
      expect(actor.getSnapshot().value).toEqual({ career: 'musteringOut' });

      actor.stop();
    });

    it('CRER-12: justCommissioned skips advancement', () => {
      const actor = navigateToCareer();

      actor.send({ type: 'CHOOSE_CAREER', career: 'army' });
      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Infantry' });
      actor.send({ type: 'QUALIFICATION_SUCCESS' });
      actor.send({ type: 'BASIC_TRAINING_COMPLETE' });
      actor.send({ type: 'SURVIVAL_SUCCESS' });
      actor.send({ type: 'EVENT_RESOLVED' });
      // At commission — not yet commissioned
      expect(actor.getSnapshot().context.isCommissioned).toBe(false);

      // Commission succeeds -> sets justCommissioned, skips advancement
      actor.send({ type: 'COMMISSION_RESULT', success: true });
      expect(actor.getSnapshot().context.isCommissioned).toBe(true);
      expect(actor.getSnapshot().context.justCommissioned).toBe(true);
      // Went directly to skillSelection (skipping advancement)
      expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'skillSelection' } });

      actor.stop();
    });

    it('already commissioned goes to advancement from commission', () => {
      const actor = navigateToCareer();

      actor.send({ type: 'CHOOSE_CAREER', career: 'navy' });
      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Line/Crew' });
      actor.send({ type: 'QUALIFICATION_SUCCESS' });
      actor.send({ type: 'BASIC_TRAINING_COMPLETE' });

      // First term: get commissioned
      actor.send({ type: 'SURVIVAL_SUCCESS' });
      actor.send({ type: 'EVENT_RESOLVED' });
      actor.send({ type: 'COMMISSION_RESULT', success: true });
      actor.send({ type: 'SKILL_SELECTED' });

      // Continue for second term
      actor.send({ type: 'CONTINUE_CAREER' });
      actor.send({ type: 'SURVIVAL_SUCCESS' });
      actor.send({ type: 'EVENT_RESOLVED' });
      // Now already commissioned -> goes to advancement
      expect(actor.getSnapshot().context.isCommissioned).toBe(true);
      actor.send({ type: 'COMMISSION_RESULT', success: false });
      expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'advancement' } });

      actor.stop();
    });

    it('qualification failure offers draft or drifter', () => {
      const actor = navigateToCareer();

      actor.send({ type: 'CHOOSE_CAREER', career: 'noble' });
      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Administrator' });
      actor.send({ type: 'QUALIFICATION_FAILURE' });
      expect(actor.getSnapshot().value).toEqual({ career: 'qualificationFailed' });

      actor.send({ type: 'CHOOSE_DRIFTER' });
      expect(actor.getSnapshot().value).toEqual({ career: 'basicTraining' });
      expect(actor.getSnapshot().context.currentCareer).toBe('drifter');

      actor.stop();
    });

    it('CHANGE_CAREER returns to choosingCareer', () => {
      const actor = navigateToCareer();

      actor.send({ type: 'CHOOSE_CAREER', career: 'merchant' });
      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Free Trader' });
      actor.send({ type: 'QUALIFICATION_SUCCESS' });
      actor.send({ type: 'BASIC_TRAINING_COMPLETE' });
      actor.send({ type: 'SURVIVAL_SUCCESS' });
      actor.send({ type: 'EVENT_RESOLVED' });
      actor.send({ type: 'ADVANCEMENT_RESULT', advanced: false, forcedToLeave: false, forcedToStay: false });
      actor.send({ type: 'SKILL_SELECTED' });
      actor.send({ type: 'CHANGE_CAREER' });
      expect(actor.getSnapshot().value).toEqual({ career: 'choosingCareer' });

      actor.stop();
    });

    it('musteringOut loops with BENEFIT_ROLLED and exits on MUSTERING_COMPLETE', () => {
      const actor = navigateToCareer();

      actor.send({ type: 'CHOOSE_CAREER', career: 'merchant' });
      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Free Trader' });
      actor.send({ type: 'QUALIFICATION_SUCCESS' });
      actor.send({ type: 'BASIC_TRAINING_COMPLETE' });
      actor.send({ type: 'SURVIVAL_SUCCESS' });
      actor.send({ type: 'EVENT_RESOLVED' });
      actor.send({ type: 'ADVANCEMENT_RESULT', advanced: false, forcedToLeave: false, forcedToStay: false });
      actor.send({ type: 'SKILL_SELECTED' });
      actor.send({ type: 'MUSTER_OUT' });
      expect(actor.getSnapshot().value).toEqual({ career: 'musteringOut' });

      // Roll benefits multiple times
      actor.send({ type: 'BENEFIT_ROLLED' });
      expect(actor.getSnapshot().value).toEqual({ career: 'musteringOut' });
      actor.send({ type: 'BENEFIT_ROLLED' });
      expect(actor.getSnapshot().value).toEqual({ career: 'musteringOut' });

      actor.send({ type: 'MUSTERING_COMPLETE' });
      // Mustering out now routes into the post-career psionics state
      expect(actor.getSnapshot().value).toBe('psionics');

      actor.stop();
    });

    it('tracks term counts in context', () => {
      const actor = navigateToCareer();

      actor.send({ type: 'CHOOSE_CAREER', career: 'scholar' });
      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Scientist' });
      actor.send({ type: 'QUALIFICATION_SUCCESS' });
      actor.send({ type: 'BASIC_TRAINING_COMPLETE' });

      expect(actor.getSnapshot().context.careerTermCount).toBe(1);
      expect(actor.getSnapshot().context.totalTermsServed).toBe(1);

      // Complete term and continue
      actor.send({ type: 'SURVIVAL_SUCCESS' });
      actor.send({ type: 'EVENT_RESOLVED' });
      actor.send({ type: 'ADVANCEMENT_RESULT', advanced: false, forcedToLeave: false, forcedToStay: false });
      actor.send({ type: 'SKILL_SELECTED' });
      actor.send({ type: 'CONTINUE_CAREER' });

      expect(actor.getSnapshot().context.careerTermCount).toBe(2);
      expect(actor.getSnapshot().context.totalTermsServed).toBe(2);

      actor.stop();
    });

    it('tracks forcedToLeave from advancement', () => {
      const actor = navigateToCareer();

      actor.send({ type: 'CHOOSE_CAREER', career: 'citizen' });
      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Worker' });
      actor.send({ type: 'QUALIFICATION_SUCCESS' });
      actor.send({ type: 'BASIC_TRAINING_COMPLETE' });
      actor.send({ type: 'SURVIVAL_SUCCESS' });
      actor.send({ type: 'EVENT_RESOLVED' });
      actor.send({ type: 'ADVANCEMENT_RESULT', advanced: false, forcedToLeave: true, forcedToStay: false });

      expect(actor.getSnapshot().context.forcedToLeave).toBe(true);

      actor.stop();
    });
  });

  describe('RESTORE_COMPLETE (terminal replay)', () => {
    it('transitions idle -> complete on RESTORE_COMPLETE', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'RESTORE_COMPLETE' });
      expect(actor.getSnapshot().value).toBe('complete');
      expect(actor.getSnapshot().status).toBe('done');
      actor.stop();
    });

    it('RESTORE_COMPLETE is ignored outside idle', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'RESTORE_COMPLETE' });
      // Still in characteristics — RESTORE_COMPLETE only fires from idle
      expect(actor.getSnapshot().value).toEqual({ characteristics: 'rolling' });
      actor.stop();
    });
  });

  describe('CRER-11 bonusAdvancementDM carry-over', () => {
    /** Drive a (military) career to the term-loop event state. */
    function navigateToArmyEvent() {
      const actor = navigateToCareer();
      actor.send({ type: 'CHOOSE_CAREER', career: 'army' });
      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'Infantry' });
      actor.send({ type: 'QUALIFICATION_SUCCESS' });
      actor.send({ type: 'BASIC_TRAINING_COMPLETE' });
      actor.send({ type: 'SURVIVAL_SUCCESS' });
      return actor;
    }

    it('initializes bonusAdvancementDM to 0', () => {
      const actor = createActor(creationMachine);
      actor.start();
      expect(actor.getSnapshot().context.bonusAdvancementDM).toBe(0);
      actor.stop();
    });

    it('SET_EVENT_BONUS_DM assigns the amount in the event state', () => {
      const actor = navigateToArmyEvent();
      expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'event' } });

      actor.send({ type: 'SET_EVENT_BONUS_DM', amount: 3 });
      expect(actor.getSnapshot().context.bonusAdvancementDM).toBe(3);

      // The bonus survives the EVENT_RESOLVED transition into commission
      actor.send({ type: 'EVENT_RESOLVED' });
      expect(actor.getSnapshot().value).toEqual({ career: { termLoop: 'commission' } });
      expect(actor.getSnapshot().context.bonusAdvancementDM).toBe(3);
      actor.stop();
    });

    it('resets bonusAdvancementDM to 0 on CONTINUE_CAREER', () => {
      const actor = navigateToArmyEvent();
      actor.send({ type: 'SET_EVENT_BONUS_DM', amount: 4 });
      actor.send({ type: 'EVENT_RESOLVED' }); // -> commission
      actor.send({ type: 'COMMISSION_RESULT', success: false }); // not commissioned -> advancement
      actor.send({ type: 'ADVANCEMENT_RESULT', advanced: false, forcedToLeave: false, forcedToStay: false });
      actor.send({ type: 'SKILL_SELECTED' }); // -> continueOrLeave (age < 34)
      expect(actor.getSnapshot().context.bonusAdvancementDM).toBe(4);

      actor.send({ type: 'CONTINUE_CAREER' });
      expect(actor.getSnapshot().context.bonusAdvancementDM).toBe(0);
      actor.stop();
    });

    it('resets bonusAdvancementDM to 0 on CHOOSE_CAREER', () => {
      const actor = navigateToCareer();
      actor.send({ type: 'CHOOSE_CAREER', career: 'army' });
      expect(actor.getSnapshot().context.bonusAdvancementDM).toBe(0);
      actor.stop();
    });
  });

  describe('post-career sequence', () => {
    /** Drive a minimal civilian career from idle to career.musteringOut. */
    function navigateToMusteringOut() {
      const actor = navigateToCareer();
      actor.send({ type: 'CHOOSE_CAREER', career: 'agent' });
      actor.send({ type: 'CHOOSE_ASSIGNMENT', assignment: 'corporate' });
      actor.send({ type: 'QUALIFICATION_SUCCESS' });
      actor.send({ type: 'BASIC_TRAINING_COMPLETE' });
      actor.send({ type: 'SURVIVAL_SUCCESS' });
      actor.send({ type: 'EVENT_RESOLVED' }); // agent is civilian -> advancement
      actor.send({ type: 'ADVANCEMENT_RESULT', advanced: false, forcedToLeave: false, forcedToStay: false });
      actor.send({ type: 'SKILL_SELECTED' }); // age 22 < 34, no aging -> continueOrLeave
      actor.send({ type: 'MUSTER_OUT' });
      return actor;
    }

    it('routes musteringOut -> psionics -> equipment -> sheet -> complete', () => {
      const actor = navigateToMusteringOut();
      expect(actor.getSnapshot().value).toEqual({ career: 'musteringOut' });

      actor.send({ type: 'MUSTERING_COMPLETE' });
      expect(actor.getSnapshot().value).toBe('psionics');

      actor.send({ type: 'PSIONICS_COMPLETE' });
      expect(actor.getSnapshot().value).toBe('equipment');

      actor.send({ type: 'EQUIPMENT_COMPLETE' });
      expect(actor.getSnapshot().value).toBe('sheet');

      actor.send({ type: 'SHEET_COMPLETE' });
      expect(actor.getSnapshot().value).toBe('complete');
      expect(actor.getSnapshot().status).toBe('done');

      actor.stop();
    });

    it('accepts FORCE_PSIONICS as a self-transition in psionics', () => {
      const actor = navigateToMusteringOut();
      actor.send({ type: 'MUSTERING_COMPLETE' });
      expect(actor.getSnapshot().value).toBe('psionics');

      actor.send({ type: 'FORCE_PSIONICS' });
      expect(actor.getSnapshot().value).toBe('psionics');

      actor.stop();
    });

    it('ignores EQUIPMENT_COMPLETE while in psionics (negative case)', () => {
      const actor = navigateToMusteringOut();
      actor.send({ type: 'MUSTERING_COMPLETE' });
      expect(actor.getSnapshot().value).toBe('psionics');

      actor.send({ type: 'EQUIPMENT_COMPLETE' });
      expect(actor.getSnapshot().value).toBe('psionics');

      actor.stop();
    });
  });
});
