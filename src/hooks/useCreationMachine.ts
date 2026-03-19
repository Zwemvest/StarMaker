import { useMemo } from 'react';
import { createActor } from 'xstate';
import { useSelector } from '@xstate/react';
import { creationMachine, type CreationPhase } from '../machines/creation';

/**
 * Hook wrapping the XState creation machine.
 *
 * Creates a single actor instance and exposes the current phase,
 * full snapshot, and send function. The actor is started on mount
 * and persists for the component lifetime.
 *
 * XState manages workflow position ONLY.
 * Character data lives in Zustand -- never duplicated here.
 */
export function useCreationMachine() {
  const actor = useMemo(() => {
    const a = createActor(creationMachine);
    a.start();
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
  };
}
