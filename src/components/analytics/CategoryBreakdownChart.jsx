const CATEGORY_COLORS = {
  UTILITY: '#D4A574',
  SPORTS: '#C2542D',
  ENTERTAINMENT: '#8A7F76',
};

export default function CategoryBreakdownChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.bookingCount, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
        <h3 className="mb-3 text-sm font-medium text-[#F5F0EB]">By category</h3>
        <p className="text-xs text-[#6B615A]">No bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
      <h3 className="mb-3 text-sm font-medium text-[#F5F0EB]">By category</h3>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#181512]">
        {data.map((d) => (
          <div
            key={d.category}
            style={{
              width: `${(d.bookingCount / total) * 100}%`,
              backgroundColor: CATEGORY_COLORS[d.category] || '#8A7F76',
            }}
          />
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {data.map((d) => (
          <div key={d.category} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#D9CFC6]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[d.category] || '#8A7F76' }}
              />
              {d.category}
            </span>
            <span className="text-[#8A7F76]">
              {d.bookingCount} ({((d.bookingCount / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}