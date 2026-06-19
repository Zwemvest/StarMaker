import { useCallback } from 'react';
import { rollDice } from '../engine/dice';
import { createRollLogEntry } from '../engine/roll-log';
import { computeHash } from '../engine/hash';
import { useCharacterStore } from '../stores/character';
import type { RollLogEntry } from '../types/dice';

/**
 * Atomic roll + log + hash hook.
 *
 * Every roll is atomically logged and hashed to maintain
 * the legitimacy chain. No roll should bypass this hook
 * during character creation.
 */
export function useLoggedRoll() {
  const appendRoll = useCharacterStore((s) => s.appendRoll);
  const setLegitimacyHash = useCharacterStore((s) => s.setLegitimacyHash);

  const loggedRoll2D = useCallback(
    async (
      context: string,
      modifier: number = 0,
      target?: number,
    ): Promise<RollLogEntry> => {
      const dice = rollDice(2, 6);
      const entry = createRollLogEntry(context, '2D', dice, modifier, target);

      // Get current log state at call time for hash computation
      const currentLog = useCharacterStore.getState().rollLog;
      appendRoll(entry);

      // Recompute hash with new entry
      const newLog = [...currentLog, entry];
      const hash = await computeHash(newLog);
      setLegitimacyHash(hash);

      return entry;
    },
    [appendRoll, setLegitimacyHash],
  );

  const loggedRoll1D = useCallback(
    async (
      context: string,
      modifier: number = 0,
      target?: number,
    ): Promise<RollLogEntry> => {
      const dice = rollDice(1, 6);
      const entry = createRollLogEntry(context, '1D', dice, modifier, target);

      // Get current log state at call time for hash computation
      const currentLog = useCharacterStore.getState().rollLog;
      appendRoll(entry);

      // Recompute hash with new entry
      const hash = await computeHash([...currentLog, entry]);
      setLegitimacyHash(hash);

      return entry;
    },
    [appendRoll, setLegitimacyHash],
  );

  return { loggedRoll2D, loggedRoll1D };
}
