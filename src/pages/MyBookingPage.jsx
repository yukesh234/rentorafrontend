/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from 'react';
import { CalendarDays, History } from 'lucide-react';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import BookingCard from '../components/booking/BookingCard';
import { useAuthStore } from '../stores/Authstore';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const authIsLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (authIsLoading) return;
    fetchBookings();
  }, [authIsLoading]);

  async function fetchBookings() {
    setIsLoading(true);
    try {
      const data = await getMyBookings();
      console.log('Fetched bookings:', data);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancel(id) {
    await cancelBooking(id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))
    );
  }

  const now = new Date();
  const activeBookings = bookings.filter(
    (b) => new Date(b.endTime) >= now && b.status !== 'CANCELLED'
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.endTime) < now || b.status === 'CANCELLED'
  );

  return (
    <div className="min-h-screen bg-[#1C1917] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-[#8A7F76]">
          <CalendarDays size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">Your bookings</span>
        </div>
        <h1 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#F5F0EB]">
          My bookings
        </h1>

        {isLoading ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-[#211D1A]" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <p className="mt-8 text-sm text-[#8A7F76]">You haven't booked anything yet.</p>
        ) : (
          <>
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
                <CalendarDays size={13} />
                Active & upcoming ({activeBookings.length})
              </h2>
              {activeBookings.length === 0 ? (
                <p className="text-sm text-[#6B615A]">No active bookings right now.</p>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
                <History size={13} />
                Past bookings ({pastBookings.length})
              </h2>
              {pastBookings.length === 0 ? (
                <p className="text-sm text-[#6B615A]">No past bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}