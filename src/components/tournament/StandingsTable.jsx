export default function StandingsTable({ standings }) {
  if (standings.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2622]">
      <table className="w-full text-sm">
        <thead className="bg-[#181512] text-xs uppercase text-[#8A7F76]">
          <tr>
            <th className="px-3 py-2 text-left">Team</th>
            <th className="px-3 py-2 text-center">P</th>
            <th className="px-3 py-2 text-center">W</th>
            <th className="px-3 py-2 text-center">D</th>
            <th className="px-3 py-2 text-center">L</th>
            <th className="px-3 py-2 text-center">Pts</th>
          </tr>
        </thead>
        <tbody className="bg-[#211D1A]">
          {standings.map((row, i) => (
            <tr key={row.teamId} className={i !== standings.length - 1 ? 'border-b border-[#2A2622]' : ''}>
              <td className="px-3 py-2 text-[#F5F0EB]">{row.teamName}</td>
              <td className="px-3 py-2 text-center text-[#8A7F76]">{row.played}</td>
              <td className="px-3 py-2 text-center text-[#8A7F76]">{row.wins}</td>
              <td className="px-3 py-2 text-center text-[#8A7F76]">{row.draws}</td>
              <td className="px-3 py-2 text-center text-[#8A7F76]">{row.losses}</td>
              <td className="px-3 py-2 text-center font-semibold text-[#D4A574]">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}