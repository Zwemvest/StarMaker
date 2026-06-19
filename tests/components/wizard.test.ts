import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createElement } from 'react';
import { WizardShell } from '../../src/components/wizard/WizardShell';
import { CompleteSummary } from '../../src/components/wizard/CompleteSummary';
import { useCharacterStore } from '../../src/stores/character';

describe('WizardShell — complete phase routing', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('renders CompleteSummary when creationPhase is "complete"', () => {
    useCharacterStore.getState().setCreationPhase('complete');
    render(createElement(WizardShell));

    expect(screen.getByText('Character Complete')).toBeTruthy();
  });

  it('never shows the diagnostic "Career state: unknown" fallback in complete phase', () => {
    useCharacterStore.getState().setCreationPhase('complete');
    render(createElement(WizardShell));

    expect(screen.queryByText(/Career state:/i)).toBeNull();
    expect(screen.queryByText(/unknown/i)).toBeNull();
  });

  it('renders the characteristics step for a fresh character (regression)', () => {
    render(createElement(WizardShell));

    // Fresh store → characteristics.rolling, not the complete summary
    expect(screen.queryByText('Character Complete')).toBeNull();
  });

  it('switches to CompleteSummary when creationPhase flips to complete mid-session', () => {
    // WizardShell's own actor starts at characteristics and never receives the
    // career sub-machine's MUSTERING_COMPLETE — only the store flag flips. The
    // shell must still show the terminal view immediately (no refresh required).
    render(createElement(WizardShell));
    expect(screen.queryByText('Character Complete')).toBeNull();

    act(() => {
      useCharacterStore.getState().setCreationPhase('complete');
    });

    expect(screen.getByText('Character Complete')).toBeTruthy();
  });
});

describe('CompleteSummary', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('shows accumulated character data', () => {
    const store = useCharacterStore.getState();
    store.setCharacteristic('SOC', 12);
    store.addSkill('Gun Combat', 2);
    store.addCareerTerm({
      career: 'army',
      assignment: 'Infantry',
      term: 1,
      rank: 1,
      skills: [],
      events: [],
    });
    store.addCredits(5000);

    render(createElement(CompleteSummary));

    expect(screen.getByText('Character Complete')).toBeTruthy();
    expect(screen.getByText(/Gun Combat/)).toBeTruthy();
    expect(screen.getByText(/Infantry/)).toBeTruthy();
    // Credits formatting is locale-dependent (comma grouping varies by ICU build)
    expect(screen.getByText(/Cr5[,.]?000/)).toBeTruthy();
  });
});
