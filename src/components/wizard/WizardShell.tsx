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
import { Button } from '../ui/Button';
import { useCreationMachine } from '../../hooks/useCreationMachine';
import { useCharacterStore } from '../../stores/character';
import type { CreationPhase } from '../../machines/creation';

const STEPS = [
  { id: 'characteristics', label: 'Characteristics' },
  { id: 'backgroundSkills', label: 'Background Skills' },
  { id: 'education', label: 'Education' },
  { id: 'career', label: 'Career' },
  { id: 'musteringOut', label: 'Muster Out' },
] as const;

const PHASE_TO_INDEX: Record<CreationPhase, number> = {
  idle: 0,
  characteristics: 0,
  backgroundSkills: 1,
  education: 2,
  career: 3,
  musteringOut: 4,
  complete: 4,
};

const STEP_EVENTS: Record<number, string> = {
  0: 'CHARACTERISTICS_COMPLETE',
  1: 'BACKGROUND_COMPLETE',
  2: 'EDUCATION_COMPLETE',
  3: 'MUSTER_OUT',
  4: 'MUSTERING_COMPLETE',
};

function StepPlaceholder({ label, onContinue }: { label: string; onContinue?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6">
      <h2 className="text-2xl font-sans text-white">{label}</h2>
      <p className="text-gray-400 text-sm">Step content will be implemented in subsequent plans.</p>
      {onContinue && (
        <Button variant="primary" onClick={onContinue}>
          Continue
        </Button>
      )}
    </div>
  );
}

/**
 * Three-zone wizard layout:
 * - Zone 1 (top): ProgressBar
 * - Zone 2 (middle): StepContainer (flex-1) + CharacterPanel (w-80 aside)
 * - Zone 3 (bottom): HashBar (fixed)
 */
export function WizardShell() {
  const { currentPhase, subState, send, state, isRestored } = useCreationMachine();
  // CareerStep runs its own machine actor; when it finishes muster-out it flips
  // the persisted creationPhase to 'complete'. WizardShell's own actor never sees
  // that transition (separate actor), so consult the store directly to switch to
  // the terminal summary immediately — not just after a refresh.
  const storeCreationPhase = useCharacterStore((s) => s.creationPhase);
  const isComplete = currentPhase === 'complete' || storeCreationPhase === 'complete';
  const currentStepIndex = isComplete ? PHASE_TO_INDEX.complete : PHASE_TO_INDEX[currentPhase];
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

  const handleContinue = () => {
    const event = STEP_EVENTS[currentStepIndex];
    if (event) {
      send({ type: event } as never);
    }
  };

  const stepLabels = [
    'Characteristics Step',
    'Background Skills Step',
    'Education Step',
    'Career Step (Phase 3)',
    'Mustering Out (Phase 3)',
  ];

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
            ) : currentPhase === 'characteristics' ? (
              <CharacteristicsStep subState={subState} send={send} />
            ) : currentPhase === 'backgroundSkills' ? (
              <BackgroundSkillsStep subState={subState} send={send} />
            ) : currentPhase === 'education' ? (
              <EducationStep
                subState={subState}
                send={send}
                educationTermsUsed={state.context.educationTermsUsed}
              />
            ) : currentPhase === 'career' ? (
              <CareerStep />
            ) : (
              <StepPlaceholder
                label={stepLabels[currentStepIndex]}
                onContinue={handleContinue}
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
