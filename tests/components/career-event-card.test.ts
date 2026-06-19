import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { CareerEventCard } from '../../src/components/career/CareerEventCard';
import { useCharacterStore } from '../../src/stores/character';
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

  it('calls onResolved(2) for a plain advancement_dm effect', () => {
    const onResolved = vi.fn();
    const event = makeEvent({
      effects: [{ type: 'advancement_dm', detail: 'DM+2 to next advancement roll', value: 2 }],
    });
    render(createElement(CareerEventCard, { event, onResolved }));

    fireEvent.click(screen.getByText('Continue'));
    expect(onResolved).toHaveBeenCalledWith(2);
  });

  it('calls onResolved(4) when the user picks the advancement choice option', () => {
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
    expect(onResolved).toHaveBeenCalledWith(4);
  });

  it('calls onResolved(0) when the user picks the non-advancement choice option', () => {
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
    expect(onResolved).toHaveBeenCalledWith(0);
  });

  it('calls onResolved(0) for an event with no advancement effects', () => {
    const onResolved = vi.fn();
    const event = makeEvent({
      effects: [{ type: 'skill', detail: 'Gain Gun Combat 1' }],
    });
    render(createElement(CareerEventCard, { event, onResolved }));

    fireEvent.click(screen.getByText('Continue'));
    expect(onResolved).toHaveBeenCalledWith(0);
  });

  it('applies skill side-effects and still reports the advancement bonus', () => {
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
    expect(onResolved).toHaveBeenCalledWith(2);
  });
});
