import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";
import ListingFilters from "../components/ListingFilters.jsx";
// import toast from "react-hot-toast";
import api from "../axios/axios.js";
import { useAuthStore } from "../stores/Authstore.js";
import BookingModal from "../components/booking/BookingModal.jsx";

const DEFAULT_FILTERS = { q: "", category: "", minPrice: "", maxPrice: "", sort: "newest" };

function HomePage() {
  const { isAuthenticated, openAuth } = useOutletContext();
  const authIsLoading = useAuthStore((s) => s.isLoading);

  const [favorites, setFavorites] = useState(new Set());
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingListing, setBookingListing] = useState(null);

  // `filters` updates on every keystroke; `appliedFilters` follows it after a short pause
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    const timer = setTimeout(() => setAppliedFilters(filters), 400);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    if (authIsLoading) return; // wait for the silent-refresh attempt to resolve first

    let isMounted = true;

    async function fetchListings() {
      const params = {};
      if (appliedFilters.q.trim()) params.q = appliedFilters.q.trim();
      if (appliedFilters.category) params.category = appliedFilters.category;
      if (appliedFilters.minPrice !== "") params.minPrice = appliedFilters.minPrice;
      if (appliedFilters.maxPrice !== "") params.maxPrice = appliedFilters.maxPrice;
      if (appliedFilters.sort && appliedFilters.sort !== "newest") params.sort = appliedFilters.sort;

      try {
        const res = await api.get("/api/v1/listings", { params });
        if (isMounted) setListings(res.data);
      } catch (err) {
        console.error("Failed to load listings", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchListings();

    return () => {
      isMounted = false;
    };
  }, [authIsLoading, appliedFilters]); // re-runs when the silent refresh finishes or a filter changes

  const hasFilters =
    filters.q !== "" ||
    filters.category !== "" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.sort !== "newest";

  const updateFilters = (partial) => setFilters((prev) => ({ ...prev, ...partial }));
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const handleBookNow = (listing) => {
    if (!isAuthenticated) {
      openAuth("login");
      return;
    }
    setBookingListing(listing);
  };

  const handleToggleFavorite = (listing) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(listing.id) ? next.delete(listing.id) : next.add(listing.id);
      return next;
    });
  };

  return (
    <>
      <section className="relative overflow-hidden px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <div className="rt-glow pointer-events-none absolute left-1/2 top-0 h-72 w-xl -translate-x-1/2 blur-3xl" />
        <div className="relative mx-auto max-w-7xl rt-font-body">
          <h1 className="rt-font-display text-[28px] font-semibold text-white sm:text-[34px]">
            Find your next stay or venue in{" "}
            <span className="rt-gradient-text">Nepal</span>
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-white/50">
            Apartments, rooms, villas, and event halls — booked directly,
            hosted locally.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <ListingFilters
          value={filters}
          onChange={updateFilters}
          onClear={clearFilters}
          hasFilters={hasFilters}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-4/3 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center">
            <p className="text-sm text-white/40">
              {hasFilters
                ? "No listings match your filters."
                : "No listings available right now. Check back soon."}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={{ ...listing, isFavorite: favorites.has(listing.id) }}
                onBookNow={handleBookNow}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      {bookingListing && (
        <BookingModal
          listing={bookingListing}
          onClose={() => setBookingListing(null)}
        />
      )}
    </>
  );
}

export default HomePage;