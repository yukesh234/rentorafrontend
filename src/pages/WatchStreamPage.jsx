/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Radio, Loader2 } from 'lucide-react';
import { useWebRTCViewer } from '../webrtc/useWebRTCViewer';
import { useLiveChat } from '../webrtc/useLiveChat';
import { getStreamByBooking } from '../services/liveStreamingService';
import { useAuthStore } from '../stores/Authstore';
import LiveChatPanel from '../components/livestream/LiveChatPanel';

export default function WatchStreamPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const userid = useAuthStore((s) => s.user.userid);
  const username = useAuthStore((s) => s.user.name);
  const videoRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [broadcasterId, setBroadcasterId] = useState(null);
  const authIsLoading = useAuthStore((s) => s.isLoading);

  const { remoteStream, connectionState, streamEnded } = useWebRTCViewer(
    bookingId,
    userid,
    broadcasterId
  );
  const { messages, sendMessage } = useLiveChat(bookingId, userid, username);

  // the live is over if the host ended it, or the connection to the host dropped
  const isOver = streamEnded || connectionState === 'disconnected';

  // Fetch stream metadata once — NOT dependent on remoteStream
  useEffect(() => {
    if (authIsLoading) return;

    async function fetchStream() {
      try {
        const data = await getStreamByBooking(bookingId);
        if (!data.isLive) {
          setLoadError('This stream has ended.');
        } else {
          setStream(data);
          setBroadcasterId(data.broadcasterId);
        }
      } catch (err) {
        setLoadError('Stream not found.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStream();
  }, [bookingId, authIsLoading]);

  // Attach the remote stream to the video element whenever it changes.
  // The <video> element is now ALWAYS rendered (see JSX below), so
  // videoRef.current is never null by the time remoteStream arrives.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1C1917]">
        <Loader2 size={28} className="animate-spin text-[#D4A574]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#1C1917] px-4 text-center">
        <p className="text-sm text-[#E07856]">{loadError}</p>
        <button
          onClick={() => navigate('/live')}
          className="rounded-lg border border-[#2A2622] px-4 py-2 text-sm text-[#A89A8C] hover:bg-[#2A2622]"
        >
          Browse live streams
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1917] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-center gap-2">
            {isOver ? (
              <span className="flex items-center gap-1.5 rounded-full bg-[#2A2622] px-3 py-1 text-xs font-medium text-[#8A7F76]">
                <Radio size={12} />
                ENDED
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400">
                <Radio size={12} className="animate-pulse" />
                LIVE
              </span>
            )}
            <h1 className="font-['Outfit'] text-lg font-semibold text-[#F5F0EB]">
              {stream?.listingTitle}
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#8A7F76]">Hosted by {stream?.broadcasterName}</p>

          {/* video element is ALWAYS mounted; the overlays sit on top */}
          <div className="relative mt-4 aspect-video overflow-hidden rounded-xl border border-[#2A2622] bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            {connectionState === 'connecting' && !isOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 text-[#8A7F76]">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs">Connecting to stream…</span>
              </div>
            )}
            {isOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 px-4 text-center">
                <Radio size={26} className="text-[#6B615A]" />
                <div>
                  <p className="font-['Outfit'] text-base font-semibold text-[#F5F0EB]">
                    {streamEnded ? 'This live has ended' : 'Connection lost'}
                  </p>
                  <p className="mt-1 text-xs text-[#8A7F76]">
                    {streamEnded
                      ? 'Thanks for watching.'
                      : 'The host may have ended the live or lost their connection.'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/live')}
                  className="rounded-lg bg-[#C2542D] px-4 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574]"
                >
                  Browse more live streams
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="h-100 lg:h-auto">
          <LiveChatPanel messages={messages} onSend={sendMessage} disabled={isOver} />
        </div>
      </div>
    </div>
  );
}