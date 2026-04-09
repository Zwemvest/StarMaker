import { classifySkillBenefit } from '../../engine/skill-benefit';
import { Button } from '../ui/Button';
import type { Skill } from '../../types/character';

interface SkillSelectButtonProps {
  /** Skill name, e.g. "Admin" */
  name: string;
  /** Skill level offered, e.g. 1 */
  level: number;
  /** Current character skills — used to detect upgrades / no-benefit */
  existingSkills: Skill[];
  /** Click handler — always called, even when there's no benefit */
  onSelect: () => void;
  /** Disable the button entirely */
  disabled?: boolean;
  /** Override the default "{name} {level}" display label */
  label?: string;
}

/**
 * Reusable skill-select button primitive.
 *
 * Uses classifySkillBenefit to determine whether picking this skill would
 * be new, an upgrade, or a no-op, and annotates the UI accordingly:
 *
 *   - 'new':     no annotation, normal styling
 *   - 'upgrade': "(upgrade from N)" annotation, normal styling
 *   - 'none':    "(no benefit)" annotation, opacity-50 (but still clickable —
 *                the user is informed, not blocked)
 */
export function SkillSelectButton({
  name,
  level,
  existingSkills,
  onSelect,
  disabled = false,
  label,
}: SkillSelectButtonProps) {
  const benefit = classifySkillBenefit(existingSkills, name, level);
  const display = label ?? `${name} ${level}`;
  const currentLevel = existingSkills.find((s) => s.name === name)?.level ?? 0;
  const annotation =
    benefit === 'none'
      ? '(no benefit)'
      : benefit === 'upgrade'
        ? `(upgrade from ${currentLevel})`
        : null;
  const opacityClass = benefit === 'none' ? 'opacity-50' : '';

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onSelect}
      disabled={disabled}
      className={opacityClass}
    >
      {display}
      {annotation && (
        <span className="text-xs text-gray-500 ml-1">{annotation}</span>
      )}
    </Button>
  );
}
