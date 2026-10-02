/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import {
  BarChart3, Calendar, DollarSign, XCircle, AlertCircle, Download,
  Receipt, Users, Repeat, Wallet,
} from 'lucide-react';
import {
  getSummary, getBookingsOverTime, getCategoryBreakdown, getBusiestDays,
  getTopListings, getListingOptions,
} from '../services/analyticsService';
import { exportToCsv } from '../utils/exportCsv';
import SummaryCard from '../components/analytics/SummaryCard';
import BookingsChart from '../components/analytics/BookingsChart';
import CategoryBreakdownChart from '../components/analytics/CategoryBreakdownChart';
import BusiestDaysChart from '../components/analytics/BusiestDaysChart';
import TopListingsTable from '../components/analytics/TopListingsTable';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import DemandForecast from '../components/analytics/DemandForecast';
import { useAuthStore } from '../stores/Authstore';

// Turns the UI selection into the params the API expects
function toRequestFilters(fs) {
  let startDate;
  let endDate;

  if (fs.preset !== null) {
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - (fs.preset - 1));
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date(fs.customStart);
    endDate = new Date(fs.customEnd);
    endDate.setHours(23, 59, 59, 999); // include the whole end day
  }

  return { listingId: fs.listingId || null, startDate, endDate };
}

// % change vs the previous period.
// undefined = nothing to show, null = previous period had no data, number = % change
function percentChange(current, previous) {
  if (previous === null || previous === undefined) return undefined;
  const cur = Number(current);
  const prev = Number(previous);
  if (!Number.isFinite(cur) || !Number.isFinite(prev)) return undefined;
  if (prev === 0) return cur === 0 ? 0 : null;
  return ((cur - prev) / prev) * 100;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [busiestDays, setBusiestDays] = useState([]);
  const [topListings, setTopListings] = useState([]);
  const [listingOptions, setListingOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const authIsLoading = useAuthStore((s) => s.isLoading);

  // Single source of truth for what the user picked
  const [filterState, setFilterState] = useState({
    listingId: '',
    preset: 30,
    customStart: '',
    customEnd: '',
  });

  function updateFilters(partial) {
    setFilterState((prev) => ({ ...prev, ...partial }));
  }

  // Loads the dropdown options and top listings once
  useEffect(() => {
    if (authIsLoading) return; // wait for the silent-refresh attempt to resolve first
    async function fetchStatic() {
      try {
        const [listingsData, topData] = await Promise.all([
          getListingOptions(),
          getTopListings(5),
        ]);
        setListingOptions(listingsData);
        setTopListings(topData);
      } catch (err) {
        console.error('Failed to load listing options', err);
      }
    }
    fetchStatic();
  }, [authIsLoading]);

  // Refetches whenever the user changes a filter
  useEffect(() => {
    if (authIsLoading) return; // don't fire before the access token is ready

    let cancelled = false; // stops an older, slower response overwriting a newer one

    async function run() {
      setIsLoading(true);
      try {
        const f = toRequestFilters(filterState);
        const [summaryData, seriesData, catData, daysData] = await Promise.all([
          getSummary(f),
          getBookingsOverTime(f),
          getCategoryBreakdown(f),
          getBusiestDays(f),
        ]);
        if (cancelled) return;
        setSummary(summaryData);
        setTimeSeries(seriesData);
        setCategoryData(catData);
        setBusiestDays(daysData);
      } catch (err) {
        if (!cancelled) console.error('Failed to load analytics', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [filterState, authIsLoading]);

  function handleExport() {
    exportToCsv(
      'rentora-bookings-over-time.csv',
      timeSeries.map((d) => ({
        date: d.date,
        bookingCount: d.bookingCount,
        revenue: d.revenue,
      }))
    );
  }

  const isFirstLoad = !summary;

  return (
    <div className="min-h-screen bg-[#1C1917] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#8A7F76]">
              <BarChart3 size={16} />
              <span className="text-xs font-medium uppercase tracking-wider">Owner dashboard</span>
            </div>
            <h1 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#F5F0EB]">
              Analytics
            </h1>
          </div>
          <button
            onClick={handleExport}
            disabled={timeSeries.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-[#2A2622] px-3 py-2 text-xs font-medium text-[#D4A574] transition-colors hover:bg-[#2A2622] disabled:opacity-50"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>

        {/* Always rendered, never swapped out for a skeleton */}
        <div className="mt-4">
          <AnalyticsFilters
            listings={listingOptions}
            value={filterState}
            onChange={updateFilters}
          />
        </div>

        {isFirstLoad ? (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-[#211D1A]" />
              ))}
            </div>
            <div className="h-56 animate-pulse rounded-xl bg-[#211D1A]" />
          </div>
        ) : (
          <div className={`transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <SummaryCard
                icon={Calendar}
                label="Total bookings"
                value={summary.totalBookings}
                sublabel={`${summary.confirmedBookings} confirmed`}
                delta={percentChange(summary.totalBookings, summary.previousTotalBookings)}
              />
              <SummaryCard
                icon={DollarSign}
                label="Total revenue"
                value={`Rs. ${summary.totalRevenue}`}
                delta={percentChange(summary.totalRevenue, summary.previousRevenue)}
              />
              <SummaryCard
                icon={XCircle}
                label="Cancellation rate"
                value={`${(summary.cancellationRate * 100).toFixed(0)}%`}
                sublabel={`${summary.cancelledBookings} cancelled`}
                tone={summary.cancellationRate > 0.2 ? 'danger' : 'default'}
              />
              <SummaryCard
                icon={AlertCircle}
                label="Outstanding cash"
                value={`Rs. ${summary.outstandingCash}`}
                sublabel="not yet marked paid"
                tone={Number(summary.outstandingCash) > 0 ? 'danger' : 'success'}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <SummaryCard
                icon={Receipt}
                label="Avg booking value"
                value={`Rs. ${Number(summary.averageBookingValue).toLocaleString()}`}
                sublabel="excluding cancelled"
              />
              <SummaryCard
                icon={Users}
                label="Unique renters"
                value={summary.uniqueRenters}
                sublabel="in this range"
              />
              <SummaryCard
                icon={Repeat}
                label="Repeat renters"
                value={`${(summary.repeatRenterRate * 100).toFixed(0)}%`}
                sublabel="booked 2+ times"
              />
              <SummaryCard
                icon={Wallet}
                label="Cash / eSewa"
                value={`${summary.cashBookings} / ${summary.esewaBookings}`}
                sublabel="bookings by payment"
              />
            </div>

            {Number(summary.refundsOwed) > 0 && (
              <div className="mt-4 rounded-lg border border-[#E07856]/30 bg-[#3A1F1A] px-4 py-3 text-sm text-[#E07856]">
                Rs. {summary.refundsOwed} in refunds owed for cancelled eSewa bookings.
              </div>
            )}

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <BookingsChart data={timeSeries} />
              </div>
              <CategoryBreakdownChart data={categoryData} />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <BusiestDaysChart data={busiestDays} />
              <TopListingsTable listings={topListings} />
            </div>

            <div className="mt-4">
              <DemandForecast listingId={filterState.listingId || null} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}