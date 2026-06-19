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

  it('switches to CompleteSummary only when creationPhase flips to complete (after the sheet)', () => {
    // WizardShell's own actor starts at characteristics and never receives the
    // career sub-machine's transitions — only the store flag flips. The shell
    // must still show the terminal view immediately at true completion.
    render(createElement(WizardShell));
    expect(screen.queryByText('Character Complete')).toBeNull();

    act(() => {
      useCharacterStore.getState().setCreationPhase('complete');
    });

    expect(screen.getByText('Character Complete')).toBeTruthy();
  });
});

describe('WizardShell — post-career flow reachability (C-1 regression)', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('routes muster-out into the Psionics step instead of short-circuiting to "Character Complete"', () => {
    // Muster-out persists creationPhase = 'postCareer' (NOT 'complete'). The shell
    // must restore/mount the post-career flow (psionics → equipment → sheet) and
    // must NOT jump straight to the terminal summary.
    render(createElement(WizardShell));
    expect(screen.queryByText('Character Complete')).toBeNull();

    act(() => {
      useCharacterStore.getState().setCreationPhase('postCareer');
    });

    // The user reaches Psionics, not the completion summary.
    expect(screen.getByText('Psionic Testing')).toBeTruthy();
    expect(screen.queryByText('Character Complete')).toBeNull();
  });

  it('restores into the post-career flow on a page reload mid-post-career (does not skip it)', () => {
    // Simulate a reload: the persisted store already says 'postCareer' before the
    // shell mounts. deriveReplayEvents must fast-forward the machine into the
    // post-career flow — landing on Psionics, not idle and not the summary.
    useCharacterStore.getState().setCreationPhase('postCareer');

    render(createElement(WizardShell));

    expect(screen.getByText('Psionic Testing')).toBeTruthy();
    expect(screen.queryByText('Character Complete')).toBeNull();
  });

  it('restores straight to the terminal summary on a reload of a finished character', () => {
    // creationPhase === 'complete' before mount → CompleteSummary, no post-career steps.
    useCharacterStore.getState().setCreationPhase('complete');

    render(createElement(WizardShell));

    expect(screen.getByText('Character Complete')).toBeTruthy();
    expect(screen.queryByText('Psionic Testing')).toBeNull();
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

  it('no longer shows the obsolete disabled "Post-Career Features (Phase 4)" placeholder', () => {
    render(createElement(CompleteSummary));
    expect(screen.queryByText(/Post-Career Features/i)).toBeNull();
  });
});
