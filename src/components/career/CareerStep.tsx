import { useState, useCallback, useMemo } from 'react';
import { CareerGrid } from './CareerGrid';
import { AssignmentCards } from './AssignmentCards';
import { QualFailCard } from './QualFailCard';
import { BasicTrainingCard } from './BasicTrainingCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { useCharacterStore } from '../../stores/character';
import { CAREERS } from '../../data/careers/index';
import {
  calculateQualificationDM,
  resolveQualificationRoll,
  getDraftCareer,
} from '../../engine/career';
import { characteristicModifier } from '../../types/common';
import type { CareerName, CareerData } from '../../types/careers';
import type { CreationEvent } from '../../machines/creation';

interface CareerStepProps {
  subState: string | undefined;
  send: (event: CreationEvent) => void;
}

/**
 * Career step orchestrator.
 *
 * Renders different UI based on the XState nested career sub-state:
 * choosingCareer, choosingAssignment, qualificationRoll,
 * qualificationFailed, basicTraining, termLoop.*, musteringOut.
 */
export function CareerStep({ subState, send }: CareerStepProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const characteristics = useCharacterStore((s) => s.characteristics);
  const previousCareers = useCharacterStore((s) => s.previousCareers);
  const drafted = useCharacterStore((s) => s.drafted);
  const addPreviousCareer = useCharacterStore((s) => s.addPreviousCareer);
  const setLastCareer = useCharacterStore((s) => s.setLastCareer);
  const setDrafted = useCharacterStore((s) => s.setDrafted);

  const [selectedCareer, setSelectedCareer] = useState<CareerName | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [qualResult, setQualResult] = useState<{
    success: boolean;
    total: number;
    target: number;
    dm: number;
    diceTotal: number;
  } | null>(null);
  const [qualRolled, setQualRolled] = useState(false);

  const careerData: CareerData | null = useMemo(
    () => (selectedCareer ? CAREERS[selectedCareer] : null),
    [selectedCareer],
  );

  const assignmentIndex = useMemo(() => {
    if (!careerData || !selectedAssignment) return 0;
    const idx = careerData.assignments.findIndex((a) => a.name === selectedAssignment);
    return idx >= 0 ? idx : 0;
  }, [careerData, selectedAssignment]);

  const isFirstCareer = previousCareers.length === 0;

  /** Calculate odds of success for 2D >= target (with DM) */
  const calculateOdds = useCallback((target: number, dm: number): number => {
    const effectiveTarget = target - dm;
    if (effectiveTarget <= 2) return 100;
    if (effectiveTarget > 12) return 0;
    let successes = 0;
    for (let d1 = 1; d1 <= 6; d1++) {
      for (let d2 = 1; d2 <= 6; d2++) {
        if (d1 + d2 >= effectiveTarget) successes++;
      }
    }
    return Math.round((successes / 36) * 100);
  }, []);

  // --- Handlers ---

  const handleChooseCareer = useCallback(
    (career: CareerName) => {
      setSelectedCareer(career);
      setQualResult(null);
      setQualRolled(false);
      send({ type: 'CHOOSE_CAREER', career });
    },
    [send],
  );

  const handleChooseAssignment = useCallback(
    (assignment: string) => {
      setSelectedAssignment(assignment);
      send({ type: 'CHOOSE_ASSIGNMENT', assignment });
    },
    [send],
  );

  const handleRollQualification = useCallback(async () => {
    if (!careerData || !careerData.qualification) return;

    const qual = careerData.qualification;
    const charValue = characteristics[qual.characteristic as keyof typeof characteristics];
    const charDM = charValue !== undefined ? characteristicModifier(charValue) : 0;
    const prevDM = calculateQualificationDM(previousCareers.length);
    const totalDM = charDM + prevDM;

    const roll = await loggedRoll2D('career.qualification', totalDM, qual.target);
    const diceTotal = roll.results.reduce((a: number, b: number) => a + b, 0);
    const result = resolveQualificationRoll(diceTotal, totalDM, qual.target);

    setQualResult({
      success: result.success,
      total: result.total,
      target: qual.target,
      dm: totalDM,
      diceTotal,
    });
    setQualRolled(true);

    if (result.success) {
      send({ type: 'QUALIFICATION_SUCCESS' });
    } else {
      send({ type: 'QUALIFICATION_FAILURE' });
    }
  }, [careerData, characteristics, previousCareers.length, loggedRoll2D, send]);

  const handleDraft = useCallback(async () => {
    // Roll 1D for draft table
    const { rollDice } = await import('../../engine/dice');
    const draftDice = rollDice(1, 6);
    const draftRoll = draftDice[0];
    const draftedCareer = getDraftCareer(draftRoll);

    setSelectedCareer(draftedCareer);
    setDrafted();
    send({ type: 'CHOOSE_DRAFT' });
  }, [send, setDrafted]);

  const handleDrifter = useCallback(() => {
    setSelectedCareer('drifter');
    send({ type: 'CHOOSE_DRIFTER' });
  }, [send]);

  const handleBasicTrainingComplete = useCallback(() => {
    if (selectedCareer) {
      addPreviousCareer(selectedCareer);
      setLastCareer(selectedCareer);
    }
    send({ type: 'BASIC_TRAINING_COMPLETE' });
  }, [send, selectedCareer, addPreviousCareer, setLastCareer]);

  // --- RENDER based on subState ---

  // choosingCareer: show career grid
  if (subState === 'choosingCareer') {
    return <CareerGrid onChoose={handleChooseCareer} />;
  }

  // choosingAssignment: show assignment cards for selected career
  if (subState === 'choosingAssignment' && careerData) {
    return <AssignmentCards career={careerData} onChoose={handleChooseAssignment} />;
  }

  // qualificationRoll: show qualification roll card
  if (subState === 'qualificationRoll' && careerData) {
    const qual = careerData.qualification;

    // Drifter has no qualification — auto-succeed
    if (!qual) {
      // This shouldn't normally happen since Drifter bypasses qualification,
      // but handle gracefully
      send({ type: 'QUALIFICATION_SUCCESS' });
      return null;
    }

    if (!qualRolled) {
      const charValue = characteristics[qual.characteristic as keyof typeof characteristics];
      const charDM = charValue !== undefined ? characteristicModifier(charValue) : 0;
      const prevDM = calculateQualificationDM(previousCareers.length);
      const totalDM = charDM + prevDM;
      const odds = calculateOdds(qual.target, totalDM);

      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-sans font-medium text-white">
            {careerData.name} — Qualification Roll
          </h2>
          <Card>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-gray-300">
                  Qualification target:{' '}
                  <span className="text-scanner-blue font-mono font-bold">
                    {qual.characteristic} {qual.target}+
                  </span>
                </p>
                {charDM !== 0 && (
                  <p className="text-xs text-gray-400">
                    {qual.characteristic} DM: <span className="font-mono">{charDM >= 0 ? `+${charDM}` : charDM}</span>
                  </p>
                )}
                {prevDM !== 0 && (
                  <p className="text-xs text-gray-400">
                    Previous careers penalty: <span className="font-mono">{prevDM}</span>
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Total DM: <span className="font-mono">{totalDM >= 0 ? `+${totalDM}` : totalDM}</span>
                </p>
                <p className="text-sm text-gray-300">
                  Odds of success:{' '}
                  <span className={`font-mono font-bold ${odds >= 50 ? 'text-legitimate' : 'text-modified'}`}>
                    {odds}%
                  </span>
                </p>
              </div>
              <Button variant="primary" onClick={handleRollQualification}>
                Roll for Qualification
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    // Show result (brief flash before state transitions)
    if (qualResult) {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-sans font-medium text-white">
            {careerData.name} — Qualification
          </h2>
          <Card>
            <p className={`text-lg font-sans font-medium ${qualResult.success ? 'text-legitimate' : 'text-modified'}`}>
              {qualResult.success ? 'Qualified!' : 'Failed'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Rolled {qualResult.diceTotal} + DM {qualResult.dm} = {qualResult.total} (needed {qualResult.target}+)
            </p>
          </Card>
        </div>
      );
    }
  }

  // qualificationFailed: show draft/drifter choice
  if (subState === 'qualificationFailed') {
    return (
      <QualFailCard
        onDraft={handleDraft}
        onDrifter={handleDrifter}
        alreadyDrafted={drafted}
      />
    );
  }

  // basicTraining: show basic training skills
  if (subState === 'basicTraining' && careerData) {
    return (
      <BasicTrainingCard
        career={careerData}
        assignmentIndex={assignmentIndex}
        isFirstCareer={isFirstCareer}
        onComplete={handleBasicTrainingComplete}
      />
    );
  }

  // termLoop sub-states — placeholder for Plan 06
  if (subState && subState.startsWith('termLoop')) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-sans font-medium text-white">Career Term</h2>
        <Card>
          <p className="text-gray-400 text-sm">
            Term loop content will be implemented in Plan 06.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Current sub-state: {subState}
          </p>
        </Card>
      </div>
    );
  }

  // musteringOut — placeholder for Plan 07
  if (subState === 'musteringOut') {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-sans font-medium text-white">Mustering Out</h2>
        <Card>
          <p className="text-gray-400 text-sm">
            Mustering out content will be implemented in Plan 07.
          </p>
        </Card>
      </div>
    );
  }

  // Fallback
  return (
    <div className="text-gray-400">
      <p>Career state: {subState || 'unknown'}</p>
    </div>
  );
}
