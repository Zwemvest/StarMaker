import { useState } from 'react';
import { useCharacterStore } from '../../stores/character';
import { characteristicModifier } from '../../types/common';
import { getNobleTitle } from '../../engine/career';
import type { CharacteristicId } from '../../types/common';
import type { Contact } from '../../types/character';
import type { CareerTerm } from '../../types/careers';

const PHYSICAL: CharacteristicId[] = ['STR', 'DEX', 'END'];
const MENTAL: CharacteristicId[] = ['INT', 'EDU', 'SOC'];

function CharacteristicCell({ id, value, title }: { id: CharacteristicId; value: number; title?: string | null }) {
  const dm = characteristicModifier(value);
  const dmStr = dm >= 0 ? `+${dm}` : `${dm}`;

  return (
    <div className="flex flex-col items-center p-2 rounded bg-terminal-bg/50">
      <span className="text-xs text-gray-400 uppercase tracking-wide">{id}</span>
      <span className="text-xl font-mono text-white">
        {value || '-'}
      </span>
      <span className="text-xs font-mono text-scanner-blue">
        DM {dmStr}
      </span>
      {title && (
        <span className="text-xs text-amber-400 mt-0.5">{title}</span>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div>
      <button
        className="flex items-center justify-between w-full text-left group"
        onClick={() => setExpanded((v) => !v)}
      >
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">{title}</h3>
        <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
          {expanded ? '▲' : '▼'}
        </span>
      </button>
      {expanded && <div className="mt-2">{children}</div>}
    </div>
  );
}

function CareerTermRow({ term }: { term: CareerTerm }) {
  const careerDisplay = `${term.career.charAt(0).toUpperCase()}${term.career.slice(1)}`;
  const assignmentDisplay = term.assignment
    ? ` – ${term.assignment}`
    : '';
  return (
    <li className="space-y-0.5 py-1 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300 font-medium">
          {careerDisplay}{assignmentDisplay}
        </span>
        <span className="text-xs text-gray-500">Term {term.term}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-scanner-blue">Rank {term.rank}</span>
        {term.events.length > 0 && (
          <span className="text-xs text-gray-500 truncate max-w-[120px]" title={term.events.join('; ')}>
            {term.events[0]}
          </span>
        )}
      </div>
    </li>
  );
}

function ContactsSection({ contacts }: { contacts: Contact[] }) {
  const [expanded, setExpanded] = useState(false);

  const counts = {
    ally: contacts.filter((c) => c.type === 'ally').length,
    contact: contacts.filter((c) => c.type === 'contact').length,
    rival: contacts.filter((c) => c.type === 'rival').length,
    enemy: contacts.filter((c) => c.type === 'enemy').length,
  };

  const hasContacts = contacts.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">Contacts</h3>
        {hasContacts && (
          <button
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '▲' : '▼'}
          </button>
        )}
      </div>

      <div className="mt-1">
        {!hasContacts ? (
          <p className="text-sm text-gray-500 italic">None</p>
        ) : (
          <>
            <p className="text-sm text-gray-400">
              <span className="text-green-400">Allies: {counts.ally}</span>
              {', '}
              <span className="text-blue-400">Contacts: {counts.contact}</span>
              {', '}
              <span className="text-yellow-400">Rivals: {counts.rival}</span>
              {', '}
              <span className="text-red-400">Enemies: {counts.enemy}</span>
            </p>
            {expanded && (
              <ul className="mt-2 space-y-1">
                {contacts.map((c, i) => (
                  <li key={i} className="text-xs text-gray-400">
                    <span
                      className={
                        c.type === 'ally'
                          ? 'text-green-400'
                          : c.type === 'rival'
                          ? 'text-yellow-400'
                          : c.type === 'enemy'
                          ? 'text-red-400'
                          : 'text-blue-400'
                      }
                    >
                      [{c.type}]
                    </span>{' '}
                    {c.name}
                    {c.notes && (
                      <span className="text-gray-600"> — {c.notes}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function CharacterPanel() {
  const characteristics = useCharacterStore((s) => s.characteristics);
  const skills = useCharacterStore((s) => s.skills);
  const careerHistory = useCharacterStore((s) => s.careerHistory);
  const contacts = useCharacterStore((s) => s.contacts);
  const credits = useCharacterStore((s) => s.credits);
  const pension = useCharacterStore((s) => s.pension);
  const benefits = useCharacterStore((s) => s.benefits);

  const nobleTitle = getNobleTitle(characteristics.SOC);

  const hasCareerData = careerHistory.length > 0;
  const hasFinancialData = credits > 0 || pension > 0 || benefits.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-sans font-medium text-scanner-blue uppercase tracking-wider">
        Character Summary
      </h2>

      {/* Characteristics - 2x3 grid: Physical left, Mental right */}
      <div>
        <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
          Characteristics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Physical column */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500">Physical</span>
            {PHYSICAL.map((id) => (
              <CharacteristicCell
                key={id}
                id={id}
                value={characteristics[id]}
              />
            ))}
          </div>
          {/* Mental column */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500">Mental</span>
            {MENTAL.map((id) => (
              <CharacteristicCell
                key={id}
                id={id}
                value={characteristics[id]}
                title={id === 'SOC' ? nobleTitle : null}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
          Skills
        </h3>
        {skills.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No skills yet</p>
        ) : (
          <ul className="space-y-1">
            {[...skills]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((skill) => (
                <li
                  key={skill.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-300">{skill.name}</span>
                  <span className="font-mono text-scanner-blue">{skill.level}</span>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Career History */}
      {hasCareerData && (
        <CollapsibleSection title="Career History" defaultExpanded={true}>
          <ul className="space-y-0">
            {careerHistory.map((term, i) => (
              <CareerTermRow key={i} term={term} />
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Contacts */}
      <ContactsSection contacts={contacts} />

      {/* Financial Summary (mustering out) */}
      {hasFinancialData && (
        <div>
          <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Finances
          </h3>
          <div className="space-y-1">
            {credits > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Credits</span>
                <span className="font-mono text-scanner-blue">
                  Cr{credits.toLocaleString()}
                </span>
              </div>
            )}
            {pension > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Pension</span>
                <span className="font-mono text-amber-400">
                  Cr{pension.toLocaleString()}/yr
                </span>
              </div>
            )}
            {benefits.length > 0 && (
              <div>
                <span className="text-xs text-gray-500">Benefits</span>
                <ul className="mt-1 space-y-0.5">
                  {benefits.map((b, i) => (
                    <li key={i} className="text-sm text-gray-300">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
