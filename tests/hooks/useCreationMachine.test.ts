import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCreationMachine } from '../../src/hooks/useCreationMachine';
import { useCharacterStore } from '../../src/stores/character';

describe('useCreationMachine — replay derivation', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('fast-forwards to complete when creationPhase is "complete"', () => {
    // Simulate a finished character whose terminal marker was persisted
    useCharacterStore.getState().setCreationPhase('complete');

    const { result } = renderHook(() => useCreationMachine());

    expect(result.current.currentPhase).toBe('complete');
    expect(result.current.state.status).toBe('done');
  });

  it('fast-forwards into the post-career flow (psionics) when creationPhase is "postCareer"', () => {
    // A character who has mustered out but not yet finished the sheet must be
    // restored into the post-career flow, not the terminal complete state and
    // not back at career selection.
    useCharacterStore.getState().setCreationPhase('postCareer');

    const { result } = renderHook(() => useCreationMachine());

    expect(result.current.currentPhase).toBe('psionics');
    expect(result.current.state.status).toBe('active');
  });

  it('stays at characteristics for a fresh active character (regression)', () => {
    // resetCharacter already sets creationPhase 'active' with no rolled data
    const { result } = renderHook(() => useCreationMachine());

    expect(result.current.currentPhase).toBe('characteristics');
    expect(result.current.subState).toBe('rolling');
  });

  it('does not treat an active character as complete even with full data', () => {
    const store = useCharacterStore.getState();
    store.setCharacteristic('STR', 8);
    store.addSkill('Gun Combat', 1);
    // creationPhase remains 'active' — replay should NOT short-circuit to complete
    const { result } = renderHook(() => useCreationMachine());

    expect(result.current.currentPhase).not.toBe('complete');
  });
});
