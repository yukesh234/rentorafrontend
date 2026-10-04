/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Users, Plus, Loader2, Shuffle, X } from 'lucide-react';
import {
  getTournament, getTeams, addTeam, removeTeam, generateBracket, getMatches,
  getStandings, updateMatchScore, updateMatchSchedule,
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
  const [removingId, setRemovingId] = useState(null);
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

  async function handleRemoveTeam(teamId) {
    setError('');
    setRemovingId(teamId);
    try {
      await removeTeam(id, teamId);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not remove team.');
    } finally {
      setRemovingId(null);
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
    await fetchAll(); // refetch: winners/losers may have moved, standings changed
    return updated;
  }

  async function handleScheduleUpdate(matchId, scheduledAt) {
    const updated = await updateMatchSchedule(matchId, scheduledAt);
    // only one match changed, so patch it locally instead of reloading the page
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
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

  const myTeam = teams.find((t) => t.registeredById === userId);
  const isFull = teams.length >= tournament.maxTeams;
  // the organizer can add any number of teams, everyone else gets one
    const canRegister = !!userId && !isFull && (isOrganizer || !myTeam);
  const needsMoreTeamsForFormat = tournament.format === 'DOUBLE_ELIMINATION' && teams.length < 3;

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
              {teams.length === 0 && (
                <p className="text-xs text-[#6B615A]">No teams registered yet.</p>
              )}
              {teams.map((team) => {
                const isMine = team.registeredById === userId;
                const canRemove = isOrganizer || isMine;
                return (
                  <div
                    key={team.id}
                    className="flex items-center justify-between rounded-lg bg-[#181512] px-3 py-2 text-sm text-[#D9CFC6]"
                  >
                    <span>
                      {team.name}
                      {isMine && <span className="ml-2 text-[11px] text-[#D4A574]">(your team)</span>}
                    </span>
                    {canRemove && (
                      <button
                        onClick={() => handleRemoveTeam(team.id)}
                        disabled={removingId === team.id}
                        className="rounded p-1 text-[#8A7F76] transition-colors hover:bg-[#3A1F1A] hover:text-[#E07856] disabled:opacity-50"
                        aria-label={`Remove ${team.name}`}
                      >
                        {removingId === team.id ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {canRegister && (
              <form onSubmit={handleAddTeam} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder={isOrganizer ? 'Team name' : 'Your team name'}
                  className="w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] placeholder:text-[#5A524A] outline-none focus:border-[#C2542D]/60"
                />
                <button
                  type="submit"
                  disabled={isAddingTeam}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#C2542D] px-4 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#D4A574] disabled:opacity-50"
                >
                  {isAddingTeam ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {isOrganizer ? 'Add' : 'Register'}
                </button>
              </form>
            )}

            {!isOrganizer && isFull && !myTeam && (
              <p className="mt-3 text-xs text-[#6B615A]">This tournament is full.</p>
            )}
            {!isOrganizer && myTeam && (
              <p className="mt-3 text-xs text-[#6B615A]">
                You're registered. The organizer will generate the bracket once enough teams have joined.
              </p>
            )}

            {isOrganizer && teams.length >= 2 && (
              <>
                <button
                  onClick={handleGenerateBracket}
                  disabled={isGenerating || needsMoreTeamsForFormat}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#C2542D]/50 py-2.5 text-sm font-medium text-[#D4A574] hover:bg-[#C2542D]/10 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Shuffle size={14} />}
                  {isGenerating ? 'Generating…' : 'Generate bracket'}
                </button>
                {needsMoreTeamsForFormat && (
                  <p className="mt-1.5 text-center text-[11px] text-[#6B615A]">
                    Double elimination needs at least 3 teams.
                  </p>
                )}
              </>
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
              onScheduleUpdate={handleScheduleUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}