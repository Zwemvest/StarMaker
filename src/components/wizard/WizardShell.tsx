import { useEffect, useRef, useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { StepContainer } from './StepContainer';
import { HashBar } from './HashBar';
import { CharacterPanel } from '../character-panel/CharacterPanel';
import { CharacteristicsStep } from '../characteristics/CharacteristicsStep';
import { BackgroundSkillsStep } from '../background-skills/BackgroundSkillsStep';
import { EducationStep } from '../education/EducationStep';
import { CareerStep } from '../career/CareerStep';
import { CompleteSummary } from './CompleteSummary';
import { useCreationMachine } from '../../hooks/useCreationMachine';
import { useCharacterStore } from '../../stores/character';
import type { CreationPhase } from '../../machines/creation';

const STEPS = [
  { id: 'characteristics', label: 'Characteristics' },
  { id: 'backgroundSkills', label: 'Background Skills' },
  { id: 'education', label: 'Education' },
  { id: 'career', label: 'Career' },
  { id: 'musteringOut', label: 'Muster Out' },
  { id: 'psionics', label: 'Psionics' },
  { id: 'equipment', label: 'Equipment' },
] as const;

const PHASE_TO_INDEX: Record<CreationPhase, number> = {
  idle: 0,
  characteristics: 0,
  backgroundSkills: 1,
  education: 2,
  career: 3,
  musteringOut: 4,
  psionics: 5,
  equipment: 6,
  sheet: 6,
  complete: 6,
};

/**
 * Three-zone wizard layout:
 * - Zone 1 (top): ProgressBar
 * - Zone 2 (middle): StepContainer (flex-1) + CharacterPanel (w-80 aside)
 * - Zone 3 (bottom): HashBar (fixed)
 */
export function WizardShell() {
  const { currentPhase, subState, send, state, isRestored } = useCreationMachine();
  // CareerStep runs its own machine actor and owns the entire career + post-career
  // flow (muster-out → psionics → equipment → sheet). WizardShell's own actor never
  // sees those transitions (separate actor) — it sits at 'career'. So we consult the
  // persisted creationPhase to know when the user has mustered out ('postCareer') and
  // when they are truly finished ('complete'). CareerStep keeps rendering the
  // post-career steps; WizardShell only swaps to the terminal summary at 'complete'.
  const storeCreationPhase = useCharacterStore((s) => s.creationPhase);
  const isComplete = currentPhase === 'complete' || storeCreationPhase === 'complete';
  const isPostCareer = !isComplete && storeCreationPhase === 'postCareer';
  // Keep CareerStep mounted through the post-career flow; it owns the actor that
  // drives psionics/equipment/sheet.
  const inCareerFlow = currentPhase === 'career' || isPostCareer;
  const effectivePhaseIndex = isComplete
    ? PHASE_TO_INDEX.complete
    : isPostCareer
      ? PHASE_TO_INDEX.psionics
      : PHASE_TO_INDEX[currentPhase];
  const currentStepIndex = effectivePhaseIndex;
  const prevIndexRef = useRef(currentStepIndex);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // Suppress slide animation on first render when restoring from persisted state
  const suppressAnimationRef = useRef(isRestored);
  useEffect(() => {
    // After first render, allow animations again
    if (suppressAnimationRef.current) {
      suppressAnimationRef.current = false;
    }
  }, []);

  // Track direction for slide animation
  useEffect(() => {
    if (currentStepIndex !== prevIndexRef.current) {
      setDirection(currentStepIndex > prevIndexRef.current ? 'right' : 'left');
      prevIndexRef.current = currentStepIndex;
    }
  }, [currentStepIndex]);

  // Calculate completed steps (all before current)
  const completedSteps = Array.from(
    { length: currentStepIndex },
    (_, i) => i,
  );

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col pb-10">
      {/* Zone 1: Progress Bar */}
      <ProgressBar
        steps={[...STEPS]}
        currentStepIndex={currentStepIndex}
        completedSteps={completedSteps}
      />

      {/* Zone 2: Content + Character Panel */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto">
          <StepContainer
            direction={direction}
            stepKey={STEPS[currentStepIndex].id}
            suppressAnimation={suppressAnimationRef.current}
          >
            {isComplete ? (
              <CompleteSummary />
            ) : inCareerFlow ? (
              <CareerStep />
            ) : currentPhase === 'characteristics' ? (
              <CharacteristicsStep subState={subState} send={send} />
            ) : currentPhase === 'backgroundSkills' ? (
              <BackgroundSkillsStep subState={subState} send={send} />
            ) : (
              <EducationStep
                subState={subState}
                send={send}
                educationTermsUsed={state.context.educationTermsUsed}
              />
            )}
          </StepContainer>
        </main>

        <aside className="w-80 border-l border-gray-700 p-4 overflow-y-auto bg-terminal-surface/30">
          <CharacterPanel />
        </aside>
      </div>

      {/* Zone 3: Hash Bar (fixed at bottom) */}
      <HashBar />
    </div>
  );
}
