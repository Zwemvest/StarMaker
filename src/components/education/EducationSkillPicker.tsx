import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DragPool } from '../shared/DragPool';
import { DropSlot } from '../shared/DropSlot';
import { useDragAssign } from '../../hooks/useDragAssign';
import { Button } from '../ui/Button';

interface EducationSkillPickerProps {
  /** For university: user picks skills. For academy: auto-granted (display only). */
  type: 'university' | 'academy';
  availableSkills: string[];
  /** Academy branch name, if applicable */
  branchLabel?: string;
  onComplete: (selectedSkills: { name: string; level: number }[]) => void;
}

/**
 * Education skill picker.
 *
 * University: drag-from-pool into 2 slots (Level 0 skill + Level 1 skill).
 * Academy: all service skills auto-granted at Level 0 (display only).
 */
export function EducationSkillPicker({
  type,
  availableSkills,
  branchLabel,
  onComplete,
}: EducationSkillPickerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const pool = availableSkills.map((s) => ({ id: s, name: s }));

  const {
    assignments,
    unassignedPool,
    isComplete,
    handleDragEnd,
  } = useDragAssign({
    pool,
    slotCount: type === 'university' ? 2 : 0,
    getId: (item) => item.id,
  });

  const handleConfirm = () => {
    if (type === 'academy') {
      // Academy: all service skills at level 0
      onComplete(availableSkills.map((s) => ({ name: s, level: 0 })));
    } else {
      // University: first slot = level 0, second slot = level 1
      const skills: { name: string; level: number }[] = [];
      if (assignments[0]) skills.push({ name: assignments[0].name, level: 0 });
      if (assignments[1]) skills.push({ name: assignments[1].name, level: 1 });
      onComplete(skills);
    }
  };

  if (type === 'academy') {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-sans font-medium text-white">
          Basic Training — {branchLabel || 'Military Academy'}
        </h4>
        <p className="text-xs text-gray-400">
          All service skills granted at Level 0 automatically.
        </p>
        <div className="flex flex-wrap gap-2">
          {availableSkills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-scanner-blue/10 border border-scanner-blue/30 rounded text-sm text-scanner-blue font-mono"
            >
              {skill} 0
            </span>
          ))}
        </div>
        <Button variant="primary" size="sm" onClick={handleConfirm}>
          Continue
        </Button>
      </div>
    );
  }

  // University skill picker with drag-and-drop
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-sans font-medium text-white mb-1">
            University Skill Selection
          </h4>
          <p className="text-xs text-gray-400 mb-1">
            Choose one skill at Level 0 and one skill at Level 1.
          </p>
          <p className="text-xs text-legitimate">
            EDU +1 granted automatically
          </p>
        </div>

        {/* Available skills pool */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Available Skills</p>
          <DragPool
            items={unassignedPool}
            renderItem={(item) => (
              <span className="px-2 py-1 bg-terminal-surface border border-gray-600 rounded text-sm text-white font-mono cursor-grab">
                {item.name}
              </span>
            )}
            getId={(item) => item.id}
            disabled={isComplete}
          />
        </div>

        {/* Skill slots */}
        <div className="grid grid-cols-2 gap-3">
          <DropSlot id="slot-0" label="Level 0 Skill" isEmpty={!assignments[0]}>
            {assignments[0] ? (
              <span className="text-sm text-white font-mono">{assignments[0].name}</span>
            ) : (
              <span className="text-xs text-gray-500">Drag a skill here</span>
            )}
          </DropSlot>
          <DropSlot id="slot-1" label="Level 1 Skill" isEmpty={!assignments[1]}>
            {assignments[1] ? (
              <span className="text-sm text-white font-mono">{assignments[1].name}</span>
            ) : (
              <span className="text-xs text-gray-500">Drag a skill here</span>
            )}
          </DropSlot>
        </div>

        <Button variant="primary" size="sm" disabled={!isComplete} onClick={handleConfirm}>
          Continue
        </Button>
      </div>
    </DndContext>
  );
}
