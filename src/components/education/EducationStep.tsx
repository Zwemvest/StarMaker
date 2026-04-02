import { useState, useCallback } from 'react';
import { EducationCard } from './EducationCard';
import { EntryRollResult } from './EntryRollResult';
import { EducationSkillPicker } from './EducationSkillPicker';
import { EventCard } from './EventCard';
import { GraduationResult } from './GraduationResult';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { useCharacterStore } from '../../stores/character';
import {
  calculateEntryDM,
  resolveEntryRoll,
  resolveGraduation,
  canAttemptEducation,
  getAvailableUniversitySkills,
  getAcademyBasicTraining,
  applyGraduationBenefits,
} from '../../engine/education';
import {
  EDUCATION_PATHS,
} from '../../data/education';
import { EDUCATION_EVENTS } from '../../data/education-events';
import type { EducationPath, AcademyBranch, EducationType } from '../../types/education';
import type { CreationEvent } from '../../machines/creation';

interface EducationStepProps {
  subState: string | undefined;
  send: (event: CreationEvent) => void;
  educationTermsUsed: number;
}

/**
 * Education step orchestrator.
 *
 * Renders different UI based on the XState nested education sub-state:
 * choosing, universityEntry, academyEntry, entryFailed,
 * universityTerm, academyTerm, graduation, graduated,
 * graduatedHonours, failedGraduation.
 */
export function EducationStep({ subState, send, educationTermsUsed }: EducationStepProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const characteristics = useCharacterStore((s) => s.characteristics);
  const addSkill = useCharacterStore((s) => s.addSkill);
  const updateSkillLevel = useCharacterStore((s) => s.updateSkillLevel);
  const setCharacteristic = useCharacterStore((s) => s.setCharacteristic);

  // Local state for tracking current flow
  const [selectedPath, setSelectedPath] = useState<EducationPath | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<AcademyBranch | undefined>();
  const [entryResult, setEntryResult] = useState<{
    success: boolean;
    total: number;
    target: number;
    dm: number;
  } | null>(null);
  const [diceTotal, setDiceTotal] = useState(0);
  const [eventData, setEventData] = useState<typeof EDUCATION_EVENTS[number] | null>(null);
  const [graduationData, setGraduationData] = useState<{
    result: 'graduated' | 'honours' | 'failed';
    total: number;
  } | null>(null);
  const [skillsEarnedThisTerm, setSkillsEarnedThisTerm] = useState<string[]>([]);
  const [graduationDM, setGraduationDM] = useState(0);
  const [educationType, setEducationType] = useState<EducationType>('university');
  const [entryRolled, setEntryRolled] = useState(false);
  const [eventResolved, setEventResolved] = useState(false);
  const [skillsSelected, setSkillsSelected] = useState(false);

  // Build a "Skip" pseudo-path for display
  const universityPath = EDUCATION_PATHS.find((p) => p.type === 'university')!;

  const handleChooseUniversity = useCallback(async () => {
    setSelectedPath(universityPath);
    setSelectedBranch(undefined);
    setEducationType('university');
    send({ type: 'CHOOSE_UNIVERSITY' });

    // Roll entry
    const dm = calculateEntryDM(educationTermsUsed, characteristics, universityPath);
    const roll = await loggedRoll2D('education.entry.university', dm, universityPath.entryTarget);
    const rollDiceTotal = roll.results.reduce((a, b) => a + b, 0);
    setDiceTotal(rollDiceTotal);
    const result = resolveEntryRoll(rollDiceTotal, dm, universityPath.entryTarget);
    setEntryResult(result);
    setEntryRolled(true);

    if (result.success) {
      send({ type: 'ENTRY_SUCCESS' });
    } else {
      send({ type: 'ENTRY_FAILURE' });
    }
  }, [educationTermsUsed, characteristics, universityPath, loggedRoll2D, send]);

  const handleChooseAcademy = useCallback(async (branch: AcademyBranch) => {
    const academyPath = EDUCATION_PATHS.find(
      (p) => p.type === 'academy' && p.branch === branch,
    )!;
    setSelectedPath(academyPath);
    setSelectedBranch(branch);
    setEducationType('academy');
    send({ type: 'CHOOSE_ACADEMY', branch });

    // Roll entry
    const dm = calculateEntryDM(educationTermsUsed, characteristics, academyPath);
    const roll = await loggedRoll2D(`education.entry.academy.${branch}`, dm, academyPath.entryTarget);
    const rollDiceTotal = roll.results.reduce((a, b) => a + b, 0);
    setDiceTotal(rollDiceTotal);
    const result = resolveEntryRoll(rollDiceTotal, dm, academyPath.entryTarget);
    setEntryResult(result);
    setEntryRolled(true);

    if (result.success) {
      send({ type: 'ENTRY_SUCCESS' });
    } else {
      send({ type: 'ENTRY_FAILURE' });
    }
  }, [educationTermsUsed, characteristics, loggedRoll2D, send]);

  const handleRetry = useCallback(() => {
    setEntryResult(null);
    setEntryRolled(false);
    setEventData(null);
    setEventResolved(false);
    setSkillsSelected(false);
    setGraduationData(null);
    setSkillsEarnedThisTerm([]);
    setGraduationDM(0);
    send({ type: 'RETRY' });
  }, [send]);

  const handleSkip = useCallback(() => {
    send({ type: 'SKIP' });
  }, [send]);

  const handleSkipEducation = useCallback(() => {
    send({ type: 'SKIP_EDUCATION' });
  }, [send]);

  const handleSkillsComplete = useCallback((skills: { name: string; level: number }[]) => {
    const earned: string[] = [];
    for (const skill of skills) {
      addSkill(skill.name, skill.level);
      earned.push(skill.name);
    }
    // University gets EDU+1
    if (educationType === 'university') {
      setCharacteristic('EDU', characteristics.EDU + 1);
    }
    setSkillsEarnedThisTerm(earned);
    setSkillsSelected(true);
  }, [addSkill, setCharacteristic, characteristics.EDU, educationType]);

  const handleRollEvent = useCallback(async () => {
    const roll = await loggedRoll2D('education.event');
    const eventDiceTotal = roll.results.reduce((a, b) => a + b, 0);
    // Events table is indexed by roll value 2-12
    const event = EDUCATION_EVENTS.find((e) => e.rollValue === eventDiceTotal);
    if (event) {
      setEventData(event);
      // Check for graduation DM bonus from events (rolls 9 and 12)
      const gradDMEffect = event.effects.find(
        (e) => e.type === 'special' && e.detail.includes('DM+2 to graduation'),
      );
      if (gradDMEffect) {
        setGraduationDM((prev) => prev + 2);
      }
    }
  }, [loggedRoll2D]);

  const handleEventResolve = useCallback((_choiceIndex?: number) => {
    setEventResolved(true);
  }, []);

  const handleTermComplete = useCallback(async () => {
    send({ type: 'TERM_COMPLETE' });

    // Roll graduation
    const roll = await loggedRoll2D('education.graduation', graduationDM);
    const gradDiceTotal = roll.results.reduce((a, b) => a + b, 0);
    const gradResult = resolveGraduation(gradDiceTotal, graduationDM);
    setGraduationData(gradResult);

    // Apply graduation benefits to store
    const benefits = applyGraduationBenefits(gradResult.result, educationType);
    if (benefits.eduBonus > 0) {
      const currentEDU = useCharacterStore.getState().characteristics.EDU;
      setCharacteristic('EDU', currentEDU + benefits.eduBonus);
    }
    if (benefits.skillLevelBonus > 0) {
      for (const skillName of skillsEarnedThisTerm) {
        const currentSkills = useCharacterStore.getState().skills;
        const skill = currentSkills.find((s) => s.name === skillName);
        if (skill) {
          updateSkillLevel(skillName, skill.level + benefits.skillLevelBonus);
        }
      }
    }

    // Send appropriate graduation event
    if (gradResult.result === 'honours') {
      send({ type: 'GRADUATED_HONOURS' });
    } else if (gradResult.result === 'graduated') {
      send({ type: 'GRADUATED' });
    } else {
      send({ type: 'FAILED_GRADUATION' });
    }
  }, [send, loggedRoll2D, graduationDM, educationType, skillsEarnedThisTerm, setCharacteristic, updateSkillLevel]);

  const handleContinueToCareer = useCallback(() => {
    send({ type: 'CONTINUE' });
  }, [send]);

  // --- RENDER based on subState ---

  // choosing: show 3 cards
  if (subState === 'choosing') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-sans font-medium text-white mb-2">Education</h2>
          <p className="text-sm text-gray-400">
            Choose pre-career education or skip directly to your career.
            {educationTermsUsed > 0 && (
              <span className="text-modified ml-2">
                (Term {educationTermsUsed + 1} of 3, DM{-1 * educationTermsUsed} penalty)
              </span>
            )}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <EducationCard
            path={universityPath}
            onSelect={() => handleChooseUniversity()}
            disabled={!canAttemptEducation(educationTermsUsed)}
          />
          <EducationCard
            path={{ type: 'academy', label: 'Military Academy', description: '', entryCharacteristic: 'END', entryTarget: 8, socBonus: false }}
            onSelect={(branch) => branch && handleChooseAcademy(branch)}
            disabled={!canAttemptEducation(educationTermsUsed)}
          />
          <EducationCard
            path={{ type: 'university', label: 'Skip to Career', description: '', entryCharacteristic: 'EDU', entryTarget: 0, socBonus: false }}
            onSelect={handleSkipEducation}
            disabled={false}
          />
        </div>
      </div>
    );
  }

  // universityEntry / academyEntry / entryFailed: show entry roll result
  if (subState === 'universityEntry' || subState === 'academyEntry' || subState === 'entryFailed') {
    if (entryResult && selectedPath) {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-sans font-medium text-white">
            {selectedPath.label} — Entry Roll
          </h2>
          <EntryRollResult
            result={entryResult}
            path={selectedPath}
            diceTotal={diceTotal}
            educationTermsUsed={educationTermsUsed}
            onRetry={handleRetry}
            onSkip={handleSkip}
            onContinue={() => {
              /* Entry success already sent, user sees this then proceeds to term */
            }}
          />
        </div>
      );
    }
    return null;
  }

  // universityTerm / academyTerm: skill selection + event
  if (subState === 'universityTerm' || subState === 'academyTerm') {
    const isUniversity = subState === 'universityTerm';
    const availableSkills = isUniversity
      ? getAvailableUniversitySkills()
      : getAcademyBasicTraining(selectedBranch || 'army');

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-sans font-medium text-white">
          {isUniversity ? 'University Term' : `Military Academy — ${selectedPath?.label || 'Training'}`}
        </h2>

        {/* Skill selection / display */}
        {!skillsSelected ? (
          <EducationSkillPicker
            type={isUniversity ? 'university' : 'academy'}
            availableSkills={availableSkills}
            branchLabel={selectedPath?.label}
            onComplete={handleSkillsComplete}
          />
        ) : !eventData ? (
          /* Roll for event after skills selected */
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Skills acquired. Now roll for an education event.
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {skillsEarnedThisTerm.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-scanner-blue/10 border border-scanner-blue/30 rounded text-xs text-scanner-blue font-mono"
                >
                  {s}
                </span>
              ))}
            </div>
            <button
              className="px-4 py-2 bg-scanner-blue text-terminal-bg rounded-lg font-sans font-medium hover:bg-scanner-blue/80 transition-colors"
              onClick={handleRollEvent}
            >
              Roll for Event
            </button>
          </div>
        ) : !eventResolved ? (
          /* Show event card */
          <div className="space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Education Event</p>
            <EventCard event={eventData} onResolve={handleEventResolve} />
          </div>
        ) : (
          /* Event resolved, proceed to graduation */
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Education term complete. Proceed to graduation roll.
            </p>
            <button
              className="px-4 py-2 bg-scanner-blue text-terminal-bg rounded-lg font-sans font-medium hover:bg-scanner-blue/80 transition-colors"
              onClick={handleTermComplete}
            >
              Roll for Graduation
            </button>
          </div>
        )}
      </div>
    );
  }

  // graduation / graduated / graduatedHonours / failedGraduation
  if (
    subState === 'graduation' ||
    subState === 'graduated' ||
    subState === 'graduatedHonours' ||
    subState === 'failedGraduation'
  ) {
    if (graduationData) {
      const benefits = applyGraduationBenefits(graduationData.result, educationType);
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-sans font-medium text-white">Graduation</h2>
          <GraduationResult
            result={graduationData.result}
            rollTotal={graduationData.total}
            benefits={benefits}
            educationType={educationType}
            skillsEarnedThisTerm={skillsEarnedThisTerm}
            educationTermsUsed={educationTermsUsed}
            onContinue={handleContinueToCareer}
            onRetry={canAttemptEducation(educationTermsUsed) ? handleRetry : undefined}
          />
        </div>
      );
    }
    return null;
  }

  // Fallback
  return (
    <div className="text-gray-400">
      <p>Education state: {subState || 'unknown'}</p>
    </div>
  );
}
