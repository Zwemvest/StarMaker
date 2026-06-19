import { useMemo, useRef } from 'react';
import { createActor } from 'xstate';
import { useSelector } from '@xstate/react';
import { creationMachine, type CreationPhase } from '../machines/creation';
import { useCharacterStore } from '../stores/character';

/**
 * Derive the correct machine events to replay based on persisted store data.
 * Returns a sequence of events that fast-forwards the machine to the right position.
 */
function deriveReplayEvents(): Array<{ type: string; [key: string]: unknown }> {
  const { characteristics, skills, rollLog, dicePool, creationPhase } =
    useCharacterStore.getState();

  // Terminal state: character finished mustering out. Fast-forward straight to
  // the machine's final 'complete' state and ignore all intermediate phases.
  if (creationPhase === 'complete') {
    return [{ type: 'RESTORE_COMPLETE' }];
  }

  const hasNonZeroChars = Object.values(characteristics).some((v) => v > 0);
  const hasSkills = skills.length > 0;
  const hasEducationRolls = rollLog.some((r) => r.context.startsWith('education'));
  const hasDicePool = dicePool.length > 0;

  const events: Array<{ type: string; [key: string]: unknown }> = [];

  // Always start creation
  events.push({ type: 'START_CREATION' });

  if (!hasNonZeroChars && !hasDicePool) {
    // Nothing persisted beyond idle — stay at characteristics.rolling
    return events;
  }

  if (hasDicePool && !hasNonZeroChars) {
    // Rolled but not assigned — fast-forward to characteristics.assigning
    events.push({ type: 'ROLL_ALL' });
    return events;
  }

  if (hasNonZeroChars) {
    // Has characteristics — at minimum get through rolling + assigning
    events.push({ type: 'ROLL_ALL' });
    events.push({ type: 'ASSIGN_COMPLETE' });

    if (!hasSkills && !hasDicePool) {
      // Characteristics done, no pool left, no skills yet — at review or backgroundSkills
      // If pool is empty and chars are assigned, they completed assignment
      events.push({ type: 'CONFIRM' });
      // Now at backgroundSkills — stay here if no skills
      return events;
    }

    if (!hasSkills && hasDicePool) {
      // Still has pool items = still in assigning/review
      return events;
    }

    if (hasSkills) {
      // Has skills — at least through backgroundSkills
      events.push({ type: 'CONFIRM' });
      events.push({ type: 'SKILLS_SELECTED' });
      events.push({ type: 'CONFIRM' });

      if (hasEducationRolls) {
        // Has education rolls — skip education to get to career
        events.push({ type: 'SKIP_EDUCATION' });
        return events;
      }

      // At education choosing
      return events;
    }
  }

  return events;
}

/**
 * Hook wrapping the XState creation machine.
 *
 * Creates a single actor instance and exposes the current phase,
 * full snapshot, and send function. The actor is started on mount
 * and persists for the component lifetime.
 *
 * On mount, reads persisted Zustand store data to derive the correct
 * machine position and fast-forwards via event replay.
 *
 * XState manages workflow position ONLY.
 * Character data lives in Zustand -- never duplicated here.
 */
export function useCreationMachine() {
  const restoredRef = useRef(false);

  const actor = useMemo(() => {
    const a = createActor(creationMachine);
    a.start();

    // Fast-forward machine to match persisted store data
    const events = deriveReplayEvents();
    if (events.length > 1) {
      // More than just START_CREATION means we have persisted data
      restoredRef.current = true;
    }
    for (const event of events) {
      a.send(event as never);
    }

    return a;
  }, []);

  const snapshot = useSelector(actor, (s) => s);
  const currentPhase = useSelector(actor, (s) => {
    const value = s.value;
    // XState v5 nested states return objects like { characteristics: 'rolling' }
    if (typeof value === 'string') return value as CreationPhase;
    return Object.keys(value)[0] as CreationPhase;
  });

  // For nested states, expose the sub-state (e.g., 'rolling', 'assigning', 'review')
  const subState = useSelector(actor, (s) => {
    const value = s.value;
    if (typeof value === 'object' && value !== null) {
      const vals = Object.values(value);
      return vals[0] as string | undefined;
    }
    return undefined;
  });

  return {
    state: snapshot,
    send: actor.send,
    currentPhase,
    subState,
    isRestored: restoredRef.current,
  };
}
