import { CalendarDays, Package, Loader2, Radio, Star, ChevronDown, ImageOff, Trophy, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { submitReview } from '../../services/reviewService';
import { initiatePayment } from '../../services/paymentService';
import EsewaRedirectForm from '../payment/EsewaRedirectionForm';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-500/15 text-yellow-400',
  CONFIRMED: 'bg-green-500/15 text-green-400',
  CANCELLED: 'bg-red-500/15 text-red-400',
  COMPLETED: 'bg-blue-500/15 text-blue-400',
};

const LIVE_ELIGIBLE_CATEGORIES = ['ENTERTAINMENT', 'SPORTS'];

// must match UNPAID_ESEWA_TTL in BookingLifecycleScheduler (30 minutes)
const UNPAID_ESEWA_TTL_MS = 30 * 60 * 1000;

export default function BookingCard({ booking, onCancel }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState('');

  const [isPaying, setIsPaying] = useState(false);
  const [redirectData, setRedirectData] = useState(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const now = new Date();
  const hasEnded = new Date(booking.endTime) < now;

  const canCancel =
    !hasEnded && (booking.status === 'PENDING' || booking.status === 'CONFIRMED');

  // unpaid eSewa bookings are auto-cancelled 30 minutes after they were created
  const payDeadline = booking.createdAt
    ? new Date(new Date(booking.createdAt).getTime() + UNPAID_ESEWA_TTL_MS)
    : null;

    

  const refundSent =
  booking.status === 'CANCELLED' && booking.paymentMethod === 'ESEWA' && booking.isPaid && booking.isRefunded;

  const canPayNow =
    !hasEnded &&
    booking.status === 'PENDING' &&
    booking.paymentMethod === 'ESEWA' &&
    !booking.isPaid &&
    (!payDeadline || now < payDeadline);

  const canGoLive =
    !hasEnded &&
    booking.status === 'CONFIRMED' &&
    LIVE_ELIGIBLE_CATEGORIES.includes(booking.listingCategory);

  const canCreateTournament =
    !hasEnded &&
    booking.status === 'CONFIRMED' &&
    booking.listingCategory === 'SPORTS';

  const canReview =
    hasEnded &&
    (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') &&
    !booking.hasReviewed &&
    !reviewSubmitted;

 const refundPending = booking.status === 'CANCELLED' && booking.paymentMethod === 'ESEWA' && booking.isPaid && !booking.isRefunded;
  async function handleCancel() {
    setError('');
    setIsCancelling(true);
    try {
      await onCancel(booking.id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not cancel this booking.');
    } finally {
      setIsCancelling(false);
    }
  }

  async function handlePayNow() {
    setError('');
    setIsPaying(true);
    try {
      const payment = await initiatePayment(booking.id);
      setRedirectData(payment); // EsewaRedirectForm auto-submits and leaves the page
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not start the payment. Please try again.');
      setIsPaying(false);
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    setReviewError('');

    if (rating < 1) {
      setReviewError('Please select a star rating.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await submitReview({
        bookingId: booking.id,
        rating,
        comment: comment.trim(),
      });
      setReviewSubmitted(true);
      setReviewOpen(false);
    } catch (err) {
      setReviewError(err?.response?.data?.message || 'Could not submit your review right now.');
    } finally {
      setIsSubmittingReview(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2622] bg-[#211D1A]">
      <div className="flex gap-3 p-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#181512]">
          {booking.listingImageUrl ? (
            <img
              src={booking.listingImageUrl}
              alt={booking.listingTitle}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#4A443F]">
              <ImageOff size={18} strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-['Outfit'] text-base font-semibold leading-tight text-[#F5F0EB]">
              {booking.listingTitle}
            </h3>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[booking.status]}`}>
              {booking.status}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-[#8A7F76]">
            <CalendarDays size={12} />
            <span>
              {new Date(booking.startTime).toLocaleString()} →{' '}
              {new Date(booking.endTime).toLocaleString()}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#6B615A]">
              <span className="flex items-center gap-1">
                <Package size={12} />
                Qty: {booking.quantity}
              </span>
              <span>{booking.paymentMethod === 'CASH' ? 'Cash on arrival' : 'Paid via eSewa'}</span>
            </div>
            <span className="font-['Outfit'] text-sm font-semibold text-[#D4A574]">
              Rs. {booking.totalAmount}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        {refundPending && (
          <p className="mb-3 text-center text-xs text-[#E07856]">
            Refund pending — the owner will process this manually.
          </p>
        )}
        {refundSent && (
          <p className="mb-3 text-center text-xs text-green-400">✓ The owner has sent your refund.</p>
        )}

        {error && (
          <p className="mb-3 rounded-lg bg-[#3A1F1A] px-3 py-2 text-xs text-[#E07856]">{error}</p>
        )}

        {canPayNow && (
          <div className="mb-2">
            <button
              onClick={handlePayNow}
              disabled={isPaying}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#C2542D] py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574] disabled:opacity-50"
            >
              {isPaying ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} />}
              {isPaying ? 'Redirecting to eSewa…' : `Pay now · Rs. ${booking.totalAmount}`}
            </button>
            {payDeadline && (
              <p className="mt-1.5 text-center text-[11px] text-[#6B615A]">
                Pay before {payDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} or this
                booking is cancelled automatically.
              </p>
            )}
          </div>
        )}

        {canGoLive && (
          <Link
            to={`/go-live/${booking.id}`}
            className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#C2542D] py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574]"
          >
            <Radio size={13} />
            Go live
          </Link>
        )}

        {canCreateTournament && !booking.hasTournament && (
          <Link
            to={`/create-tournament/${booking.id}`}
            className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#2A2622] py-2 text-xs font-medium text-[#D4A574] transition-colors hover:bg-[#2A2622]"
          >
            <Trophy size={13} />
            Create tournament
          </Link>
        )}

        {booking.hasTournament && (
          <Link
            to={`/tournaments/${booking.tournamentId}`}
            className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#2A2622] py-2 text-xs font-medium text-[#D4A574] transition-colors hover:bg-[#2A2622]"
          >
            <Trophy size={13} />
            View tournament
          </Link>
        )}

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={isCancelling || isPaying}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#2A2622] py-2 text-xs font-medium text-[#A89A8C] transition-colors hover:bg-[#3A1F1A] hover:text-[#E07856] disabled:opacity-50"
          >
            {isCancelling ? <Loader2 size={13} className="animate-spin" /> : null}
            {isCancelling ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}

        {reviewSubmitted && (
          <p className="text-center text-xs text-green-400">✓ Thanks for your review!</p>
        )}

        {booking.hasReviewed && !reviewSubmitted && (
          <p className="text-center text-xs text-[#6B615A]">You already reviewed this booking</p>
        )}

        {canReview && (
          <div className="rounded-lg border border-[#2A2622]">
            <button
              type="button"
              onClick={() => setReviewOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-medium text-[#D4A574]"
            >
              <span className="flex items-center gap-1.5">
                <Star size={13} />
                Rate your experience
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform ${reviewOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {reviewOpen && (
              <form onSubmit={handleSubmitReview} className="border-t border-[#2A2622] p-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5"
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={18}
                        className={
                          star <= (hoverRating || rating)
                            ? 'fill-[#D4A574] text-[#D4A574]'
                            : 'text-[#3A3532]'
                        }
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  placeholder="Leave a comment (optional)"
                  className="mt-2 w-full resize-none rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-xs text-[#F5F0EB] placeholder:text-[#5A524A] outline-none focus:border-[#C2542D]/60"
                />

                {reviewError && (
                  <p className="mt-2 text-xs text-[#E07856]">{reviewError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#C2542D] py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574] disabled:opacity-50"
                >
                  {isSubmittingReview ? <Loader2 size={13} className="animate-spin" /> : null}
                  {isSubmittingReview ? 'Submitting…' : 'Submit review'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* hidden form: auto-submits to eSewa as soon as it mounts */}
      {redirectData && (
        <EsewaRedirectForm
          paymentUrl={redirectData.paymentUrl}
          formFields={redirectData.formFields}
        />
      )}
    </div>
  );
}