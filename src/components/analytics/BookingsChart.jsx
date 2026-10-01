import { useMemo, useState } from 'react';

export default function BookingsChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const { points, width, height } = useMemo(() => {
    const w = 600;
    const h = 180;
    const max = Math.max(...data.map((d) => d.bookingCount), 1);
    const stepX = data.length > 1 ? w / (data.length - 1) : 0;
    const pts = data.map((d, i) => ({
      x: i * stepX,
      y: h - (d.bookingCount / max) * (h - 20) - 10,
      ...d,
    }));
    return { points: pts, width: w, height: h };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
        <h3 className="mb-3 text-sm font-medium text-[#F5F0EB]">Bookings over time</h3>
        <p className="text-xs text-[#6B615A]">No data for this range.</p>
      </div>
    );
  }

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;

  function handleMouseMove(e) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = 0;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#F5F0EB]">Bookings over time</h3>
        {hovered && (
          <div className="text-right text-xs">
            <p className="text-[#D4A574] font-medium">{hovered.bookingCount} booking{hovered.bookingCount !== 1 ? 's' : ''}</p>
            <p className="text-[#6B615A]">{hovered.date} · Rs. {hovered.revenue}</p>
          </div>
        )}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full cursor-crosshair"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <path d={areaD} fill="url(#bookingsGradient)" opacity="0.15" />
        <path d={pathD} fill="none" stroke="#C2542D" strokeWidth="2" />
        {hovered && (
          <>
            <line x1={hovered.x} y1="0" x2={hovered.x} y2={height} stroke="#3A3532" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx={hovered.x} cy={hovered.y} r="4" fill="#C2542D" stroke="#211D1A" strokeWidth="2" />
          </>
        )}
        <defs>
          <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C2542D" />
            <stop offset="100%" stopColor="#C2542D" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-[#6B615A]">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}