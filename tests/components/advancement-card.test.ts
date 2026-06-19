import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import type { RollLogEntry } from '../../src/types/dice';

const mockLoggedRoll2D = vi.fn();
vi.mock('../../src/hooks/useLoggedRoll', () => ({
  useLoggedRoll: () => ({ loggedRoll2D: mockLoggedRoll2D }),
}));

import { AdvancementCard } from '../../src/components/career/AdvancementCard';
import { useCharacterStore } from '../../src/stores/character';
import { getCareer } from '../../src/data/careers/index';

function fakeEntry(dice: number[]): RollLogEntry {
  return {
    id: 'x',
    context: 'career.advancement',
    notation: '2D',
    results: dice,
    total: dice.reduce((a, b) => a + b, 0),
    modifier: 0,
    target: null,
    success: null,
    overridden: false,
  };
}

const army = getCareer('army');
const infantry = army.assignments[0];

describe('AdvancementCard — event DM (CRER-11)', () => {
  beforeEach(() => {
    mockLoggedRoll2D.mockReset();
    useCharacterStore.getState().resetCharacter();
  });

  it('shows an Event DM column with the bonus when bonusDM > 0', () => {
    render(
      createElement(AdvancementCard, {
        career: army,
        advancementTarget: infantry.advancement,
        characteristicValue: 9, // +1
        termsServed: 1,
        currentRank: 0,
        isOfficer: false,
        bonusDM: 2,
        onResult: vi.fn(),
      }),
    );
    expect(screen.getByText('Event DM')).toBeTruthy();
    expect(screen.getByText('+2')).toBeTruthy();
  });

  it('omits the Event DM column when bonusDM is 0', () => {
    render(
      createElement(AdvancementCard, {
        career: army,
        advancementTarget: infantry.advancement,
        characteristicValue: 9,
        termsServed: 1,
        currentRank: 0,
        isOfficer: false,
        bonusDM: 0,
        onResult: vi.fn(),
      }),
    );
    expect(screen.queryByText('Event DM')).toBeNull();
  });

  it('applies the event DM to the advancement total', async () => {
    // +1 charDM, +2 event = effectiveDM 3, dice 6 → total 9
    mockLoggedRoll2D.mockResolvedValue(fakeEntry([3, 3]));
    render(
      createElement(AdvancementCard, {
        career: army,
        advancementTarget: infantry.advancement,
        characteristicValue: 9,
        termsServed: 1,
        currentRank: 0,
        isOfficer: false,
        bonusDM: 2,
        onResult: vi.fn(),
      }),
    );

    fireEvent.click(screen.getByText('Roll for Advancement'));
    await waitFor(() =>
      expect(mockLoggedRoll2D).toHaveBeenCalledWith('Advancement Roll', 3, infantry.advancement.target),
    );
    // Rolled 6 + (+3) = 9 shown
    expect(screen.getByText(/Rolled 6 \+ \(\+3\) = 9/)).toBeTruthy();
  });
});
