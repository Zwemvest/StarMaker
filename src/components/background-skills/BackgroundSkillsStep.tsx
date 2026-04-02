import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { BACKGROUND_SKILLS } from '../../data/background-skills';
import { characteristicModifier } from '../../types/common';
import { useCharacterStore } from '../../stores/character';
import { useDragAssign } from '../../hooks/useDragAssign';
import { SkillPool } from './SkillPool';
import { SkillSlot } from './SkillSlot';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { BackgroundSkill } from '../../types/skills';
import type { CreationEvent } from '../../machines/creation';

interface BackgroundSkillsStepProps {
  subState: string | undefined;
  send: (event: CreationEvent) => void;
}

export function BackgroundSkillsStep({ subState, send }: BackgroundSkillsStepProps) {
  const characteristics = useCharacterStore((s) => s.characteristics);
  const addSkill = useCharacterStore((s) => s.addSkill);

  const slotCount = Math.max(0, characteristicModifier(characteristics.EDU) + 3);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const [activeDragItem, setActiveDragItem] = useState<BackgroundSkill | null>(null);

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const dragId = String(event.active.id);
    const skill = BACKGROUND_SKILLS.find((s) => s.name === dragId) ?? null;
    setActiveDragItem(skill);
  }, []);

  const handleDragEndWrapped = useCallback((event: DragEndEvent) => {
    handleDragEnd(event);
    setActiveDragItem(null);
  }, [handleDragEnd]);

  const assignedNames = useMemo(
    () => new Set(assignments.filter((a): a is BackgroundSkill => a !== null).map((a) => a.name)),
    [assignments],
  );

  const assignedSkills = useMemo(
    () => assignments.filter((a): a is BackgroundSkill => a !== null),
    [assignments],
  );

  // When all slots filled, transition to review sub-state
  const handleSkillsSelected = useCallback(() => {
    send({ type: 'SKILLS_SELECTED' });
  }, [send]);

  // Confirm: commit skills to store and advance machine
  const handleConfirm = useCallback(() => {
    for (const skill of assignments) {
      if (skill) {
        addSkill(skill.name, 0);
      }
    }
    send({ type: 'CONFIRM' });
  }, [assignments, addSkill, send]);

  // Zero slots edge case
  if (slotCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6">
        <h2 className="text-2xl font-sans text-white">Background Skills</h2>
        <p className="text-gray-400 text-sm">
          No background skills available (EDU too low)
        </p>
        <Button variant="primary" onClick={() => send({ type: 'SKILLS_SELECTED' })}>
          Continue
        </Button>
      </div>
    );
  }

  // Review sub-state: confirmation dialog with irreversibility warning
  if (subState === 'review') {
    return (
      <div className="flex flex-col gap-6 max-w-lg mx-auto">
        <h2 className="text-xl font-sans text-white">Confirm Background Skills</h2>

        <Card className="border-l-4 border-l-modified">
          <div className="space-y-2 mb-4">
            {assignedSkills.map((skill) => (
              <div key={skill.name} className="flex justify-between text-sm">
                <span className="text-white font-mono">{skill.name}</span>
                <span className="text-gray-500">Level 0</span>
              </div>
            ))}
          </div>

          <p className="text-modified text-sm leading-relaxed">
            Once you confirm your background skills and proceed to education, you cannot change them later.
          </p>
        </Card>

        <div className="flex justify-center">
          <Button variant="primary" onClick={handleConfirm}>
            Confirm Skills
          </Button>
        </div>
      </div>
    );
  }

  // Selecting sub-state (default): drag-and-drop skill picker
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

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEndWrapped}>
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
          {activeDragItem ? (
            <div className="px-3 py-1.5 rounded border-l-2 text-sm font-mono bg-scanner-blue/20 text-scanner-blue border-l-scanner-blue shadow-lg">
              {activeDragItem.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSkillsSelected}
          disabled={!canContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
