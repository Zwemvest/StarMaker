import { useState, useCallback } from 'react';
import { useCreationMachine } from '../../hooks/useCreationMachine';
import { useCharacterStore } from '../../stores/character';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { CAREERS, getCareer } from '../../data/careers/index';
import { getDraftCareer, resolveQualificationRoll, calculateQualificationDM } from '../../engine/career';
import { characteristicModifier } from '../../types/common';
import { CareerGrid } from './CareerGrid';
import { AssignmentCards } from './AssignmentCards';
import { QualFailCard } from './QualFailCard';
import { BasicTrainingCard } from './BasicTrainingCard';
import { SurvivalRoll } from './SurvivalRoll';
import { MishapCard } from './MishapCard';
import { CareerEventCard } from './CareerEventCard';
import { CommissionCard } from './CommissionCard';
import { AdvancementCard } from './AdvancementCard';
import { SkillTableTabs } from './SkillTableTabs';
import { AgingCard } from './AgingCard';
import { ContinueLeaveCard } from './ContinueLeaveCard';
import { TermTimeline } from './TermTimeline';
import { MusteringOutStep } from '../mustering-out/MusteringOutStep';
import { PsionicsStep } from '../psionics/PsionicsStep';
import { EquipmentStep } from '../equipment/EquipmentStep';
import { CharacterSheet } from '../sheet/CharacterSheet';
import type { CareerName } from '../../types/careers';
import type { CreationEvent } from '../../machines/creation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

/**
 * Career step orchestrator.
 * Routes to the correct component based on the XState career sub-state.
 * Wires all term loop components (Plans 05, 06, 07) into a single orchestrated flow.
 */
export function CareerStep() {
  const { state, send, subState, currentPhase } = useCreationMachine();
  const characteristics = useCharacterStore((s) => s.characteristics);
  const skills = useCharacterStore((s) => s.skills);
  const careerHistory = useCharacterStore((s) => s.careerHistory);
  const previousCareers = useCharacterStore((s) => s.previousCareers);
  const drafted = useCharacterStore((s) => s.drafted);
  const age = useCharacterStore((s) => s.age);
  const addCareerTerm = useCharacterStore((s) => s.addCareerTerm);
  const setAge = useCharacterStore((s) => s.setAge);
  const addPreviousCareer = useCharacterStore((s) => s.addPreviousCareer);
  const setLastCareer = useCharacterStore((s) => s.setLastCareer);
  const setDrafted = useCharacterStore((s) => s.setDrafted);
  const setCreationPhase = useCharacterStore((s) => s.setCreationPhase);
  const { loggedRoll2D } = useLoggedRoll();

  // Wrap send so that completing muster-out persists a 'postCareer' marker.
  // The character is NOT complete yet — the post-career flow (psionics →
  // equipment → sheet) still runs. The marker lets a page refresh restore the
  // user back into that flow instead of dropping them at career selection.
  // True completion ('complete') is set only at SHEET_COMPLETE (WizardShell).
  const sendWithCompletion = useCallback(
    (event: CreationEvent) => {
      if (event.type === 'MUSTERING_COMPLETE') {
        setCreationPhase('postCareer');
      } else if (event.type === 'SHEET_COMPLETE') {
        // The sheet's Done action is the true completion point.
        setCreationPhase('complete');
      }
      send(event);
    },
    [send, setCreationPhase],
  );

  // Track local career state
  const [currentCareer, setCurrentCareer] = useState<CareerName | null>(
    state.context.currentCareer,
  );
  const [currentAssignment, setCurrentAssignment] = useState<string | null>(
    state.context.currentAssignment,
  );
  const [currentRank, setCurrentRank] = useState(0);
  const [officerRank, setOfficerRank] = useState(0);
  const [isOfficer, setIsOfficer] = useState(false);
  const [mishapRoll, setMishapRoll] = useState(1);
  const [lastMishap, setLastMishap] = useState(false);

  // Qualification roll state
  const [qualResult, setQualResult] = useState<{ rolled: boolean; success: boolean }>({
    rolled: false,
    success: false,
  });
  const [rolling, setRolling] = useState(false);

  const careerData = currentCareer ? getCareer(currentCareer) : null;
  const assignmentIndex = careerData
    ? careerData.assignments.findIndex((a) => a.name === currentAssignment)
    : 0;
  const assignmentData = careerData?.assignments[Math.max(0, assignmentIndex)];

  const { careerTermCount, totalTermsServed, forcedToLeave, forcedToStay, isCommissioned } =
    state.context;

  // Determine current term number for display
  const currentTermNumber = careerHistory.length + 1;

  // Calculate DMs for qualification
  const qualDM = calculateQualificationDM(previousCareers.length);

  const handleChooseCareer = (career: CareerName) => {
    setCurrentCareer(career);
    setCurrentRank(0);
    setOfficerRank(0);
    setIsOfficer(false);
    setQualResult({ rolled: false, success: false });
    send({ type: 'CHOOSE_CAREER', career });
  };

  const handleChooseAssignment = (assignment: string) => {
    setCurrentAssignment(assignment);
    send({ type: 'CHOOSE_ASSIGNMENT', assignment });
  };

  const handleQualificationRoll = useCallback(async () => {
    if (!careerData || !careerData.qualification || rolling) return;
    setRolling(true);
    const { characteristic, target } = careerData.qualification;
    const charValue = characteristics[characteristic as keyof typeof characteristics] ?? 0;
    const charDM = characteristicModifier(charValue);
    const totalDM = qualDM + charDM;
    const roll = await loggedRoll2D('Career Qualification Roll', totalDM, target);
    const diceTotal = roll.results.reduce((a, b) => a + b, 0);
    const { success } = resolveQualificationRoll(diceTotal, totalDM, target);
    setQualResult({ rolled: true, success });
    setRolling(false);
    if (success) {
      send({ type: 'QUALIFICATION_SUCCESS' });
    } else {
      send({ type: 'QUALIFICATION_FAILURE' });
    }
  }, [careerData, qualDM, characteristics, loggedRoll2D, send, rolling]);

  const handleDraft = useCallback(async () => {
    const roll = await loggedRoll2D('Draft Table');
    const roll1D = Math.max(1, Math.min(6, roll.results[0] ?? 1));
    const draftedCareer = getDraftCareer(roll1D);
    setDrafted();
    setCurrentCareer(draftedCareer);
    setCurrentRank(0);
    setIsOfficer(false);
    send({ type: 'CHOOSE_DRAFT' });
  }, [loggedRoll2D, setDrafted, send]);

  const handleDrifter = () => {
    setCurrentCareer('drifter');
    setCurrentRank(0);
    setIsOfficer(false);
    send({ type: 'CHOOSE_DRIFTER' });
  };

  const handleBasicTrainingComplete = () => {
    // Age advances 4 years per term
    setAge(age + 4);
    send({ type: 'BASIC_TRAINING_COMPLETE' });
  };

  const handleSurvived = () => {
    send({ type: 'SURVIVAL_SUCCESS' });
  };

  const handleMishap = (rollValue: number) => {
    setMishapRoll(rollValue);
    setLastMishap(true);
    send({ type: 'SURVIVAL_FAILURE' });
  };

  const handleMishapResolved = () => {
    // Record current term to career history before leaving
    if (currentCareer && currentAssignment) {
      addCareerTerm({
        career: currentCareer,
        assignment: currentAssignment,
        term: currentTermNumber,
        rank: currentRank,
        skills: [],
        events: ['Mishap — forced career exit'],
      });
      addPreviousCareer(currentCareer);
      setLastCareer(currentCareer);
    }
    send({ type: 'MISHAP_RESOLVED' });
  };

  const handleEventResolved = (bonusDM: number) => {
    // CRER-11: carry an event-granted advancement DM into the term's commission
    // and advancement rolls. Must be assigned before EVENT_RESOLVED transitions.
    if (bonusDM > 0) {
      send({ type: 'SET_EVENT_BONUS_DM', amount: bonusDM });
    }
    send({ type: 'EVENT_RESOLVED' });
  };

  const handleCommissionResult = (success: boolean) => {
    if (success) {
      setIsOfficer(true);
      setOfficerRank(1);
    }
    send({ type: 'COMMISSION_RESULT', success });
  };

  const handleAdvancementResult = (result: {
    advanced: boolean;
    forcedToLeave: boolean;
    forcedToStay: boolean;
  }) => {
    if (result.advanced) {
      if (isOfficer) {
        setOfficerRank((r) => r + 1);
      } else {
        setCurrentRank((r) => r + 1);
      }
    }
    send({
      type: 'ADVANCEMENT_RESULT',
      advanced: result.advanced,
      forcedToLeave: result.forcedToLeave,
      forcedToStay: result.forcedToStay,
    });
  };

  const handleSkillSelected = () => {
    send({ type: 'SKILL_SELECTED' });
  };

  const handleAgingResolved = () => {
    send({ type: 'AGING_RESOLVED' });
  };

  const handleContinueCareer = () => {
    // Record term to history
    if (currentCareer && currentAssignment) {
      addCareerTerm({
        career: currentCareer,
        assignment: currentAssignment,
        term: currentTermNumber,
        rank: currentRank,
        skills: [],
        events: [],
      });
    }
    setAge(age + 4);
    send({ type: 'CONTINUE_CAREER' });
  };

  const handleChangeCareer = () => {
    if (currentCareer) {
      addPreviousCareer(currentCareer);
      setLastCareer(currentCareer);
    }
    send({ type: 'CHANGE_CAREER' });
  };

  const handleMusterOut = () => {
    if (currentCareer && currentAssignment) {
      addCareerTerm({
        career: currentCareer,
        assignment: currentAssignment,
        term: currentTermNumber,
        rank: currentRank,
        skills: [],
        events: [],
      });
    }
    if (currentCareer) {
      addPreviousCareer(currentCareer);
      setLastCareer(currentCareer);
    }
    send({ type: 'MUSTER_OUT' });
  };

  // Drifter has no qualification
  const handleDrifterQualAuto = () => {
    send({ type: 'QUALIFICATION_SUCCESS' });
  };

  // Get current rank title for display
  const getRankTitle = (): string => {
    if (!careerData) return `Rank ${currentRank}`;
    const rankTable = isOfficer ? careerData.ranks.officer : careerData.ranks.enlisted;
    const entry = rankTable?.find((r) => r.level === currentRank);
    return entry?.title ?? `Rank ${currentRank}`;
  };

  // --- Mustering Out ---
  if (subState === 'musteringOut' || currentPhase === 'musteringOut') {
    const musterCareer = currentCareer ? getCareer(currentCareer) : CAREERS['drifter'];
    const isMilitary = musterCareer.isMilitary;

    return (
      <MusteringOutStep
        career={musterCareer}
        termsInCareer={careerTermCount}
        totalTermsServed={totalTermsServed}
        mishapTerm={lastMishap}
        enlistedRank={currentRank}
        officerRank={officerRank}
        isMilitary={isMilitary}
        send={sendWithCompletion}
      />
    );
  }

  // --- Post-career flow ---
  // After muster-out the machine flows musteringOut → psionics → equipment →
  // sheet → complete. This component owns the actor that drives those states,
  // so it must render them (WizardShell's own actor never sees these events).
  if (currentPhase === 'psionics') {
    return <PsionicsStep send={sendWithCompletion} />;
  }

  if (currentPhase === 'equipment') {
    return <EquipmentStep send={sendWithCompletion} />;
  }

  if (currentPhase === 'sheet') {
    return <CharacterSheet onDone={() => sendWithCompletion({ type: 'SHEET_COMPLETE' })} />;
  }

  // --- Career selection ---
  if (subState === 'choosingCareer') {
    return <CareerGrid onChoose={handleChooseCareer} />;
  }

  if (subState === 'choosingAssignment') {
    if (!careerData) return null;
    return <AssignmentCards career={careerData} onChoose={handleChooseAssignment} />;
  }

  // --- Qualification roll ---
  if (subState === 'qualificationRoll') {
    if (!careerData) return null;

    // Drifter has no qualification requirement
    if (!careerData.qualification) {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-sans font-medium text-white">Qualification</h2>
          <p className="text-sm text-gray-300">
            <span className="capitalize">{currentCareer}</span> requires no qualification roll.
          </p>
          <Button variant="primary" onClick={handleDrifterQualAuto}>
            Enter Career
          </Button>
        </div>
      );
    }

    const { characteristic, target } = careerData.qualification;
    const charValue = characteristics[characteristic as keyof typeof characteristics] ?? 0;
    const charDM = characteristicModifier(charValue);
    const totalDM = qualDM + charDM;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Qualification Roll</h2>
        <Card>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Target</p>
                <p className="font-mono text-white font-bold text-xl">{characteristic} {target}+</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your DM</p>
                <p className={`font-mono font-bold text-xl ${totalDM >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalDM >= 0 ? `+${totalDM}` : totalDM}
                </p>
              </div>
            </div>
            {qualDM < 0 && (
              <p className="text-xs text-amber-400">Includes DM{qualDM} for previous career(s)</p>
            )}
            {!qualResult.rolled && (
              <Button variant="primary" className="w-full" onClick={handleQualificationRoll} disabled={rolling}>
                {rolling ? 'Rolling...' : 'Roll for Qualification'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // --- Qualification failed ---
  if (subState === 'qualificationFailed') {
    return (
      <QualFailCard
        onDraft={handleDraft}
        onDrifter={handleDrifter}
        alreadyDrafted={drafted}
      />
    );
  }

  // --- Basic training ---
  if (subState === 'basicTraining') {
    if (!careerData) return null;
    const isFirstCareer = previousCareers.length === 0;
    return (
      <BasicTrainingCard
        career={careerData}
        assignmentIndex={Math.max(0, assignmentIndex)}
        isFirstCareer={isFirstCareer}
        onComplete={handleBasicTrainingComplete}
      />
    );
  }

  // --- Term loop sub-states ---
  // The subState for nested states will be the innermost state value
  // We need to detect termLoop.* substates
  const termLoopState = (() => {
    const value = state.value;
    if (typeof value === 'object' && value !== null) {
      const careerState = (value as Record<string, unknown>)['career'];
      if (typeof careerState === 'object' && careerState !== null) {
        const termLoop = (careerState as Record<string, unknown>)['termLoop'];
        if (typeof termLoop === 'string') return termLoop;
        if (typeof termLoop === 'object' && termLoop !== null) {
          return Object.keys(termLoop)[0];
        }
      }
    }
    return null;
  })();

  // Career timeline wrapper for term loop states
  const withTimeline = (content: React.ReactNode) => (
    <div className="space-y-6">
      <TermTimeline
        careerHistory={careerHistory}
        currentTerm={
          currentCareer && currentAssignment
            ? {
                career: currentCareer,
                assignment: currentAssignment,
                rank: currentRank,
                termNumber: currentTermNumber,
              }
            : undefined
        }
      />
      {content}
    </div>
  );

  if (termLoopState === 'survivalRoll' || subState === 'survivalRoll') {
    if (!assignmentData) return null;
    const charKey = assignmentData.survival.characteristic as keyof typeof characteristics;
    return withTimeline(
      <SurvivalRoll
        assignment={assignmentData}
        characteristicValue={characteristics[charKey] ?? 0}
        onSurvived={handleSurvived}
        onMishap={handleMishap}
      />,
    );
  }

  if (termLoopState === 'mishap' || subState === 'mishap') {
    if (!careerData) return null;
    const mishapEntry = careerData.mishaps.find((m) => m.rollValue === mishapRoll)
      ?? careerData.mishaps[0];
    return withTimeline(
      <MishapCard mishap={mishapEntry} onResolved={handleMishapResolved} />,
    );
  }

  if (termLoopState === 'event' || subState === 'event') {
    if (!careerData) return null;
    // Roll for event inline — show a "Roll for Event" button if no event yet
    return withTimeline(<EventRoller career={careerData} onResolved={handleEventResolved} />);
  }

  if (termLoopState === 'commission' || subState === 'commission') {
    if (!careerData || !careerData.commission || isCommissioned) {
      // Already commissioned — skip by sending COMMISSION_RESULT with success: false (stays in advancement)
      // This should be handled by machine guard, but belt-and-suspenders
      send({ type: 'COMMISSION_RESULT', success: false });
      return null;
    }
    const charKey = careerData.commission.characteristic as keyof typeof characteristics;
    return withTimeline(
      <CommissionCard
        career={careerData}
        commissionTarget={careerData.commission}
        characteristicValue={characteristics[charKey] ?? 0}
        termsInCareer={careerTermCount}
        bonusDM={state.context.bonusAdvancementDM}
        onResult={handleCommissionResult}
      />,
    );
  }

  if (termLoopState === 'advancement' || subState === 'advancement') {
    if (!careerData || !assignmentData) return null;
    const charKey = assignmentData.advancement.characteristic as keyof typeof characteristics;
    return withTimeline(
      <AdvancementCard
        career={careerData}
        advancementTarget={assignmentData.advancement}
        characteristicValue={characteristics[charKey] ?? 0}
        termsServed={totalTermsServed}
        currentRank={currentRank}
        isOfficer={isOfficer}
        bonusDM={state.context.bonusAdvancementDM}
        onResult={handleAdvancementResult}
      />,
    );
  }

  if (termLoopState === 'skillSelection' || subState === 'skillSelection') {
    if (!careerData) return null;
    return withTimeline(
      <SkillTableTabs
        career={careerData}
        assignmentIndex={Math.max(0, assignmentIndex)}
        isCommissioned={isCommissioned}
        edu={characteristics.EDU}
        skills={skills}
        int={characteristics.INT}
        onSkillSelected={handleSkillSelected}
      />,
    );
  }

  if (termLoopState === 'aging' || subState === 'aging') {
    return withTimeline(
      <AgingCard
        age={age}
        characteristics={characteristics}
        onResolved={handleAgingResolved}
      />,
    );
  }

  if (termLoopState === 'continueOrLeave' || subState === 'continueOrLeave') {
    return withTimeline(
      <ContinueLeaveCard
        currentRank={getRankTitle()}
        termsInCareer={careerTermCount}
        totalTerms={totalTermsServed}
        age={age}
        forcedToLeave={forcedToLeave}
        forcedToStay={forcedToStay}
        onContinue={handleContinueCareer}
        onChangeCareer={handleChangeCareer}
        onMusterOut={handleMusterOut}
      />,
    );
  }

  // Fallback: unmatched sub-state. Only reachable for a single frame during the
  // 'complete' transition (WizardShell routes 'complete' to CompleteSummary).
  if (import.meta.env.DEV) {
    console.warn('[CareerStep] Unmatched state value:', state.value);
  }
  return null;
}

/**
 * Helper component to handle the event roll within the CareerStep orchestrator.
 * Rolls 2D on mount, looks up the career event, and shows CareerEventCard.
 */
function EventRoller({
  career,
  onResolved,
}: {
  career: ReturnType<typeof getCareer>;
  onResolved: (bonusDM: number) => void;
}) {
  const { loggedRoll2D } = useLoggedRoll();
  const [event, setEvent] = useState<(typeof career.events)[0] | null>(null);
  const [rolling, setRolling] = useState(false);

  const handleRoll = useCallback(async () => {
    setRolling(true);
    const roll = await loggedRoll2D('Career Event');
    const total = roll.results.reduce((a, b) => a + b, 0);
    // D66-style events: roll 2D, match to rollValue 2-12
    const found = career.events.find((e) => e.rollValue === total)
      ?? career.events[Math.floor(career.events.length / 2)]; // fallback to middle
    setEvent(found);
    setRolling(false);
  }, [loggedRoll2D, career.events]);

  if (!event) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Career Event</h2>
        <p className="text-sm text-gray-400">Roll to determine your career event for this term.</p>
        <Button variant="primary" onClick={handleRoll} disabled={rolling} className="w-full">
          {rolling ? 'Rolling...' : 'Roll for Event'}
        </Button>
      </div>
    );
  }

  return <CareerEventCard event={event} onResolved={onResolved} />;
}
