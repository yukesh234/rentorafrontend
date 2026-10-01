import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";
// import toast from "react-hot-toast";
import api from "../axios/axios.js";
import { useAuthStore } from "../stores/Authstore.js";
import BookingModal from "../components/booking/BookingModal.jsx";

function HomePage() {
  const { isAuthenticated, openAuth } = useOutletContext();
  const authIsLoading = useAuthStore((s) => s.isLoading);

  const [favorites, setFavorites] = useState(new Set());
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingListing, setBookingListing] = useState(null);

  useEffect(() => {
    if (authIsLoading) return; // wait for the silent-refresh attempt to resolve first

    let isMounted = true;

    async function fetchListings() {
      try {
        const res = await api.get("/api/v1/listings");
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
  }, [authIsLoading]); // re-runs once authIsLoading flips from true -> false

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

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-4/3 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <p className="text-center text-sm text-white/40">
            No listings available right now. Check back soon.
          </p>
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