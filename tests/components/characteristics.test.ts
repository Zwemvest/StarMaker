import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { CharacteristicsStep } from '../../src/components/characteristics/CharacteristicsStep';
import { useCharacterStore } from '../../src/stores/character';
import type { RollLogEntry } from '../../src/types/dice';

// Mock useLoggedRoll to return predictable values
let rollCallCount = 0;
const MOCK_ROLLS: Array<{ dice: number[]; total: number }> = [
  { dice: [4, 3], total: 7 },
  { dice: [5, 4], total: 9 },
  { dice: [2, 6], total: 8 },
  { dice: [3, 3], total: 6 },
  { dice: [6, 5], total: 11 },
  { dice: [1, 4], total: 5 },
];

vi.mock('../../src/hooks/useLoggedRoll', () => ({
  useLoggedRoll: () => ({
    loggedRoll2D: vi.fn().mockImplementation(async (context: string) => {
      const idx = rollCallCount % MOCK_ROLLS.length;
      rollCallCount++;
      const roll = MOCK_ROLLS[idx];
      return {
        id: `roll-${idx}-${Date.now()}`,
        context,
        notation: '2D',
        results: roll.dice,
        total: roll.total,
        modifier: 0,
        target: null,
        success: null,
        overridden: false,
      } satisfies RollLogEntry;
    }),
  }),
}));

describe('CharacteristicsStep', () => {
  beforeEach(() => {
    rollCallCount = 0;
    useCharacterStore.getState().resetCharacter();
  });

  it('renders Roll All button in rolling state', () => {
    const send = vi.fn();
    render(createElement(CharacteristicsStep, { subState: 'rolling', send }));

    expect(screen.getByTestId('roll-all-btn')).toBeTruthy();
    expect(screen.getByText('Roll All')).toBeTruthy();
  });

  it('clicking Roll All generates 6 pool items and sends ROLL_ALL event', async () => {
    const send = vi.fn();
    render(createElement(CharacteristicsStep, { subState: 'rolling', send }));

    const rollBtn = screen.getByTestId('roll-all-btn');
    fireEvent.click(rollBtn);

    await waitFor(() => {
      expect(send).toHaveBeenCalledWith({ type: 'ROLL_ALL' });
    });

    // loggedRoll2D should have been called 6 times
    expect(rollCallCount).toBe(6);
  });

  it('renders stat slots with correct labels in assigning state', () => {
    const send = vi.fn();
    render(createElement(CharacteristicsStep, { subState: 'assigning', send }));

    expect(screen.getByText('STR')).toBeTruthy();
    expect(screen.getByText('DEX')).toBeTruthy();
    expect(screen.getByText('END')).toBeTruthy();
    expect(screen.getByText('INT')).toBeTruthy();
    expect(screen.getByText('EDU')).toBeTruthy();
    expect(screen.getByText('SOC')).toBeTruthy();
  });

  it('renders Physical and Mental group headers in assigning state', () => {
    const send = vi.fn();
    render(createElement(CharacteristicsStep, { subState: 'assigning', send }));

    expect(screen.getByText('Physical')).toBeTruthy();
    expect(screen.getByText('Mental')).toBeTruthy();
  });

  it('renders review state with Continue button', () => {
    const send = vi.fn();
    render(createElement(CharacteristicsStep, { subState: 'review', send }));

    expect(screen.getByText('Review Characteristics')).toBeTruthy();
    expect(screen.getByText('Continue')).toBeTruthy();
  });

  it('clicking Continue in review state sends CONFIRM event', () => {
    const send = vi.fn();
    render(createElement(CharacteristicsStep, { subState: 'review', send }));

    fireEvent.click(screen.getByText('Continue'));
    expect(send).toHaveBeenCalledWith({ type: 'CONFIRM' });
  });

  it('renders null for unknown sub-state', () => {
    const send = vi.fn();
    const { container } = render(
      createElement(CharacteristicsStep, { subState: 'unknown', send }),
    );
    expect(container.innerHTML).toBe('');
  });
});
