/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Users, Plus, Loader2, Shuffle } from 'lucide-react';
import {
  getTournament, getTeams, addTeam, generateBracket, getMatches, getStandings, updateMatchScore,
} from '../services/tournamentService';
import { useAuthStore } from '../stores/Authstore';
import BracketView from '../components/tournament/BracketView';
import StandingsTable from '../components/tournament/StandingsTable';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const userId = useAuthStore((s) => s.user?.userid);

  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newTeamName, setNewTeamName] = useState('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const isOrganizer = tournament && userId === tournament.organizerId;
  const isStandingsFormat = tournament?.format === 'ROUND_ROBIN' || tournament?.format === 'LEAGUE';
  const authIsLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (authIsLoading) return; 
    fetchAll();
  }, [id, authIsLoading]);

  async function fetchAll() {
    setIsLoading(true);
    try {
      const t = await getTournament(id);
      setTournament(t);
      const teamsData = await getTeams(id);
      setTeams(teamsData);
      if (t.status !== 'PLANNED') {
        const matchesData = await getMatches(id);
        setMatches(matchesData);
        if (t.format === 'ROUND_ROBIN' || t.format === 'LEAGUE') {
          const standingsData = await getStandings(id);
          setStandings(standingsData);
        }
      }
    } catch (err) {
      console.error('Failed to load tournament', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddTeam(e) {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setError('');
    setIsAddingTeam(true);
    try {
      const team = await addTeam(id, newTeamName.trim());
      setTeams((prev) => [...prev, team]);
      setNewTeamName('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not add team.');
    } finally {
      setIsAddingTeam(false);
    }
  }

  async function handleGenerateBracket() {
    setError('');
    setIsGenerating(true);
    try {
      await generateBracket(id);
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not generate bracket.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleScoreUpdate(matchId, scoreA, scoreB) {
    const updated = await updateMatchScore(matchId, scoreA, scoreB);
    await fetchAll(); // refetch — winners may have advanced, standings changed
    return updated;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1C1917]">
        <Loader2 size={28} className="animate-spin text-[#D4A574]" />
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="min-h-screen bg-[#1C1917] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-2 text-[#8A7F76]">
          <Trophy size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">{tournament.sportType}</span>
        </div>
        <h1 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#F5F0EB]">
          {tournament.name}
        </h1>
        <p className="mt-1 text-xs text-[#6B615A]">
          {tournament.listingTitle} · Organized by {tournament.organizerName} ·{' '}
          {tournament.format.replace('_', ' ')} · {tournament.status}
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-[#3A1F1A] px-3 py-2 text-sm text-[#E07856]">{error}</p>
        )}

        {tournament.status === 'PLANNED' && (
          <div className="mt-6 rounded-xl border border-[#2A2622] bg-[#211D1A] p-5">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-[#8A7F76]" />
              <h2 className="text-sm font-semibold text-[#F5F0EB]">
                Teams ({teams.length}/{tournament.maxTeams})
              </h2>
            </div>

            <div className="mt-3 space-y-1.5">
              {teams.map((team) => (
                <div key={team.id} className="rounded-lg bg-[#181512] px-3 py-2 text-sm text-[#D9CFC6]">
                  {team.name}
                </div>
              ))}
            </div>

            {isOrganizer && teams.length < tournament.maxTeams && (
              <form onSubmit={handleAddTeam} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team name"
                  className="w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] placeholder:text-[#5A524A] outline-none focus:border-[#C2542D]/60"
                />
                <button
                  type="submit"
                  disabled={isAddingTeam}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#C2542D] px-4 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#D4A574] disabled:opacity-50"
                >
                  {isAddingTeam ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Add
                </button>
              </form>
            )}

            {isOrganizer && teams.length >= 2 && (
              <button
                onClick={handleGenerateBracket}
                disabled={isGenerating}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#C2542D]/50 py-2.5 text-sm font-medium text-[#D4A574] hover:bg-[#C2542D]/10 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Shuffle size={14} />}
                {isGenerating ? 'Generating…' : 'Generate bracket'}
              </button>
            )}
          </div>
        )}

        {tournament.status !== 'PLANNED' && isStandingsFormat && (
          <div className="mt-6">
            <StandingsTable standings={standings} />
          </div>
        )}

        {tournament.status !== 'PLANNED' && (
          <div className="mt-6">
            <BracketView
              matches={matches}
              format={tournament.format}
              isOrganizer={isOrganizer}
              onScoreUpdate={handleScoreUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}