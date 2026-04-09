import type { BackgroundSkill } from '../../types/skills';
import { DropSlot } from '../shared/DropSlot';

interface SkillSlotProps {
  index: number;
  skill: BackgroundSkill | null;
  onRemove?: () => void;
}

export function SkillSlot({ index, skill, onRemove }: SkillSlotProps) {
  const slotNumber = index + 1;

  return (
    <DropSlot
      id={`slot-${index}`}
      label={`Slot ${slotNumber}`}
      isEmpty={skill === null}
      onRemove={onRemove}
    >
      {skill ? (
        <span className="text-sm font-mono text-scanner-blue">{skill.name}</span>
      ) : (
        <span className="text-xs text-gray-500 italic">Drop skill here</span>
      )}
    </DropSlot>
  );
}
