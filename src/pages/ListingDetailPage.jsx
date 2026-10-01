/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { MapPin, Clock, Loader2, Heart } from 'lucide-react';
import { getListingById } from '../services/listingService';
import { getReviewsForListing } from '../services/reviewService';
import ImageGallery from '../components/listing/ImageGallery';
import RatingSummary from '../components/listing/RatingSummary';
import ReviewsList from '../components/listing/ReviewsList';
import BookingModal from '../components/booking/BookingModal';

const CATEGORY_LABELS = {
  UTILITY: 'Utility',
  SPORTS: 'Sports',
  ENTERTAINMENT: 'Entertainment',
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, openAuth } = useOutletContext();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      setIsLoading(true);
      setLoadError('');
      try {
        const [listingData, reviewsData] = await Promise.all([
          getListingById(id),
          getReviewsForListing(id),
        ]);
        if (cancelled) return;
        setListing(listingData);
        setReviews(reviewsData);
      } catch (err) {
        if (!cancelled) setLoadError('This listing could not be found.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleBookNow() {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    setBookingOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1C1917]">
        <Loader2 size={28} className="animate-spin text-[#D4A574]" />
      </div>
    );
  }

  if (loadError || !listing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1C1917] px-4 text-center">
        <p className="text-sm text-[#E07856]">{loadError || 'Listing not found.'}</p>
      </div>
    );
  }

  const isOutOfStock = listing.quantity <= 0;

  return (
    <div className="min-h-screen bg-[#1C1917] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <ImageGallery images={listing.imageUrls} title={listing.title} />

          <div className="mt-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
                  {CATEGORY_LABELS[listing.category] || listing.category}
                </span>
                <h1 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#F5F0EB]">
                  {listing.title}
                </h1>
              </div>
              <button
                aria-label="Save listing"
                className="rounded-full border border-[#2A2622] p-2 text-[#8A7F76] transition-colors hover:border-[#3A3532] hover:text-[#D4A574]"
              >
                <Heart size={17} />
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <RatingSummary averageRating={listing.averageRating} reviewCount={listing.reviewCount} />
              <div className="flex items-center gap-1 text-xs text-[#8A7F76]">
                <MapPin size={13} />
                {listing.city}, {listing.district}
              </div>
              {listing.openingTime && listing.closingTime && (
                <div className="flex items-center gap-1 text-xs text-[#8A7F76]">
                  <Clock size={13} />
                  {listing.openingTime.slice(0, 5)} – {listing.closingTime.slice(0, 5)}
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#2A2622]">
                {listing.owner.profile_picture ? (
                  <img
                    src={listing.owner.profile_picture}
                    alt={listing.owner.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-[#D4A574]">
                    {listing.owner.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-[#F5F0EB]">{listing.owner.name}</p>
                <p className="text-xs text-[#6B615A]">Listing owner</p>
              </div>
            </div>

            <div className="mt-6 border-t border-[#2A2622] pt-6">
              <h2 className="text-sm font-semibold text-[#F5F0EB]">About this listing</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#A89A8C]">
                {listing.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-[#F5F0EB]">
                Reviews ({listing.reviewCount})
              </h2>
              <ReviewsList reviews={reviews} />
            </div>
          </div>
        </div>

        <div className="h-fit rounded-xl border border-[#2A2622] bg-[#211D1A] p-5 lg:sticky lg:top-24">
          <div className="flex items-baseline gap-1">
            <span className="font-['Outfit'] text-2xl font-semibold text-[#D4A574]">
              Rs. {listing.pricePerUnit}
            </span>
            <span className="text-sm text-[#8A7F76]">/ {listing.priceUnit}</span>
          </div>

          <p className="mt-1 text-xs text-[#6B615A]">
            {isOutOfStock ? 'Currently out of stock' : `${listing.quantity} available`}
          </p>

          <button
            onClick={handleBookNow}
            disabled={isOutOfStock}
            className={`mt-4 flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              isOutOfStock
                ? 'cursor-not-allowed bg-white/10 text-white/40'
                : 'bg-[#C2542D] text-[#1C1917] hover:bg-[#D4A574]'
            }`}
          >
            {isOutOfStock ? 'Out of stock' : 'Book now'}
          </button>
        </div>
      </div>

      {bookingOpen && (
        <BookingModal listing={listing} onClose={() => setBookingOpen(false)} />
      )}
    </div>
  );
}