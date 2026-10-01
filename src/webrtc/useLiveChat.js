import { useEffect, useRef, useState } from 'react';
import { createSignalingClient } from './signalingClient';

export function useLiveChat(bookingId, userId, userName) {
  const [messages, setMessages] = useState([]);
  const signalingRef = useRef(null);

  useEffect(() => {
    const signaling = createSignalingClient(bookingId, {
      onChat: (msg) => setMessages((prev) => [...prev, msg]),
    });
    signalingRef.current = signaling;
    signaling.activate();

    return () => signaling.deactivate();
  }, [bookingId]);

  function sendMessage(content) {
    if (!content.trim()) return;
    signalingRef.current?.sendChat({
      senderId: userId,
      senderName: userName,
      content: content.trim(),
    });
  }

  return { messages, sendMessage };
}