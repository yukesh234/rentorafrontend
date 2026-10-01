/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Users } from 'lucide-react';
import { getActiveStreams } from '../services/liveStreamingService';
import { useAuthStore } from '../stores/Authstore';

export default function BrowseLivePage() {
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
   const authIsLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    async function fetchStreams() {
       if (authIsLoading) return;
      try {
        const data = await getActiveStreams();
        setStreams(data);
      } catch (err) {
        console.error('Failed to load live streams', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStreams();
    const interval = setInterval(fetchStreams, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [authIsLoading]);

  return (
    <div className="min-h-screen bg-[#1C1917] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-2 text-[#8A7F76]">
          <Radio size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">Happening now</span>
        </div>
        <h1 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#F5F0EB]">
          Live streams
        </h1>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-video animate-pulse rounded-xl bg-[#211D1A]" />
              ))}
            </div>
          ) : streams.length === 0 ? (
            <p className="text-sm text-[#8A7F76]">No one is live right now. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {streams.map((stream) => (
                <Link
                  key={stream.id}
                  to={`/live/${stream.bookingId}`}
                  className="group overflow-hidden rounded-xl border border-[#2A2622] bg-[#211D1A] transition-colors hover:border-[#3A3532]"
                >
                  <div className="relative flex aspect-video items-center justify-center bg-[#181512]">
                    <Radio size={28} className="text-[#4A443F]" />
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                      LIVE
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-medium text-[#F5F0EB]">
                      {stream.listingTitle}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#8A7F76]">{stream.ownerName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}