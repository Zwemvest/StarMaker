import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import type { RollLogEntry } from '../../src/types/dice';

// Mock useLoggedRoll with a controllable fake
const mockLoggedRoll2D = vi.fn();
vi.mock('../../src/hooks/useLoggedRoll', () => ({
  useLoggedRoll: () => ({
    loggedRoll2D: mockLoggedRoll2D,
  }),
}));

import { DiceRollButton } from '../../src/components/shared/DiceRollButton';

function fakeEntry(dice: number[], context = 'test.context'): RollLogEntry {
  return {
    id: 'test-id',
    context,
    notation: '2D',
    results: dice,
    total: dice.reduce((a, b) => a + b, 0),
    modifier: 0,
    target: null,
    success: null,
    overridden: false,
  };
}

describe('DiceRollButton', () => {
  beforeEach(() => {
    mockLoggedRoll2D.mockReset();
  });

  it('renders the label text', () => {
    render(
      createElement(DiceRollButton, {
        label: 'Roll for Qualification',
        context: 'career.qualification',
        target: 8,
        dm: 0,
        onRolled: vi.fn(),
      }),
    );
    expect(screen.getByText('Roll for Qualification')).toBeTruthy();
  });

  it('shows an odds pill with the calculated probability', () => {
    render(
      createElement(DiceRollButton, {
        label: 'Roll',
        context: 'test',
        target: 8,
        dm: 0,
        onRolled: vi.fn(),
      }),
    );
    // probability2DAtLeast(8, 0) = 42
    expect(screen.getByText('42%')).toBeTruthy();
  });

  it('applies green color class when odds >= 50', () => {
    render(
      createElement(DiceRollButton, {
        label: 'Roll',
        context: 'test',
        target: 6,
        dm: 0,
        onRolled: vi.fn(),
      }),
    );
    // probability2DAtLeast(6, 0) = 72
    const pill = screen.getByText('72%');
    expect(pill.className).toContain('text-green-400');
  });

  it('applies amber color class when odds < 50', () => {
    render(
      createElement(DiceRollButton, {
        label: 'Roll',
        context: 'test',
        target: 10,
        dm: 0,
        onRolled: vi.fn(),
      }),
    );
    // probability2DAtLeast(10, 0) = 17
    const pill = screen.getByText(/%$/);
    expect(pill.className).toContain('text-amber-400');
  });

  it('calls loggedRoll2D and invokes onRolled with entry and diceTotal on click', async () => {
    mockLoggedRoll2D.mockResolvedValue(fakeEntry([4, 5]));
    const onRolled = vi.fn();
    render(
      createElement(DiceRollButton, {
        label: 'Roll',
        context: 'career.qualification',
        target: 8,
        dm: 1,
        onRolled,
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: /Roll/ }));

    await waitFor(() => {
      expect(mockLoggedRoll2D).toHaveBeenCalledWith('career.qualification', 1, 8);
      expect(onRolled).toHaveBeenCalledTimes(1);
    });
    const call = onRolled.mock.calls[0];
    expect(call[0].results).toEqual([4, 5]);
    expect(call[1]).toBe(9); // dice total
  });

  it('shows "Rolling..." and disables button while rolling', async () => {
    let resolveRoll: (entry: RollLogEntry) => void = () => {};
    mockLoggedRoll2D.mockImplementation(
      () =>
        new Promise<RollLogEntry>((resolve) => {
          resolveRoll = resolve;
        }),
    );
    render(
      createElement(DiceRollButton, {
        label: 'Roll',
        context: 'test',
        target: 8,
        dm: 0,
        onRolled: vi.fn(),
      }),
    );
    const btn = screen.getByRole('button', { name: /Roll/ });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText('Rolling...')).toBeTruthy();
    });
    expect((btn as HTMLButtonElement).disabled).toBe(true);

    // Clean up the pending promise
    resolveRoll(fakeEntry([3, 3]));
    await waitFor(() => {
      expect((btn as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it('respects disabled prop', () => {
    render(
      createElement(DiceRollButton, {
        label: 'Roll',
        context: 'test',
        target: 8,
        dm: 0,
        onRolled: vi.fn(),
        disabled: true,
      }),
    );
    const btn = screen.getByRole('button', { name: /Roll/ });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows DM breakdown in title when showBreakdown is true (default)', () => {
    render(
      createElement(DiceRollButton, {
        label: 'Roll',
        context: 'test',
        target: 8,
        dm: 2,
        onRolled: vi.fn(),
      }),
    );
    const btn = screen.getByRole('button', { name: /Roll/ });
    expect(btn.getAttribute('title')).toContain('8');
    expect(btn.getAttribute('title')).toContain('+2');
  });

  it('uses negative DM formatting in breakdown', () => {
    render(
      createElement(DiceRollButton, {
        label: 'Roll',
        context: 'test',
        target: 8,
        dm: -1,
        onRolled: vi.fn(),
      }),
    );
    const btn = screen.getByRole('button', { name: /Roll/ });
    expect(btn.getAttribute('title')).toContain('-1');
  });
});
