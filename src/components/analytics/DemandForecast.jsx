/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { getForecast } from '../../services/forecastService.js';

const FLAGS = [
  { key: 'festival', label: 'Festival week' },
  { key: 'promo', label: 'Promo week' },
  { key: 'schoolHoliday', label: 'School holiday' },
];

const GROUPS = [
  { key: 'category', label: 'By category' },
  { key: 'listing', label: 'By product' },
];

function HistoryBars({ last4, current }) {
  const values = [...last4, current];
  const max = Math.max(...values, 1);
  return (
    <div className="mt-3 flex h-12 items-end gap-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={`w-full rounded-sm ${i === values.length - 1 ? 'bg-[#C2542D]' : 'bg-[#3A3532]'}`}
            style={{ height: `${Math.max((v / max) * 100, 6)}%` }}
            title={`${v} booking${v !== 1 ? 's' : ''}`}
          />
        </div>
      ))}
    </div>
  );
}

export default function DemandForecast({ listingId }) {
  const [flags, setFlags] = useState({ festival: false, promo: false, schoolHoliday: false });
  const [groupBy, setGroupBy] = useState('category');
  const [forecasts, setForecasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setIsLoading(true);
      setError('');
      try {
        const data = await getForecast({ listingId, groupBy, ...flags });
        if (!cancelled) setForecasts(data);
      } catch (err) {
        if (!cancelled) setError('Could not load the forecast.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [listingId, flags, groupBy]);

  function toggle(key) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const byProduct = groupBy === 'listing';

  return (
    <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-[#8A7F76]" />
          <h3 className="text-sm font-medium text-[#F5F0EB]">Demand forecast · this week</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {GROUPS.map((g) => (
              <button
                key={g.key}
                onClick={() => setGroupBy(g.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  groupBy === g.key
                    ? 'bg-[#C2542D] text-[#1C1917]'
                    : 'border border-[#2A2622] text-[#8A7F76] hover:border-[#3A3532]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5">
            {FLAGS.map((f) => (
              <button
                key={f.key}
                onClick={() => toggle(f.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  flags[f.key]
                    ? 'bg-[#C2542D] text-[#1C1917]'
                    : 'border border-[#2A2622] text-[#8A7F76] hover:border-[#3A3532]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {byProduct && (
        <p className="mt-3 text-[11px] text-[#6B615A]">
          Product forecasts use each listing&apos;s own booking history, so expect low confidence
          until a listing has several weeks of bookings.
        </p>
      )}

      <div className={`mt-4 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        {error && <p className="text-xs text-[#E07856]">{error}</p>}

        {!error && !isLoading && forecasts.length === 0 && (
          <p className="text-xs text-[#6B615A]">No listings to forecast yet.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {forecasts.map((f) => (
            <div
              key={f.listingId || f.category}
              className="rounded-lg border border-[#2A2622] bg-[#181512] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {f.listingTitle ? (
                    <>
                      <p className="truncate text-sm font-medium text-[#F5F0EB]">{f.listingTitle}</p>
                      <span className="text-[10px] uppercase tracking-wide text-[#6B615A]">
                        {f.category}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
                      {f.category}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-[10px] text-[#6B615A]">Week {f.weekOfYear}</span>
              </div>

              {f.available ? (
                <>
                  <p className="mt-2 font-['Outfit'] text-3xl font-semibold text-[#D4A574]">
                    {f.predictedBookings}
                    <span className="ml-1 text-xs font-normal text-[#6B615A]">bookings</span>
                  </p>
                  <p className="text-[11px] text-[#6B615A]">
                    raw estimate {f.predictedRaw?.toFixed(2)}
                  </p>

                  {f.lowConfidence && (
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-[#E07856]">
                      <AlertTriangle size={11} />
                      Low confidence, little booking history
                    </p>
                  )}

                  <HistoryBars last4={f.last4Bookings} current={f.currentBookings} />
                  <p className="mt-1 text-[10px] text-[#6B615A]">
                    Last 4 weeks, then this week so far ({f.currentBookings} booked,{' '}
                    {f.currentCustomers} renters)
                  </p>
                </>
              ) : (
                <p className="mt-3 text-xs text-[#6B615A]">
                  Forecast service is unavailable right now.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}