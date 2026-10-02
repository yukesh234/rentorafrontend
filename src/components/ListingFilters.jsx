import { Search, X } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "UTILITY", label: "Utility" },
  { value: "SPORTS", label: "Sports" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const inputClass =
  "rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[13px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-white/25";

/**
 * Controlled filter bar: the parent owns `value`
 * ({ q, category, minPrice, maxPrice, sort }) and decides when to fetch.
 */
export default function ListingFilters({ value, onChange, onClear, hasFilters }) {
  return (
    <div className="rt-font-body space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={value.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Search by name, description or city"
            className={`${inputClass} w-full pl-9`}
          />
        </div>

        <select
          value={value.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
          className={inputClass}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#262019]">
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={value.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            placeholder="Min Rs."
            className={`${inputClass} w-24`}
          />
          <span className="text-xs text-white/35">to</span>
          <input
            type="number"
            min="0"
            value={value.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            placeholder="Max Rs."
            className={`${inputClass} w-24`}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange({ category: c.value })}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              value.category === c.value
                ? "bg-[#C2542D] text-[#1C1917]"
                : "border border-white/10 text-white/60 hover:border-white/20 hover:text-white"
            }`}
          >
            {c.label}
          </button>
        ))}

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="ml-1 flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white"
          >
            <X size={13} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}