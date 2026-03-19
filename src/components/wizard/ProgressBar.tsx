interface Step {
  id: string;
  label: string;
}

interface ProgressBarProps {
  steps: Step[];
  currentStepIndex: number;
  completedSteps: number[];
  onStepClick?: (index: number) => void;
}

export function ProgressBar({
  steps,
  currentStepIndex,
  completedSteps,
  onStepClick,
}: ProgressBarProps) {
  return (
    <nav className="w-full bg-terminal-surface border-b border-gray-700 px-6 py-3">
      <ol className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStepIndex;
          const isLocked = !isCompleted && !isCurrent;
          const isClickable = isCompleted && onStepClick;

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step indicator */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                className={`
                  flex flex-col items-center gap-1 group
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {/* Circle */}
                <span
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono
                    transition-all duration-200 border-2
                    ${isCompleted
                      ? 'bg-scanner-blue border-scanner-blue text-terminal-bg'
                      : ''}
                    ${isCurrent
                      ? 'border-scanner-blue text-scanner-blue bg-transparent animate-pulse'
                      : ''}
                    ${isLocked
                      ? 'border-gray-600 text-gray-600 bg-transparent'
                      : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Label */}
                <span
                  className={`
                    text-xs whitespace-nowrap
                    ${isCompleted ? 'text-scanner-blue' : ''}
                    ${isCurrent ? 'text-white font-medium' : ''}
                    ${isLocked ? 'text-gray-500' : ''}
                  `}
                >
                  {step.label}
                </span>
              </button>

              {/* Connecting rail */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-3 mt-[-1rem]
                    ${completedSteps.includes(index) ? 'bg-scanner-blue' : 'bg-gray-700'}
                  `}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
