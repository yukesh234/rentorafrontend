import { CalendarDays, Package, User, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-500/15 text-yellow-400',
  CONFIRMED: 'bg-green-500/15 text-green-400',
  CANCELLED: 'bg-red-500/15 text-red-400',
  COMPLETED: 'bg-blue-500/15 text-blue-400',
};

export default function OwnerBookingCard({ booking, onMarkPaid, onMarkRefunded }) {
  const [isMarking, setIsMarking] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [error, setError] = useState('');

  const wasPaidViaEsewa =
    booking.status === 'CANCELLED' && booking.paymentMethod === 'ESEWA' && booking.isPaid;
  const refundOwed = wasPaidViaEsewa && !booking.isRefunded;
  const refundSent = wasPaidViaEsewa && booking.isRefunded;

  async function handleMarkPaid() {
    setError('');
    setIsMarking(true);
    try {
      await onMarkPaid(booking.id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update this booking.');
    } finally {
      setIsMarking(false);
    }
  }

  async function handleMarkRefunded() {
    setError('');
    setIsRefunding(true);
    try {
      await onMarkRefunded(booking.id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update this booking.');
    } finally {
      setIsRefunding(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-['Outfit'] text-base font-semibold text-[#F5F0EB]">
            {booking.listingTitle}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-[#8A7F76]">
            <User size={12} />
            <span>{booking.renterName}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-[#8A7F76]">
            <CalendarDays size={12} />
            <span>
              {new Date(booking.startTime).toLocaleString()} →{' '}
              {new Date(booking.endTime).toLocaleString()}
            </span>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[booking.status]}`}>
          {booking.status}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#2A2622] pt-3">
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

      {refundOwed && (
        <div className="mt-3 rounded-lg bg-[#3A1F1A] px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#E07856]">
            <AlertCircle size={13} className="shrink-0" />
            Cancelled after payment — refund owed to renter.
          </div>
          <button
            onClick={handleMarkRefunded}
            disabled={isRefunding}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E07856]/40 py-1.5 text-xs font-medium text-[#E07856] transition-colors hover:bg-[#E07856]/10 disabled:opacity-50"
          >
            {isRefunding ? <Loader2 size={13} className="animate-spin" /> : null}
            {isRefunding ? 'Updating…' : 'Mark refund as sent'}
          </button>
        </div>
      )}

      {refundSent && (
        <p className="mt-3 text-center text-xs text-green-400">✓ Refund sent to renter</p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-[#3A1F1A] px-3 py-2 text-xs text-[#E07856]">{error}</p>
      )}

      {booking.paymentMethod === 'CASH' &&
        !booking.isPaid &&
        booking.status !== 'CANCELLED' && (
          <button
            onClick={handleMarkPaid}
            disabled={isMarking}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-green-500/30 py-2 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/10 disabled:opacity-50"
          >
            {isMarking ? <Loader2 size={13} className="animate-spin" /> : null}
            {isMarking ? 'Marking…' : 'Mark cash payment received'}
          </button>
        )}

      {booking.paymentMethod === 'CASH' && booking.isPaid && (
        <p className="mt-3 text-center text-xs text-green-400">✓ Cash payment received</p>
      )}
    </div>
  );
}