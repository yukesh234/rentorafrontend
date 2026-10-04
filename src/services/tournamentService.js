import axios from '../axios/axios.js';

export async function createTournament({ bookingId, name, sportType, format, maxTeams }) {
  const res = await axios.post('/api/tournaments', { bookingId, name, sportType, format, maxTeams });
  return res.data;
}

export async function getTournament(id) {
  const res = await axios.get(`/api/tournaments/${id}`);
  return res.data;
}

export async function getBrowsableTournaments() {
  const res = await axios.get('/api/tournaments');
  return res.data;
}

export async function addTeam(tournamentId, name) {
  const res = await axios.post(`/api/tournaments/${tournamentId}/teams`, { name });
  return res.data;
}

export async function getTeams(tournamentId) {
  const res = await axios.get(`/api/tournaments/${tournamentId}/teams`);
  return res.data;
}

export async function generateBracket(tournamentId) {
  const res = await axios.post(`/api/tournaments/${tournamentId}/generate-bracket`);
  return res.data;
}

export async function getMatches(tournamentId) {
  const res = await axios.get(`/api/tournaments/${tournamentId}/matches`);
  return res.data;
}

export async function getStandings(tournamentId) {
  const res = await axios.get(`/api/tournaments/${tournamentId}/standings`);
  return res.data;
}

export async function updateMatchScore(matchId, scoreA, scoreB) {
  const res = await axios.patch(`/api/tournaments/matches/${matchId}/score`, { scoreA, scoreB });
  return res.data;
}

export async function updateMatchSchedule(matchId, scheduledAt) {
  const res = await axios.patch(`/api/tournaments/matches/${matchId}/schedule`, { scheduledAt });
  return res.data;
}

export async function getMyTournaments() {
  const res = await axios.get('/api/tournaments/my');
  return res.data;
}

export async function deleteTournament(id) {
  await axios.delete(`/api/tournaments/${id}`);
}

export async function removeTeam(tournamentId, teamId) {
  await axios.delete(`/api/tournaments/${tournamentId}/teams/${teamId}`);
}