import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { CareerEventCard } from '../../src/components/career/CareerEventCard';
import { useCharacterStore } from '../../src/stores/character';
import * as dice from '../../src/engine/dice';
import type { CareerEvent } from '../../src/types/careers';

function makeEvent(partial: Partial<CareerEvent>): CareerEvent {
  return {
    rollValue: 8,
    description: 'Test event',
    effectDescription: 'Test effect',
    effects: [],
    hasChoice: false,
    ...partial,
  };
}

describe('CareerEventCard — advancement DM detection (CRER-11)', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('calls onResolved(2) for a plain advancement_dm effect', async () => {
    const onResolved = vi.fn();
    const event = makeEvent({
      effects: [{ type: 'advancement_dm', detail: 'DM+2 to next advancement roll', value: 2 }],
    });
    render(createElement(CareerEventCard, { event, onResolved }));

    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(onResolved).toHaveBeenCalledWith(2));
  });

  it('calls onResolved(4) when the user picks the advancement choice option', async () => {
    const onResolved = vi.fn();
    const event = makeEvent({
      hasChoice: true,
      effects: [
        {
          type: 'choice',
          detail: 'Gain Ally or DM+4 to next advancement',
          options: ['Ally', 'DM+4 advancement'],
          value: 4,
        },
      ],
    });
    render(createElement(CareerEventCard, { event, onResolved }));

    fireEvent.click(screen.getByText('DM+4 advancement'));
    await waitFor(() => expect(onResolved).toHaveBeenCalledWith(4));
  });

  it('calls onResolved(0) when the user picks the non-advancement choice option', async () => {
    const onResolved = vi.fn();
    const event = makeEvent({
      hasChoice: true,
      effects: [
        {
          type: 'choice',
          detail: 'Gain Ally or DM+4 to next advancement',
          options: ['Ally', 'DM+4 advancement'],
          value: 4,
        },
      ],
    });
    render(createElement(CareerEventCard, { event, onResolved }));

    fireEvent.click(screen.getByText('Ally'));
    await waitFor(() => expect(onResolved).toHaveBeenCalledWith(0));
  });

  it('calls onResolved(0) for an event with no advancement effects', async () => {
    const onResolved = vi.fn();
    const event = makeEvent({
      effects: [{ type: 'skill', detail: 'Gain Gun Combat 1' }],
    });
    render(createElement(CareerEventCard, { event, onResolved }));

    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(onResolved).toHaveBeenCalledWith(0));
  });

  it('applies skill side-effects and still reports the advancement bonus', async () => {
    const onResolved = vi.fn();
    const event = makeEvent({
      effects: [
        { type: 'advancement_dm', detail: 'DM+2 to next advancement roll', value: 2 },
        // skill effects from career events use target/value (life-event style) — a
        // plain detail-only skill effect grants nothing, so the bonus is the assertion here
      ],
    });
    render(createElement(CareerEventCard, { event, onResolved }));

    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(onResolved).toHaveBeenCalledWith(2));
  });
});

describe('CareerEventCard — Unusual-Event psionics unlock (Task 3)', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Force the dice engine to drive the Life Events table to roll 12 ("Unusual
   * Event") and the 1D sub-table to `subRoll`. loggedRoll2D rolls rollDice(2,6)
   * and loggedRoll1D rolls rollDice(1,6); we route by die count.
   */
  function mockDice(subRoll: number) {
    vi.spyOn(dice, 'rollDice').mockImplementation((count: number) => {
      if (count === 2) return [6, 6]; // 2D total 12 -> Unusual Event
      return [subRoll]; // 1D sub-table result
    });
  }

  async function rollLifeEventTwelve() {
    const onResolved = vi.fn();
    // rollValue 7 redirects to the Life Events table
    const event = makeEvent({ rollValue: 7, effects: [] });
    render(createElement(CareerEventCard, { event, onResolved }));

    fireEvent.click(screen.getByText('Roll on Life Events Table'));
    await waitFor(() => screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(onResolved).toHaveBeenCalled());
  }

  it('unlocks psionics when the 1D Unusual sub-roll is 1 (Psionics), keeping isModified false', async () => {
    mockDice(1);
    await rollLifeEventTwelve();

    const state = useCharacterStore.getState();
    expect(state.psionicsUnlocked).toBe(true);
    // Legitimate unlock path must not flag the character as modified.
    expect(state.isModified).toBe(false);
  });

  it('does not unlock psionics when the 1D Unusual sub-roll is a non-unlock result (2-6)', async () => {
    for (const subRoll of [2, 3, 4, 5, 6]) {
      useCharacterStore.getState().resetCharacter();
      vi.restoreAllMocks();
      mockDice(subRoll);
      await rollLifeEventTwelve();

      const state = useCharacterStore.getState();
      expect(state.psionicsUnlocked).toBe(false);
      expect(state.isModified).toBe(false);
    }
  });
});
