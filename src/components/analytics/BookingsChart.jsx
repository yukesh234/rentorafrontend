import { useMemo, useState } from 'react';

const METRICS = [
  { key: 'bookingCount', label: 'Bookings' },
  { key: 'revenue', label: 'Revenue' },
];

export default function BookingsChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [metric, setMetric] = useState('bookingCount');

  const { points, width, height } = useMemo(() => {
    const w = 600;
    const h = 180;
    const values = data.map((d) => Number(d[metric]) || 0);
    const max = Math.max(...values, 1);
    const stepX = data.length > 1 ? w / (data.length - 1) : 0;
    const pts = data.map((d, i) => ({
      x: i * stepX,
      y: h - (values[i] / max) * (h - 20) - 10,
      value: values[i],
      ...d,
    }));
    return { points: pts, width: w, height: h };
  }, [data, metric]);

  const header = (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-medium text-[#F5F0EB]">
        {metric === 'revenue' ? 'Revenue over time' : 'Bookings over time'}
      </h3>
      <div className="flex gap-1">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              metric === m.key
                ? 'bg-[#C2542D] text-[#1C1917]'
                : 'border border-[#2A2622] text-[#8A7F76] hover:border-[#3A3532]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
        {header}
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
  const total = points.reduce((sum, p) => sum + p.value, 0);
  const peak = points.reduce((best, p) => (p.value > best.value ? p : best), points[0]);

  return (
    <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
      {header}

      <div className="mb-2 flex items-start justify-between text-xs">
        <div className="text-[#6B615A]">
          Total{' '}
          <span className="font-medium text-[#D4A574]">
            {metric === 'revenue' ? `Rs. ${total.toLocaleString()}` : total}
          </span>
          {peak.value > 0 && (
            <>
              {' · '}Peak <span className="text-[#D9CFC6]">{peak.date}</span>
            </>
          )}
        </div>
        {hovered && (
          <div className="text-right">
            <p className="font-medium text-[#D4A574]">
              {metric === 'revenue'
                ? `Rs. ${hovered.value.toLocaleString()}`
                : `${hovered.value} booking${hovered.value !== 1 ? 's' : ''}`}
            </p>
            <p className="text-[#6B615A]">{hovered.date}</p>
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
        <path d={areaD} fill="#C2542D" opacity="0.1" />
        <path d={pathD} fill="none" stroke="#C2542D" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {hovered && (
          <>
            <line x1={hovered.x} y1="0" x2={hovered.x} y2={height} stroke="#3A3532" strokeWidth="1" strokeDasharray="3,3" vectorEffect="non-scaling-stroke" />
            <circle cx={hovered.x} cy={hovered.y} r="4" fill="#C2542D" stroke="#211D1A" strokeWidth="2" />
          </>
        )}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-[#6B615A]">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}