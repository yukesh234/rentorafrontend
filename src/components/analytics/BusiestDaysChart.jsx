export default function BusiestDaysChart({ data }) {
  const max = Math.max(...data.map((d) => d.bookingCount), 0);

  if (data.length === 0 || max === 0) {
    return (
      <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
        <h3 className="mb-3 text-sm font-medium text-[#F5F0EB]">Busiest days</h3>
        <p className="text-xs text-[#6B615A]">No bookings in this range.</p>
      </div>
    );
  }

  const busiest = data.reduce((best, d) => (d.bookingCount > best.bookingCount ? d : best), data[0]);

  return (
    <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
      <h3 className="text-sm font-medium text-[#F5F0EB]">Busiest days</h3>
      <p className="mt-0.5 text-xs text-[#6B615A]">
        Weekdays your rentals start on. Busiest: <span className="text-[#D4A574]">{busiest.day}</span>
      </p>

      <div className="mt-4 flex h-28 items-end gap-2">
        {data.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] text-[#8A7F76]">{d.bookingCount}</span>
            <div
              className={`w-full rounded-sm ${d.day === busiest.day ? 'bg-[#C2542D]' : 'bg-[#3A3532]'}`}
              style={{ height: `${Math.max((d.bookingCount / max) * 100, 4)}%` }}
              title={`${d.bookingCount} booking${d.bookingCount !== 1 ? 's' : ''}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2">
        {data.map((d) => (
          <span key={d.day} className="flex-1 text-center text-[10px] text-[#6B615A]">
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}