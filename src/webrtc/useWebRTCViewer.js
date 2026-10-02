import { useEffect, useRef, useState } from 'react';
import { createSignalingClient } from './signalingClient';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

export function useWebRTCViewer(bookingId, userId, broadcasterId) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('connecting'); // connecting | connected | disconnected
  const [streamEnded, setStreamEnded] = useState(false); // the host ended the live
  const pcRef = useRef(null);
  const signalingRef = useRef(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      console.log('Viewer got remote track:', event.streams[0], event.track);
      setRemoteStream(event.streams[0]);
    };
    pc.oniceconnectionstatechange = () => {
      console.log('ICE state:', pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setConnectionState('connected');
      if (['closed', 'failed', 'disconnected'].includes(pc.connectionState)) {
        setConnectionState('disconnected');
      }
    };

    const signaling = createSignalingClient(bookingId, {
      onSignal: handleSignal,
      onConnect: () => {
        // announce presence to the broadcaster
        signaling.sendSignal({
          type: 'join',
          senderId: userId,
          targetId: broadcasterId,
          payload: '',
        });
      },
    });
    signalingRef.current = signaling;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signaling.sendSignal({
          type: 'ice-candidate',
          senderId: userId,
          targetId: broadcasterId,
          payload: JSON.stringify(event.candidate),
        });
      }
    };

    async function handleSignal(message) {
      console.log('Viewer received:', message);
      const { type, senderId, targetId, payload } = message;

      // the server announces the end of the stream to everybody on this booking's topic
      if (type === 'stream-ended') {
        setStreamEnded(true);
        setConnectionState('disconnected');
        setRemoteStream(null);
        pc.close();
        return;
      }

      if (targetId && targetId !== userId) return;
      if (senderId !== broadcasterId) return; // only trust the actual broadcaster

      if (type === 'offer') {
        await pc.setRemoteDescription(JSON.parse(payload));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        signaling.sendSignal({
          type: 'answer',
          senderId: userId,
          targetId: broadcasterId,
          payload: JSON.stringify(answer),
        });
      } else if (type === 'ice-candidate') {
        pc.addIceCandidate(JSON.parse(payload)).catch(() => {});
      }
    }

    signaling.activate();

    return () => {
      signaling.sendSignal({ type: 'leave', senderId: userId, targetId: broadcasterId, payload: '' });
      pc.close();
      signaling.deactivate();
    };
  }, [bookingId, userId, broadcasterId]);

  return { remoteStream, connectionState, streamEnded };
}