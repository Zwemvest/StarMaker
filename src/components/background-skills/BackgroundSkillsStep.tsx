import { useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { BACKGROUND_SKILLS } from '../../data/background-skills';
import { characteristicModifier } from '../../types/common';
import { useCharacterStore } from '../../stores/character';
import { useDragAssign } from '../../hooks/useDragAssign';
import { SkillPool } from './SkillPool';
import { SkillSlot } from './SkillSlot';
import { Button } from '../ui/Button';
import type { BackgroundSkill } from '../../types/skills';

interface BackgroundSkillsStepProps {
  onContinue: () => void;
}

export function BackgroundSkillsStep({ onContinue }: BackgroundSkillsStepProps) {
  const characteristics = useCharacterStore((s) => s.characteristics);
  const addSkill = useCharacterStore((s) => s.addSkill);

  const slotCount = Math.max(0, characteristicModifier(characteristics.EDU) + 3);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const {
    assignments,
    isComplete,
    handleDragEnd,
    unassignedPool: _unassignedPool,
  } = useDragAssign<BackgroundSkill>({
    pool: BACKGROUND_SKILLS,
    slotCount,
    getId: (s) => s.name,
  });

  const assignedNames = useMemo(
    () => new Set(assignments.filter((a): a is BackgroundSkill => a !== null).map((a) => a.name)),
    [assignments],
  );

  // Find the currently dragged skill for the overlay
  // We track this via the active drag item from dnd-kit

  const handleContinue = useCallback(() => {
    // Commit all assigned skills to store at level 0
    for (const skill of assignments) {
      if (skill) {
        addSkill(skill.name, 0);
      }
    }
    onContinue();
  }, [assignments, addSkill, onContinue]);

  // Zero slots edge case
  if (slotCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6">
        <h2 className="text-2xl font-sans text-white">Background Skills</h2>
        <p className="text-gray-400 text-sm">
          No background skills available (EDU too low)
        </p>
        <Button variant="primary" onClick={onContinue}>
          Continue
        </Button>
      </div>
    );
  }

  const canContinue = isComplete;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-sans text-white mb-1">Background Skills</h2>
        <p className="text-sm text-gray-400">
          Select {slotCount} background {slotCount === 1 ? 'skill' : 'skills'} from
          your adolescence. Each will be granted at Level 0.
        </p>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Skill Pool */}
          <div className="flex-1">
            <h3 className="text-sm font-sans text-gray-300 mb-3 uppercase tracking-wider">
              Available Skills
            </h3>
            <SkillPool
              skills={BACKGROUND_SKILLS}
              assignedNames={assignedNames}
              disabled={isComplete}
            />
          </div>

          {/* Skill Slots */}
          <div className="w-full lg:w-72">
            <h3 className="text-sm font-sans text-gray-300 mb-3 uppercase tracking-wider">
              Selected ({assignedNames.size}/{slotCount})
            </h3>
            <div className="grid gap-2">
              {assignments.map((skill, i) => (
                <SkillSlot key={i} index={i} skill={skill} />
              ))}
            </div>
          </div>
        </div>

        <DragOverlay>
          {/* The overlay renders the currently-dragged element;
              dnd-kit handles this via the active element snapshot */}
        </DragOverlay>
      </DndContext>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!canContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
