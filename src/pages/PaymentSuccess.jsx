/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import axios from '../axios/axios.js';

/**
 * PaymentSuccessPage — Rentora
 * -----------------------------------------------------------------------
 * eSewa redirects here after payment with ?data=<base64>. This page just
 * displays the result; verification already happened server-side when
 * eSewa hit /api/payments/esewa/success directly. If you point eSewa's
 * success_url at THIS frontend route instead of the backend, this page
 * should forward the `data` param to the backend for verification itself:
 *
 *   await axios.get(`/api/payments/esewa/success?data=${data}`)
 *
 *.
 */
export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking'); // 'checking' | 'success' | 'failed'

   
  useEffect(() => {
    const data = searchParams.get('data');
    console.log('PaymentSuccessPage: data param from URL:', data);
    // await new Promise(resolve => setTimeout(resolve, 60000));

    if (!data) {
      console.error('PaymentSuccessPage: No data param in URL');
      setStatus('failed');
      return;
    }

    axios
      .get(`/api/payments/esewa/success?data=${encodeURIComponent(data)}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('failed'));
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1C1917] px-4 text-center">
      {status === 'checking' && (
        <>
          <Loader2 size={32} className="animate-spin text-[#D4A574]" />
          <p className="mt-3 text-sm text-white/50">Confirming your payment…</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2 size={40} className="text-green-400" />
          <h1 className="mt-4 font-['Outfit'] text-xl font-semibold text-[#F5F0EB]">
            Payment successful
          </h1>
          <p className="mt-1 text-sm text-white/50">Your booking is confirmed.</p>
          <Link
            to="/bookings"
            className="mt-6 rounded-lg bg-[#C2542D] px-5 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574]"
          >
            View my bookings
          </Link>
        </>
      )}

      {status === 'failed' && (
        <>
          <XCircle size={40} className="text-[#E07856]" />
          <h1 className="mt-4 font-['Outfit'] text-xl font-semibold text-[#F5F0EB]">
            Payment verification failed
          </h1>
          <p className="mt-1 text-sm text-white/50">
            If money was deducted, contact support with your booking ID.
          </p>
          <Link
            to="/"
            className="mt-6 rounded-lg border border-[#2A2622] px-5 py-2.5 text-sm font-medium text-[#A89A8C] transition-colors hover:bg-[#2A2622]"
          >
            Back to home
          </Link>
        </>
      )}
    </div>
  );
}