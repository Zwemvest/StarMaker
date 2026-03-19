import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { creationMachine } from '../../src/machines/creation';

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

  it('follows the full happy path through all states', () => {
    const actor = createActor(creationMachine);
    actor.start();

    actor.send({ type: 'START_CREATION' });
    expect(actor.getSnapshot().value).toEqual({ characteristics: 'rolling' });

    // Navigate through characteristics nested states
    actor.send({ type: 'ROLL_ALL' });
    expect(actor.getSnapshot().value).toEqual({ characteristics: 'assigning' });

    actor.send({ type: 'ASSIGN_COMPLETE' });
    expect(actor.getSnapshot().value).toEqual({ characteristics: 'review' });

    actor.send({ type: 'CONFIRM' });
    expect(actor.getSnapshot().value).toBe('backgroundSkills');

    actor.send({ type: 'BACKGROUND_COMPLETE' });
    expect(actor.getSnapshot().value).toBe('education');

    actor.send({ type: 'EDUCATION_COMPLETE' });
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
    const actor = createActor(creationMachine);
    actor.start();

    // Navigate to complete
    actor.send({ type: 'START_CREATION' });
    actor.send({ type: 'ROLL_ALL' });
    actor.send({ type: 'ASSIGN_COMPLETE' });
    actor.send({ type: 'CONFIRM' });
    actor.send({ type: 'BACKGROUND_COMPLETE' });
    actor.send({ type: 'EDUCATION_COMPLETE' });
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
    actor.stop();
  });

  it('allows career term looping (CAREER_TERM_COMPLETE stays in career)', () => {
    const actor = createActor(creationMachine);
    actor.start();

    actor.send({ type: 'START_CREATION' });
    actor.send({ type: 'ROLL_ALL' });
    actor.send({ type: 'ASSIGN_COMPLETE' });
    actor.send({ type: 'CONFIRM' });
    actor.send({ type: 'BACKGROUND_COMPLETE' });
    actor.send({ type: 'EDUCATION_COMPLETE' });

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

    it('transitions review -> backgroundSkills on CONFIRM', () => {
      const actor = createActor(creationMachine);
      actor.start();
      actor.send({ type: 'START_CREATION' });
      actor.send({ type: 'ROLL_ALL' });
      actor.send({ type: 'ASSIGN_COMPLETE' });
      actor.send({ type: 'CONFIRM' });
      expect(actor.getSnapshot().value).toBe('backgroundSkills');
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
});
