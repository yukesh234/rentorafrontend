import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * createSignalingClient — Rentora
 * One STOMP client per stream session (broadcaster or viewer). Subscribes
 * to both the /signal and /chat topics for a given bookingId, and exposes
 * send helpers that publish to the matching /app destinations.
 *
 * Usage:
 *   const client = createSignalingClient(bookingId, {
 *     onSignal: (msg) => { ... },
 *     onChat: (msg) => { ... },
 *   });
 *   client.activate();
 *   client.sendSignal({ type: 'offer', senderId, targetId, payload });
 *   client.sendChat({ senderId, senderName, content });
 *   client.deactivate(); // on cleanup
 * 
 */
export function createSignalingClient(bookingId, { onSignal, onChat, onConnect } = {}) {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE}/ws`),
    reconnectDelay: 3000,
    onConnect: () => {
      client.subscribe(`/topic/stream/${bookingId}/signal`, (message) => {
        onSignal?.(JSON.parse(message.body));
      });
      client.subscribe(`/topic/stream/${bookingId}/chat`, (message) => {
        onChat?.(JSON.parse(message.body));
      });
      onConnect?.();
    },
  });

  return {
    activate: () => client.activate(),
    deactivate: () => client.deactivate(),
    sendSignal: (signalMessageDto) => {
      if (!client.connected) return; // guard against calling after disconnect
      client.publish({
        destination: `/app/stream/${bookingId}/signal`,
        body: JSON.stringify(signalMessageDto),
      });
    },
    sendChat: (chatMessageDto) => {
      if (!client.connected) return; // guard against calling after disconnect
      client.publish({
        destination: `/app/stream/${bookingId}/chat`,
        body: JSON.stringify(chatMessageDto),
      });
    },
  };
}