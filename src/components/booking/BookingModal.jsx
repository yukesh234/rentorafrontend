/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createBooking, getBookedSlots } from '../../services/bookingService';
import { initiatePayment } from '../../services/paymentService';
import EsewaRedirectForm from '../payment/EsewaRedirectionForm';
import DateTimePicker from './DateTimePicker';

// "09:30:00" -> 570. A closing time of 00:00 means end of day (1440).
function toMinutes(value, isClosing = false) {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  const mins = h * 60 + (m || 0);
  return isClosing && mins === 0 ? 24 * 60 : mins;
}

function minutesOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

export default function BookingModal({ listing, onClose }) {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'submitting' | 'redirecting' | 'done'
  const [redirectData, setRedirectData] = useState(null);

  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  const isOutOfStock = listing.quantity <= 0;

  // venues (sports / entertainment) with opening hours
  const openMins = toMinutes(listing.openingTime);
  const closeMins = toMinutes(listing.closingTime, true);
  const hasHours =
    listing.category !== 'UTILITY' &&
    openMins !== null &&
    closeMins !== null &&
    closeMins > openMins;

  function calculateDurationUnits(start, end, unit) {
    if (!start || !end) return 0;
    const ms = end.getTime() - start.getTime();
    const hours = ms / (1000 * 60 * 60);

    switch (unit) {
      case 'hour':
        return Math.ceil(hours); // round up partial hours
      case 'day':
        return Math.ceil(hours / 24);
      case 'week':
        return Math.ceil(hours / (24 * 7));
      default:
        return 1;
    }
  }

  const durationUnits = calculateDurationUnits(startTime, endTime, listing.priceUnit);

  const estimatedTotal =
    listing.pricePerUnit && durationUnits > 0
      ? (listing.pricePerUnit * durationUnits * quantity).toFixed(2)
      : '0.00';

  useEffect(() => {
    let isMounted = true;
    async function fetchSlots() {
      setSlotsLoading(true);
      try {
        const slots = await getBookedSlots(listing.id);
        if (isMounted) setBookedSlots(slots);
      } catch (err) {
        console.error('Failed to load booked slots', err);
      } finally {
        if (isMounted) setSlotsLoading(false);
      }
    }
    fetchSlots();
    return () => {
      isMounted = false;
    };
  }, [listing.id]);

  function validate() {
    if (isOutOfStock) {
      return 'This listing is currently out of stock.';
    }
    if (!startTime || !endTime) {
      return 'Please select both start and end time.';
    }
    if (startTime < new Date()) {
      console.log('Start time is in the past:', startTime, "and now is", new Date());
      return 'Start time cannot be in the past.';
    }
    if (endTime <= startTime) {
      return 'End time must be after start time.';
    }
    const durationMs = endTime.getTime() - startTime.getTime();
    if (durationMs < 30 * 60 * 1000) {
      return 'Booking must be at least 30 minutes long.';
    }

    if (hasHours) {
      const label = `${listing.openingTime.slice(0, 5)} – ${listing.closingTime.slice(0, 5)}`;
      if (startTime.toDateString() !== endTime.toDateString()) {
        return `This venue must be booked within a single day (open ${label}).`;
      }
      if (minutesOfDay(startTime) < openMins || minutesOfDay(endTime) > closeMins) {
        return `This venue is only open ${label}. Please pick a time within opening hours.`;
      }
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return 'Quantity must be a whole number of at least 1.';
    }
    if (qty > listing.quantity) {
      return `Only ${listing.quantity} available — reduce the quantity.`;
    }

    const overlapsBooked = bookedSlots.some((slot) => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      const timesOverlap = startTime < slotEnd && endTime > slotStart;
      return timesOverlap && slot.quantity + qty > listing.quantity;
    });
    if (overlapsBooked) {
      return 'This time slot conflicts with an existing booking.';
    }

    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep('submitting');

    try {
      const booking = await createBooking({
        listingId: listing.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        quantity: Number(quantity),
        paymentMethod,
      });

      if (paymentMethod === 'ESEWA') {
        const payment = await initiatePayment(booking.id);
        setRedirectData(payment);
        setStep('redirecting');
      } else {
        setStep('done');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
      setStep('form');
    }
  }

  if (step === 'redirecting' && redirectData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="flex flex-col items-center gap-3 text-[#F5F0EB]">
          <Loader2 size={28} className="animate-spin text-[#D4A574]" />
          <p className="text-sm">Redirecting you to eSewa…</p>
        </div>
        <EsewaRedirectForm
          paymentUrl={redirectData.paymentUrl}
          formFields={redirectData.formFields}
        />
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-sm rounded-xl border border-[#2A2622] bg-[#211D1A] p-6 text-center">
          <h2 className="font-['Outfit'] text-lg font-semibold text-[#F5F0EB]">
            Booking confirmed
          </h2>
          <p className="mt-2 text-sm text-[#8A7F76]">
            Rs. {listing.pricePerUnit} / {listing.priceUnit} × {durationUnits} {listing.priceUnit}
         {durationUnits !== 1 ? 's' : ''} × {quantity} unit{quantity > 1 ? 's' : ''}
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full rounded-lg bg-[#C2542D] px-5 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574]"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-[#2A2622] bg-[#211D1A]">
        <div className="flex items-center justify-between border-b border-[#2A2622] px-6 py-4">
          <h2 className="font-['Outfit'] text-lg font-semibold text-[#F5F0EB]">
            Book "{listing.title}"
          </h2>
          <button
            onClick={onClose}
            disabled={step === 'submitting'}
            className="rounded-lg p-1.5 text-[#8A7F76] transition-colors hover:bg-[#2A2622] hover:text-[#F5F0EB] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {isOutOfStock ? (
            <p className="rounded-lg bg-[#3A1F1A] px-3 py-2 text-sm text-[#E07856]">
              This listing is currently out of stock. Please check back later.
            </p>
          ) : (
            <>
              <DateTimePicker
                label="Start time"
                selected={startTime}
                onChange={(date) => {
                  setStartTime(date);
                  if (endTime && date && endTime <= date) setEndTime(null);
                  // venues are single-day: drop an end time that falls on another day
                  if (hasHours && endTime && date && endTime.toDateString() !== date.toDateString()) {
                    setEndTime(null);
                  }
                }}
                minDate={new Date()}
                bookedSlots={bookedSlots}
                maxQuantity={listing.quantity}
                openingTime={hasHours ? listing.openingTime : undefined}
                closingTime={hasHours ? listing.closingTime : undefined}
              />

              <DateTimePicker
                label="End time"
                selected={endTime}
                onChange={setEndTime}
                minDate={startTime || new Date()}
                maxDate={hasHours && startTime ? startTime : undefined}
                bookedSlots={bookedSlots}
                maxQuantity={listing.quantity}
                openingTime={hasHours ? listing.openingTime : undefined}
                closingTime={hasHours ? listing.closingTime : undefined}
                isEnd
              />

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={listing.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] outline-none transition-colors focus:border-[#C2542D]/60"
                />
                <p className="mt-1 text-xs text-[#6B615A]">{listing.quantity} available</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
                  Payment method
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      paymentMethod === 'CASH'
                        ? 'border-[#C2542D] bg-[#C2542D]/15 text-[#D4A574]'
                        : 'border-[#2A2622] text-[#8A7F76] hover:border-[#3A3532]'
                    }`}
                  >
                    Cash on arrival
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ESEWA')}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      paymentMethod === 'ESEWA'
                        ? 'border-[#C2542D] bg-[#C2542D]/15 text-[#D4A574]'
                        : 'border-[#2A2622] text-[#8A7F76] hover:border-[#3A3532]'
                    }`}
                  >
                    Pay now via eSewa
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-[#2A2622] bg-[#181512] px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#8A7F76]">Estimated total</span>
                  <span className="font-['Outfit'] text-base font-semibold text-[#D4A574]">
                    Rs. {estimatedTotal}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#6B615A]">
                  Rs. {listing.pricePerUnit} / {listing.priceUnit} × {quantity}
                </p>
              </div>
            </>
          )}

          {error && (
            <p className="rounded-lg bg-[#3A1F1A] px-3 py-2 text-sm text-[#E07856]">{error}</p>
          )}

          {!isOutOfStock && (
            <button
              type="submit"
              disabled={step === 'submitting'}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C2542D] px-5 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574] disabled:opacity-50"
            >
              {step === 'submitting' ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Processing…
                </>
              ) : paymentMethod === 'ESEWA' ? (
                'Continue to payment'
              ) : (
                'Confirm booking'
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}