import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

function MatchCard({ match, isOrganizer, onScoreUpdate }) {
  const [editing, setEditing] = useState(false);
  const [scoreA, setScoreA] = useState(match.scoreA ?? 0);
  const [scoreB, setScoreB] = useState(match.scoreB ?? 0);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = isOrganizer && match.teamAId && match.teamBId && match.status !== 'FINISHED';

  async function handleSave() {
    setIsSaving(true);
    try {
      await onScoreUpdate(match.id, Number(scoreA), Number(scoreB));
      setEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-56 shrink-0 rounded-lg border border-[#2A2622] bg-[#211D1A] p-3">
      <div className="flex items-center justify-between text-sm">
        <span className={match.status === 'FINISHED' && match.scoreA > match.scoreB ? 'font-semibold text-[#D4A574]' : 'text-[#D9CFC6]'}>
          {match.teamAName}
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
        <span className={match.status === 'FINISHED' && match.scoreB > match.scoreA ? 'font-semibold text-[#D4A574]' : 'text-[#D9CFC6]'}>
          {match.teamBName}
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

      {canEdit && (
        <div className="mt-2 border-t border-[#2A2622] pt-2">
          {editing ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-1 rounded bg-[#C2542D] py-1 text-xs font-medium text-[#1C1917] hover:bg-[#D4A574] disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full rounded border border-[#2A2622] py-1 text-xs text-[#A89A8C] hover:bg-[#2A2622]"
            >
              Enter score
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function BracketView({ matches, format, isOrganizer, onScoreUpdate }) {
  if (matches.length === 0) return null;

  const rounds = [...new Set(matches.map((m) => m.round))];

  if (format === 'ROUND_ROBIN' || format === 'LEAGUE') {
    return (
      <div className="space-y-2">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} isOrganizer={isOrganizer} onScoreUpdate={onScoreUpdate} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {rounds.map((round) => (
        <div key={round} className="flex shrink-0 flex-col gap-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-[#8A7F76]">{round}</h3>
          {matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.roundOrder - b.roundOrder)
            .map((match) => (
              <MatchCard key={match.id} match={match} isOrganizer={isOrganizer} onScoreUpdate={onScoreUpdate} />
            ))}
        </div>
      ))}
    </div>
  );
}