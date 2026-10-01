import { useState } from 'react';
import { Filter, Calendar } from 'lucide-react';

const PRESETS = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

/**
 * Controlled component: the selection lives in the parent (`value`),
 * so it can never be lost if this component remounts.
 *
 * value: { listingId: string, preset: number | null, customStart: string, customEnd: string }
 * onChange: (partial) => void
 */
export default function AnalyticsFilters({ listings, value, onChange }) {
  const [draftStart, setDraftStart] = useState(value.customStart);
  const [draftEnd, setDraftEnd] = useState(value.customEnd);

  function applyCustomRange() {
    if (!draftStart || !draftEnd) return;
    onChange({ preset: null, customStart: draftStart, customEnd: draftEnd });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2A2622] bg-[#211D1A] p-3">
      <div className="flex items-center gap-1.5 text-xs text-[#8A7F76]">
        <Filter size={13} />
        Filters
      </div>

      <select
        value={value.listingId}
        onChange={(e) => onChange({ listingId: e.target.value })}
        className="rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-1.5 text-xs text-[#F5F0EB] outline-none focus:border-[#C2542D]/60"
      >
        <option value="">All listings</option>
        {listings.map((l) => (
          <option key={l.id} value={l.id}>{l.title}</option>
        ))}
      </select>

      <div className="flex gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.days}
            onClick={() => onChange({ preset: p.days })}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              value.preset === p.days
                ? 'bg-[#C2542D] text-[#1C1917]'
                : 'border border-[#2A2622] text-[#8A7F76] hover:border-[#3A3532]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <Calendar size={13} className="text-[#8A7F76]" />
        <input
          type="date"
          value={draftStart}
          onChange={(e) => setDraftStart(e.target.value)}
          className="rounded-lg border border-[#2A2622] bg-[#181512] px-2 py-1.5 text-xs text-[#F5F0EB] outline-none focus:border-[#C2542D]/60"
        />
        <span className="text-xs text-[#6B615A]">to</span>
        <input
          type="date"
          value={draftEnd}
          onChange={(e) => setDraftEnd(e.target.value)}
          className="rounded-lg border border-[#2A2622] bg-[#181512] px-2 py-1.5 text-xs text-[#F5F0EB] outline-none focus:border-[#C2542D]/60"
        />
        <button
          onClick={applyCustomRange}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium text-[#D4A574] hover:bg-[#2A2622] ${
            value.preset === null ? 'border-[#C2542D]' : 'border-[#2A2622]'
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  );
}