import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { CharacteristicId } from '../types/common';
import type { Characteristics, Skill } from '../types/character';
import type { RollLogEntry } from '../types/dice';

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
}

/** Character store actions */
interface CharacterActions {
  setCharacteristic: (id: CharacteristicId, value: number) => void;
  addSkill: (name: string, level: number) => void;
  updateSkillLevel: (name: string, level: number) => void;
  appendRoll: (entry: RollLogEntry) => void;
  setLegitimacyHash: (hash: string) => void;
  setModified: () => void;
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
};

/**
 * Zustand + Immer character data store.
 *
 * Manages ONLY character data (stats, skills, roll log, etc.).
 * Workflow position lives in the XState machine — never duplicated here.
 *
 * Immer enables mutable-style syntax while maintaining immutable state updates.
 */
export const useCharacterStore = create<CharacterStore>()(
  immer((set) => ({
    ...initialState,

    setCharacteristic: (id, value) =>
      set((state) => {
        state.characteristics[id] = value;
      }),

    addSkill: (name, level) =>
      set((state) => {
        state.skills.push({ name, level });
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

    resetCharacter: () =>
      set(() => ({
        ...initialState,
        characteristics: initialCharacteristics(),
        skills: [],
        rollLog: [],
      })),
  })),
);
