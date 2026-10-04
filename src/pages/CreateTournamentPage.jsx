import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Loader2 } from 'lucide-react';
import { createTournament } from '../services/tournamentService';

const FORMATS = [
  { value: 'KNOCKOUT', label: 'Knockout' },
  { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination (3+ teams)' },
  { value: 'ROUND_ROBIN', label: 'Round Robin (everyone plays once)' },
  { value: 'LEAGUE', label: 'League (home & away)' },
];

export default function CreateTournamentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('');
  const [format, setFormat] = useState('KNOCKOUT');
  const [maxTeams, setMaxTeams] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !sportType.trim()) {
      setError('Fill in tournament name and sport type.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const tournament = await createTournament({
        bookingId,
        name: name.trim(),
        sportType: sportType.trim(),
        format,
        maxTeams: Number(maxTeams),
      });
      navigate(`/tournaments/${tournament.id}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create tournament.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1917] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-2 text-[#8A7F76]">
          <Trophy size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">New tournament</span>
        </div>
        <h1 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#F5F0EB]">
          Set up your tournament
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
              Tournament name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Friday Night Futsal Cup"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
              Sport type
            </label>
            <input
              type="text"
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              placeholder="Futsal"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
              Format
            </label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className={inputClass}>
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
              Max teams
            </label>
            <input
              type="number"
              min="2"
              value={maxTeams}
              onChange={(e) => setMaxTeams(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[#3A1F1A] px-3 py-2 text-sm text-[#E07856]">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C2542D] px-5 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : null}
            {isSubmitting ? 'Creating…' : 'Create tournament'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] placeholder:text-[#5A524A] outline-none transition-colors focus:border-[#C2542D]/60';