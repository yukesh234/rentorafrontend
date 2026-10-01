import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { getBrowsableTournaments } from '../services/tournamentService';

export default function BrowseTournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

        <div className="mt-8">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-[#211D1A]" />
              ))}
            </div>
          ) : tournaments.length === 0 ? (
            <p className="text-sm text-[#8A7F76]">No tournaments yet.</p>
          ) : (
            <div className="space-y-3">
              {tournaments.map((t) => (
                <Link
                  key={t.id}
                  to={`/tournaments/${t.id}`}
                  className="block rounded-xl border border-[#2A2622] bg-[#211D1A] p-4 transition-colors hover:border-[#3A3532]"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Outfit'] text-base font-semibold text-[#F5F0EB]">{t.name}</h3>
                    <span className="rounded-full bg-[#2A2622] px-2.5 py-1 text-xs text-[#D4A574]">
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8A7F76]">
                    {t.sportType} · {t.format.replace('_', ' ')} · {t.listingTitle}
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