import { useEffect, useState } from 'react';
import { Inbox } from 'lucide-react';
import { getOwnerBookings, markCashPaymentReceived } from '../services/bookingService';
import OwnerBookingCard from '../components/booking/OwnerBookingCard';
import { useAuthStore } from '../stores/Authstore';

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const authIsLoading = useAuthStore((s) => s.isLoading);
    
    useEffect(() => {
       if (authIsLoading) return;
      // eslint-disable-next-line react-hooks/immutability
     fetchBookings();
    }, [authIsLoading]);

  async function fetchBookings() {
    setIsLoading(true);
    try {
      const data = await getOwnerBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load owner bookings', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkPaid(id) {
    const updated = await markCashPaymentReceived(id);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
  }

  return (
    <div className="min-h-screen bg-[#1C1917] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-[#8A7F76]">
          <Inbox size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">Owner dashboard</span>
        </div>
        <h1 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#F5F0EB]">
          Bookings received
        </h1>

        <div className="mt-8 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-[#211D1A]" />
            ))
          ) : bookings.length === 0 ? (
            <p className="text-sm text-[#8A7F76]">No bookings on your listings yet.</p>
          ) : (
            bookings.map((booking) => (
              <OwnerBookingCard key={booking.id} booking={booking} onMarkPaid={handleMarkPaid} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}