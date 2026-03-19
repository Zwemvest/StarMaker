import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '../../src/stores/character';
import type { RollLogEntry } from '../../src/types/dice';

describe('Character Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCharacterStore.getState().resetCharacter();
  });

  it('has initial characteristics all set to 0', () => {
    const { characteristics } = useCharacterStore.getState();
    expect(characteristics.STR).toBe(0);
    expect(characteristics.DEX).toBe(0);
    expect(characteristics.END).toBe(0);
    expect(characteristics.INT).toBe(0);
    expect(characteristics.EDU).toBe(0);
    expect(characteristics.SOC).toBe(0);
  });

  it('setCharacteristic updates a single characteristic', () => {
    useCharacterStore.getState().setCharacteristic('STR', 9);
    expect(useCharacterStore.getState().characteristics.STR).toBe(9);
    // Others remain unchanged
    expect(useCharacterStore.getState().characteristics.DEX).toBe(0);
  });

  it('setCharacteristic does not mutate previous state snapshot', () => {
    const before = useCharacterStore.getState().characteristics;
    useCharacterStore.getState().setCharacteristic('STR', 12);
    const after = useCharacterStore.getState().characteristics;

    // The reference should be different (immutability)
    expect(before).not.toBe(after);
    // Old snapshot unchanged
    expect(before.STR).toBe(0);
    // New snapshot updated
    expect(after.STR).toBe(12);
  });

  it('addSkill adds to skills array', () => {
    useCharacterStore.getState().addSkill('Pilot', 1);
    const { skills } = useCharacterStore.getState();
    expect(skills).toHaveLength(1);
    expect(skills[0]).toEqual({ name: 'Pilot', level: 1 });
  });

  it('updateSkillLevel modifies an existing skill', () => {
    useCharacterStore.getState().addSkill('Medic', 0);
    useCharacterStore.getState().updateSkillLevel('Medic', 2);
    const { skills } = useCharacterStore.getState();
    expect(skills[0]).toEqual({ name: 'Medic', level: 2 });
  });

  it('appendRoll adds to roll log without mutating', () => {
    const entry: RollLogEntry = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      context: 'characteristics.STR',
      notation: '2D',
      results: [4, 3],
      total: 7,
      modifier: 0,
      target: null,
      success: null,
      overridden: false,
    };

    const beforeLog = useCharacterStore.getState().rollLog;
    useCharacterStore.getState().appendRoll(entry);
    const afterLog = useCharacterStore.getState().rollLog;

    expect(afterLog).toHaveLength(1);
    expect(afterLog[0]).toEqual(entry);
    // Old snapshot unchanged
    expect(beforeLog).toHaveLength(0);
    expect(beforeLog).not.toBe(afterLog);
  });

  it('resetCharacter returns to initial state', () => {
    // Mutate state
    useCharacterStore.getState().setCharacteristic('INT', 10);
    useCharacterStore.getState().addSkill('Gun Combat', 1);
    useCharacterStore.getState().setModified();

    // Reset
    useCharacterStore.getState().resetCharacter();

    const state = useCharacterStore.getState();
    expect(state.characteristics.INT).toBe(0);
    expect(state.skills).toHaveLength(0);
    expect(state.isModified).toBe(false);
    expect(state.rollLog).toHaveLength(0);
    expect(state.legitimacyHash).toBe('');
  });

  it('setModified sets isModified to true', () => {
    expect(useCharacterStore.getState().isModified).toBe(false);
    useCharacterStore.getState().setModified();
    expect(useCharacterStore.getState().isModified).toBe(true);
  });

  it('setLegitimacyHash sets the hash string', () => {
    expect(useCharacterStore.getState().legitimacyHash).toBe('');
    useCharacterStore.getState().setLegitimacyHash('a3f7c2b1');
    expect(useCharacterStore.getState().legitimacyHash).toBe('a3f7c2b1');
  });

  it('setCharacteristic caps values at 15 maximum (CHAR-04)', () => {
    useCharacterStore.getState().setCharacteristic('STR', 18);
    expect(useCharacterStore.getState().characteristics.STR).toBe(15);
  });

  it('setCharacteristic allows values at or below 15', () => {
    useCharacterStore.getState().setCharacteristic('DEX', 12);
    expect(useCharacterStore.getState().characteristics.DEX).toBe(12);

    useCharacterStore.getState().setCharacteristic('END', 15);
    expect(useCharacterStore.getState().characteristics.END).toBe(15);
  });
});
