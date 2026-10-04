import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { getBrowsableTournaments } from '../services/tournamentService';

const TABS = [
  { key: 'ONGOING', label: 'Ongoing' },
  { key: 'PLANNED', label: 'Open to join' },
  { key: 'COMPLETED', label: 'Completed' },
];

const EMPTY_TEXT = {
  ONGOING: 'No tournaments are running right now.',
  PLANNED: 'No tournaments are open for registration right now.',
  COMPLETED: 'No completed tournaments yet.',
};

const STATUS_STYLES = {
  PLANNED: 'bg-yellow-500/15 text-yellow-400',
  ONGOING: 'bg-green-500/15 text-green-400',
  COMPLETED: 'bg-blue-500/15 text-blue-400',
};

export default function BrowseTournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState('ONGOING');

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const data = await getBrowsableTournaments();
        setTournaments(data);
      } catch (err) {
        console.error('Failed to load tournaments', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTournaments();
  }, []);

  const countOf = (key) => tournaments.filter((t) => t.status === key).length;
  const visible = tournaments
    .filter((t) => t.status === tab)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-[#1C1917] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-2 text-[#8A7F76]">
          <Trophy size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">Tournaments</span>
        </div>
        <h1 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#F5F0EB]">
          Browse tournaments
        </h1>

        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                tab === t.key
                  ? 'bg-[#C2542D] text-[#1C1917]'
                  : 'border border-[#2A2622] text-[#8A7F76] hover:border-[#3A3532]'
              }`}
            >
              {t.label}
              {!isLoading && <span className="ml-1.5 opacity-70">{countOf(t.key)}</span>}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-[#211D1A]" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="text-sm text-[#8A7F76]">{EMPTY_TEXT[tab]}</p>
          ) : (
            <div className="space-y-3">
              {visible.map((t) => (
                <Link
                  key={t.id}
                  to={`/tournaments/${t.id}`}
                  className="block rounded-xl border border-[#2A2622] bg-[#211D1A] p-4 transition-colors hover:border-[#3A3532]"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Outfit'] text-base font-semibold text-[#F5F0EB]">{t.name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[t.status]}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8A7F76]">
                    {t.sportType} · {t.format.replaceAll('_', ' ')} · {t.listingTitle}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}