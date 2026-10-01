import { useEffect, useRef, useState } from 'react';
import { createSignalingClient } from './signalingClient';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

/**
 * useWebRTCBroadcaster — Rentora
 * -----------------------------------------------------------------------
 * Mesh broadcaster: one RTCPeerConnection per connected viewer. Suitable
 * for small audiences only (bandwidth scales with viewer count) — this is
 * a known, documented limitation given the no-SFU constraint.
 * -----------------------------------------------------------------------
 */
export function useWebRTCBroadcaster(bookingId, userId) {
  const [localStream, setLocalStream] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState('');
  const peersRef = useRef({}); // viewerId -> RTCPeerConnection
  const signalingRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);

        const signaling = createSignalingClient(bookingId, {
          onSignal: handleSignal,
        });
        signalingRef.current = signaling;
        signaling.activate();
      } catch (error) {
        setError('Could not access camera/microphone. Check browser permissions.'+ error);
      }
    }

    function handleSignal(message) {
       console.log('Broadcaster received:', message);
      const { type, senderId, targetId, payload } = message;

      // ignore messages not addressed to us, except join requests (broadcast)
      if (targetId && targetId !== userId) return;

      if (type === 'join') {
        // a new viewer announced themselves — create a peer connection and send an offer
        createPeerForViewer(senderId);
      } else if (type === 'answer') {
        const pc = peersRef.current[senderId];
        if (pc) {
          pc.setRemoteDescription(JSON.parse(payload));
        }
      } else if (type === 'ice-candidate') {
        const pc = peersRef.current[senderId];
        if (pc) {
          pc.addIceCandidate(JSON.parse(payload)).catch(() => {});
        }
      } else if (type === 'leave') {
        const pc = peersRef.current[senderId];
        if (pc) {
          pc.close();
          delete peersRef.current[senderId];
          setViewerCount(Object.keys(peersRef.current).length);
        }
      }
    }

    async function createPeerForViewer(viewerId) {
      if (peersRef.current[viewerId]) return; // already connected

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peersRef.current[viewerId] = pc;
      setViewerCount(Object.keys(peersRef.current).length);

      pc.oniceconnectionstatechange = () => {
        console.log('ICE state:', pc.iceConnectionState);
      };

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          signalingRef.current?.sendSignal({
            type: 'ice-candidate',
            senderId: userId,
            targetId: viewerId,
            payload: JSON.stringify(event.candidate),
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (['closed', 'failed', 'disconnected'].includes(pc.connectionState)) {
          delete peersRef.current[viewerId];
          setViewerCount(Object.keys(peersRef.current).length);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      signalingRef.current?.sendSignal({
        type: 'offer',
        senderId: userId,
        targetId: viewerId,
        payload: JSON.stringify(offer),
      });
    }

    setup();

    return () => {
      cancelled = true;
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      signalingRef.current?.deactivate();
    };
  }, [bookingId, userId]);

  return { localStream, viewerCount, error };
}