import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1C1917] px-4 text-center">
      <XCircle size={40} className="text-[#E07856]" />
      <h1 className="mt-4 font-['Outfit'] text-xl font-semibold text-[#F5F0EB]">
        Payment cancelled or failed
      </h1>
      <p className="mt-1 text-sm text-white/50">
        Your booking wasn't confirmed. You can try again from your bookings page.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-[#C2542D] px-5 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574]"
      >
        Back to home
      </Link>
    </div>
  );
}