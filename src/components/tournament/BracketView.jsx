import { useState } from 'react';
import { Loader2, Check, CalendarClock } from 'lucide-react';

// ISO string -> value for <input type="datetime-local">
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function MatchCard({ match, isOrganizer, onScoreUpdate, onScheduleUpdate }) {
  const [editing, setEditing] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scoreA, setScoreA] = useState(match.scoreA ?? 0);
  const [scoreB, setScoreB] = useState(match.scoreB ?? 0);
  const [scheduleValue, setScheduleValue] = useState(toLocalInput(match.scheduledAt));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isFinished = match.status === 'FINISHED';
  const isBye = match.status === 'FORFEIT';

  const canScore = isOrganizer && match.teamAId && match.teamBId && !isFinished;
  const canSchedule = isOrganizer && !isFinished && !isBye;

  async function handleSaveScore() {
    setError('');
    setIsSaving(true);
    try {
      await onScoreUpdate(match.id, Number(scoreA), Number(scoreB));
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save the score.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveSchedule() {
    if (!scheduleValue) return;
    setError('');
    setIsSaving(true);
    try {
      await onScheduleUpdate(match.id, new Date(scheduleValue).toISOString());
      setScheduling(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save the time.');
    } finally {
      setIsSaving(false);
    }
  }

  const nameA = match.teamAId ? match.teamAName : isBye ? '—' : 'TBD';
  const nameB = match.teamBId ? match.teamBName : isBye ? '—' : 'TBD';

  return (
    <div className="w-56 shrink-0 rounded-lg border border-[#2A2622] bg-[#211D1A] p-3">
      {isBye && (
        <span className="mb-1.5 inline-block rounded bg-[#2A2622] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[#8A7F76]">
          Bye
        </span>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className={isFinished && match.scoreA > match.scoreB ? 'font-semibold text-[#D4A574]' : 'text-[#D9CFC6]'}>
          {nameA}
        </span>
        {editing ? (
          <input
            type="number"
            min="0"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            className="w-10 rounded border border-[#2A2622] bg-[#181512] px-1 text-center text-xs text-[#F5F0EB]"
          />
        ) : (
          <span className="text-xs text-[#8A7F76]">{match.scoreA ?? '-'}</span>
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-sm">
        <span className={isFinished && match.scoreB > match.scoreA ? 'font-semibold text-[#D4A574]' : 'text-[#D9CFC6]'}>
          {nameB}
        </span>
        {editing ? (
          <input
            type="number"
            min="0"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            className="w-10 rounded border border-[#2A2622] bg-[#181512] px-1 text-center text-xs text-[#F5F0EB]"
          />
        ) : (
          <span className="text-xs text-[#8A7F76]">{match.scoreB ?? '-'}</span>
        )}
      </div>

      {match.scheduledAt && !scheduling && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-[#6B615A]">
          <CalendarClock size={11} />
          {new Date(match.scheduledAt).toLocaleString([], {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      )}

      {scheduling && (
        <div className="mt-2 border-t border-[#2A2622] pt-2">
          <input
            type="datetime-local"
            value={scheduleValue}
            onChange={(e) => setScheduleValue(e.target.value)}
            className="w-full rounded border border-[#2A2622] bg-[#181512] px-1.5 py-1 text-xs text-[#F5F0EB] outline-none focus:border-[#C2542D]/60"
          />
          <div className="mt-1.5 flex gap-1.5">
            <button
              onClick={handleSaveSchedule}
              disabled={isSaving || !scheduleValue}
              className="flex flex-1 items-center justify-center gap-1 rounded bg-[#C2542D] py-1 text-xs font-medium text-[#1C1917] hover:bg-[#D4A574] disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              Save
            </button>
            <button
              onClick={() => { setScheduling(false); setError(''); }}
              disabled={isSaving}
              className="rounded border border-[#2A2622] px-2 py-1 text-xs text-[#A89A8C] hover:bg-[#2A2622]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-[11px] leading-snug text-[#E07856]">{error}</p>}

      {(canScore || canSchedule) && !scheduling && (
        <div className="mt-2 space-y-1.5 border-t border-[#2A2622] pt-2">
          {canScore && (editing ? (
            <button
              onClick={handleSaveScore}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-1 rounded bg-[#C2542D] py-1 text-xs font-medium text-[#1C1917] hover:bg-[#D4A574] disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              Save
            </button>
          ) : (
            <button
              onClick={() => { setEditing(true); setError(''); }}
              className="w-full rounded border border-[#2A2622] py-1 text-xs text-[#A89A8C] hover:bg-[#2A2622]"
            >
              Enter score
            </button>
          ))}
          {canSchedule && !editing && (
            <button
              onClick={() => { setScheduling(true); setError(''); }}
              className="flex w-full items-center justify-center gap-1 rounded border border-[#2A2622] py-1 text-xs text-[#A89A8C] hover:bg-[#2A2622]"
            >
              <CalendarClock size={11} />
              {match.scheduledAt ? 'Change time' : 'Set time'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// columns of rounds, left to right. Bye matches are not drawn as cards:
// the team simply moves on, so they are listed in one line per round.
function RoundColumns({ matches, ...cardProps }) {
  const sorted = [...matches].sort((a, b) => a.roundOrder - b.roundOrder);
  const rounds = [...new Set(sorted.map((m) => m.round))];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {rounds.map((round) => {
        const inRound = sorted.filter((m) => m.round === round);
        const playable = inRound.filter((m) => m.status !== 'FORFEIT');
        const byeTeams = inRound
          .filter((m) => m.status === 'FORFEIT')
          .map((m) => (m.teamAId ? m.teamAName : m.teamBId ? m.teamBName : null))
          .filter(Boolean);

        // nothing to show (every match in this round was a dead bye)
        if (playable.length === 0 && byeTeams.length === 0) return null;

        return (
          <div key={round} className="flex shrink-0 flex-col gap-3">
            <h3 className="text-xs font-medium uppercase tracking-wide text-[#8A7F76]">{round}</h3>
            {byeTeams.length > 0 && (
              <p className="w-56 rounded-lg border border-dashed border-[#2A2622] px-3 py-2 text-xs leading-relaxed text-[#8A7F76]">
                <span className="font-medium text-[#A89A8C]">Bye:</span> {byeTeams.join(', ')}
              </p>
            )}
            {playable.map((match) => (
              <MatchCard key={match.id} match={match} {...cardProps} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// round robin / league: one block per round or matchday
function RoundList({ matches, ...cardProps }) {
  const sorted = [...matches].sort((a, b) => a.roundOrder - b.roundOrder);
  const rounds = [...new Set(sorted.map((m) => m.round))];

  return (
    <div className="space-y-5">
      {rounds.map((round) => (
        <div key={round}>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#8A7F76]">{round}</h3>
          <div className="flex flex-wrap gap-3">
            {sorted
              .filter((m) => m.round === round)
              .map((match) => (
                <MatchCard key={match.id} match={match} {...cardProps} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-3 border-b border-[#2A2622] pb-1.5 text-sm font-semibold text-[#F5F0EB]">{title}</h2>
      {children}
    </div>
  );
}

export default function BracketView({ matches, format, isOrganizer, onScoreUpdate, onScheduleUpdate }) {
  if (matches.length === 0) return null;

  const cardProps = { isOrganizer, onScoreUpdate, onScheduleUpdate };

  if (format === 'ROUND_ROBIN' || format === 'LEAGUE') {
    return <RoundList matches={matches} {...cardProps} />;
  }

  if (format === 'DOUBLE_ELIMINATION') {
    const winners = matches.filter((m) => m.bracketSide === 'WINNERS');
    const losers = matches.filter((m) => m.bracketSide === 'LOSERS');
    const grandFinal = matches.filter((m) => m.bracketSide === 'GRAND_FINAL');

    return (
      <div className="space-y-8">
        <Section title="Winners bracket">
          <RoundColumns matches={winners} {...cardProps} />
        </Section>
        <Section title="Losers bracket">
          <RoundColumns matches={losers} {...cardProps} />
        </Section>
        <Section title="Grand final">
          <RoundColumns matches={grandFinal} {...cardProps} />
        </Section>
      </div>
    );
  }

  return <RoundColumns matches={matches} {...cardProps} />;
}