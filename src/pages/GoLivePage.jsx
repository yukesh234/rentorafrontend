/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Radio, Users, Loader2, Square, Check, Link2 } from 'lucide-react';
import { useWebRTCBroadcaster } from '../webrtc/useWebRTCBroadcaster';
import { useLiveChat } from '../webrtc/useLiveChat';
import { startStream, endStream } from '../services/liveStreamingService';
import { useAuthStore } from '../stores/Authstore';
import LiveChatPanel from '../components/livestream/LiveChatPanel';

export default function GoLivePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const videoRef = useRef(null);

  const [isStarting, setIsStarting] = useState(true);
  const [startError, setStartError] = useState('');
  const [isEnding, setIsEnding] = useState(false);

  const { localStream, viewerCount, error: mediaError } = useWebRTCBroadcaster(bookingId, user?.userid);
  const { messages, sendMessage } = useLiveChat(bookingId, user?.userid, user?.name);
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/live/${bookingId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    async function begin() {
      try {
        await startStream(bookingId);
      } catch (err) {
        setStartError(err?.response?.data?.message || 'Could not start the stream.');
      } finally {
        setIsStarting(false);
      }
    }
    begin();
  }, [bookingId]);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  async function handleEndStream() {
    setIsEnding(true);
    try {
      await endStream(bookingId);
      navigate('/bookings');
    } catch (err) {
      setIsEnding(false);
    }
  }

  if (isStarting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1C1917]">
        <Loader2 size={28} className="animate-spin text-[#D4A574]" />
      </div>
    );
  }

  if (startError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#1C1917] px-4 text-center">
        <p className="text-sm text-[#E07856]">{startError}</p>
        <button
          onClick={() => navigate('/owner-bookings')}
          className="rounded-lg border border-[#2A2622] px-4 py-2 text-sm text-[#A89A8C] hover:bg-[#2A2622]"
        >
          Back to bookings
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1917] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400">
                <Radio size={12} className="animate-pulse" />
                LIVE
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#8A7F76]">
                <Users size={13} />
                {viewerCount} watching
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-[#2A2622] px-4 py-2 text-xs font-medium text-[#D4A574] transition-colors hover:bg-[#2A2622]"
              >
                {copied ? <Check size={12} /> : <Link2 size={12} />}
                {copied ? 'Copied' : 'Copy watch link'}
              </button>
              <button
                onClick={handleEndStream}
                disabled={isEnding}
                className="flex items-center gap-1.5 rounded-lg bg-[#C23D2D] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#A8331F] disabled:opacity-50"
              >
                <Square size={12} />
                {isEnding ? 'Ending…' : 'End stream'}
              </button>
            </div>
          </div>

          <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-[#2A2622] bg-black">
            {mediaError ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[#E07856]">
                {mediaError}
              </div>
            ) : (
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            )}
          </div>
        </div>

        <div className="h-100 lg:h-auto">
          <LiveChatPanel messages={messages} onSend={sendMessage} />
        </div>
      </div>
    </div>
  );
}