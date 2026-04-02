import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CharacteristicId } from '../types/common';
import type { Characteristics, Skill } from '../types/character';
import type { RollLogEntry } from '../types/dice';
import type { PoolItem } from '../components/characteristics/DicePool';

/** Initial characteristics — all six stats at 0 */
function initialCharacteristics(): Characteristics {
  return {
    STR: 0,
    DEX: 0,
    END: 0,
    INT: 0,
    EDU: 0,
    SOC: 0,
  };
}

/** Character store state (data only — no workflow position) */
interface CharacterState {
  characteristics: Characteristics;
  skills: Skill[];
  rollLog: RollLogEntry[];
  legitimacyHash: string;
  isModified: boolean;
  dicePool: PoolItem[];
}

/** Character store actions */
interface CharacterActions {
  setCharacteristic: (id: CharacteristicId, value: number) => void;
  addSkill: (name: string, level: number) => void;
  updateSkillLevel: (name: string, level: number) => void;
  appendRoll: (entry: RollLogEntry) => void;
  setLegitimacyHash: (hash: string) => void;
  setModified: () => void;
  setDicePool: (pool: PoolItem[]) => void;
  resetCharacter: () => void;
}

/** Combined store type */
type CharacterStore = CharacterState & CharacterActions;

/** Initial state for resets */
const initialState: CharacterState = {
  characteristics: initialCharacteristics(),
  skills: [],
  rollLog: [],
  legitimacyHash: '',
  isModified: false,
  dicePool: [],
};

/**
 * Zustand + Immer + Persist character data store.
 *
 * Manages ONLY character data (stats, skills, roll log, dice pool, etc.).
 * Workflow position lives in the XState machine — never duplicated here.
 *
 * Immer enables mutable-style syntax while maintaining immutable state updates.
 * Persist middleware saves to sessionStorage so page refresh preserves data.
 */
export const useCharacterStore = create<CharacterStore>()(
  persist(
    immer((set) => ({
      ...initialState,

      setCharacteristic: (id, value) =>
        set((state) => {
          state.characteristics[id] = Math.min(value, 15);
        }),

      addSkill: (name, level) =>
        set((state) => {
          const existing = state.skills.find((s) => s.name === name);
          if (existing) {
            // Only upgrade if new level is higher
            if (level > existing.level) {
              existing.level = level;
            }
            // Otherwise skip — skill already owned at equal or higher level
          } else {
            state.skills.push({ name, level });
          }
        }),

      updateSkillLevel: (name, level) =>
        set((state) => {
          const skill = state.skills.find((s) => s.name === name);
          if (skill) {
            skill.level = level;
          }
        }),

      appendRoll: (entry) =>
        set((state) => {
          state.rollLog.push(entry);
        }),

      setLegitimacyHash: (hash) =>
        set((state) => {
          state.legitimacyHash = hash;
        }),

      setModified: () =>
        set((state) => {
          state.isModified = true;
        }),

      setDicePool: (pool) =>
        set((state) => {
          state.dicePool = pool;
        }),

      resetCharacter: () =>
        set(() => ({
          ...initialState,
          characteristics: initialCharacteristics(),
          skills: [],
          rollLog: [],
          dicePool: [],
        })),
    })),
    {
      name: 'starmaker-character',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
