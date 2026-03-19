import type { BackgroundSkill } from '../../types/skills';
import { DropSlot } from '../shared/DropSlot';

interface SkillSlotProps {
  index: number;
  skill: BackgroundSkill | null;
}

export function SkillSlot({ index, skill }: SkillSlotProps) {
  const slotNumber = index + 1;

  return (
    <DropSlot
      id={`slot-${index}`}
      label={`Slot ${slotNumber}`}
      isEmpty={skill === null}
    >
      {skill ? (
        <span className="text-sm font-mono text-scanner-blue">{skill.name}</span>
      ) : (
        <span className="text-xs text-gray-500 italic">Drop skill here</span>
      )}
    </DropSlot>
  );
}
