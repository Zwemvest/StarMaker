import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { SkillSelectButton } from '../../src/components/shared/SkillSelectButton';
import type { Skill } from '../../src/types/character';

describe('SkillSelectButton', () => {
  it("renders without annotation for 'new' skills", () => {
    const existing: Skill[] = [];
    render(
      createElement(SkillSelectButton, {
        name: 'Admin',
        level: 0,
        existingSkills: existing,
        onSelect: vi.fn(),
      }),
    );
    expect(screen.getByText(/Admin 0/)).toBeTruthy();
    expect(screen.queryByText(/no benefit/)).toBeNull();
    expect(screen.queryByText(/upgrade/)).toBeNull();
  });

  it("shows '(upgrade from N)' annotation when level would upgrade", () => {
    const existing: Skill[] = [{ name: 'Admin', level: 0 }];
    render(
      createElement(SkillSelectButton, {
        name: 'Admin',
        level: 1,
        existingSkills: existing,
        onSelect: vi.fn(),
      }),
    );
    expect(screen.getByText(/upgrade from 0/)).toBeTruthy();
  });

  it("does NOT add opacity-50 class for 'upgrade' benefits", () => {
    const existing: Skill[] = [{ name: 'Admin', level: 0 }];
    render(
      createElement(SkillSelectButton, {
        name: 'Admin',
        level: 1,
        existingSkills: existing,
        onSelect: vi.fn(),
      }),
    );
    const btn = screen.getByRole('button');
    expect(btn.className).not.toContain('opacity-50');
  });

  it("shows '(no benefit)' annotation when existing level is equal", () => {
    const existing: Skill[] = [{ name: 'Admin', level: 1 }];
    render(
      createElement(SkillSelectButton, {
        name: 'Admin',
        level: 1,
        existingSkills: existing,
        onSelect: vi.fn(),
      }),
    );
    expect(screen.getByText(/no benefit/)).toBeTruthy();
  });

  it("applies opacity-50 class but is NOT disabled when 'no benefit'", () => {
    const existing: Skill[] = [{ name: 'Admin', level: 1 }];
    render(
      createElement(SkillSelectButton, {
        name: 'Admin',
        level: 1,
        existingSkills: existing,
        onSelect: vi.fn(),
      }),
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('opacity-50');
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });

  it("shows '(no benefit)' when existing level is higher", () => {
    const existing: Skill[] = [{ name: 'Admin', level: 2 }];
    render(
      createElement(SkillSelectButton, {
        name: 'Admin',
        level: 1,
        existingSkills: existing,
        onSelect: vi.fn(),
      }),
    );
    expect(screen.getByText(/no benefit/)).toBeTruthy();
  });

  it("fires onSelect on click even when 'no benefit'", () => {
    const existing: Skill[] = [{ name: 'Admin', level: 1 }];
    const onSelect = vi.fn();
    render(
      createElement(SkillSelectButton, {
        name: 'Admin',
        level: 1,
        existingSkills: existing,
        onSelect,
      }),
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('fires onSelect on click for new skills', () => {
    const onSelect = vi.fn();
    render(
      createElement(SkillSelectButton, {
        name: 'Admin',
        level: 0,
        existingSkills: [],
        onSelect,
      }),
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('uses custom label override when provided', () => {
    render(
      createElement(SkillSelectButton, {
        name: 'Admin',
        level: 0,
        existingSkills: [],
        onSelect: vi.fn(),
        label: 'Custom Display',
      }),
    );
    expect(screen.getByText(/Custom Display/)).toBeTruthy();
  });

  it('respects disabled prop', () => {
    render(
      createElement(SkillSelectButton, {
        name: 'Admin',
        level: 0,
        existingSkills: [],
        onSelect: vi.fn(),
        disabled: true,
      }),
    );
    const btn = screen.getByRole('button');
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});
