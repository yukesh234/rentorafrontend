/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Trash2, Loader2 } from 'lucide-react';
import { getMyTournaments, deleteTournament } from '../services/tournamentService';
import { useAuthStore } from '../stores/Authstore';

const STATUS_STYLES = {
  PLANNED: 'bg-yellow-500/15 text-yellow-400',
  ONGOING: 'bg-green-500/15 text-green-400',
  COMPLETED: 'bg-blue-500/15 text-blue-400',
  CANCELLED: 'bg-red-500/15 text-red-400',
};

export default function OwnerTournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState('');
  const authIsLoading = useAuthStore((s) => s.isLoading);
  

  useEffect(() => {
    if (authIsLoading) return;
    fetchTournaments();
  }, [authIsLoading]);

  async function fetchTournaments() {
    setIsLoading(true);
    try {
      const data = await getMyTournaments();
      setTournaments(data);
    } catch (err) {
      console.error('Failed to load tournaments', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    setDeletingId(id);
    try {
      await deleteTournament(id);
      setTournaments((prev) => prev.filter((t) => t.id !== id));
      setPendingDelete(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete this tournament.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1917] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-[#8A7F76]">
          <Trophy size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">Organizer dashboard</span>
        </div>
        <h1 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#F5F0EB]">
          Your tournaments
        </h1>

        {error && (
          <p className="mt-4 rounded-lg bg-[#3A1F1A] px-3 py-2 text-sm text-[#E07856]">{error}</p>
        )}

        <div className="mt-8 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-[#211D1A]" />
            ))
          ) : tournaments.length === 0 ? (
            <p className="text-sm text-[#8A7F76]">You haven't organized any tournaments yet.</p>
          ) : (
            tournaments.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-[#2A2622] bg-[#211D1A] p-4"
              >
                <Link to={`/tournaments/${t.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-['Outfit'] text-base font-semibold text-[#F5F0EB]">
                      {t.name}
                    </h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[t.status]}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8A7F76]">
                    {t.sportType} · {t.format.replace('_', ' ')} · {t.listingTitle}
                  </p>
                </Link>

                <button
                        onClick={() => setPendingDelete(t)}
                        disabled={t.status !== 'PLANNED'}
                        className="ml-3 shrink-0 rounded-lg p-2 text-[#A89A8C] transition-colors hover:bg-[#3A1F1A] hover:text-[#E07856] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#A89A8C] disabled:cursor-not-allowed"
                        aria-label={t.status === 'PLANNED' ? 'Delete tournament' : 'Cannot delete a tournament that has started'}
                        title={t.status === 'PLANNED' ? undefined : "Can't delete — bracket has already been generated"}
                >
                    <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#2A2622] bg-[#211D1A] p-6">
            <h3 className="font-['Outfit'] text-base font-semibold text-[#F5F0EB]">
              Delete "{pendingDelete.name}"?
            </h3>
            <p className="mt-2 text-sm text-[#A89A8C]">
              This will permanently remove the tournament, its teams, and all match results. This can't be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deletingId === pendingDelete.id}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#A89A8C] transition-colors hover:bg-[#2A2622] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(pendingDelete.id)}
                disabled={deletingId === pendingDelete.id}
                className="flex items-center gap-1.5 rounded-lg bg-[#C23D2D] px-4 py-2 text-sm font-medium text-[#F5F0EB] transition-colors hover:bg-[#A8331F] disabled:opacity-50"
              >
                {deletingId === pendingDelete.id ? <Loader2 size={14} className="animate-spin" /> : null}
                {deletingId === pendingDelete.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}