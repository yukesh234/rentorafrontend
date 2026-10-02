import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';

export default function LiveChatPanel({ messages, onSend, disabled = false }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e) {
    e.preventDefault();
    if (disabled) return;
    onSend(input);
    setInput('');
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#2A2622] bg-[#211D1A]">
      <div className="flex items-center gap-2 border-b border-[#2A2622] px-4 py-3">
        <MessageCircle size={15} className="text-[#8A7F76]" />
        <h3 className="text-sm font-medium text-[#F5F0EB]">Live chat</h3>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="text-xs text-[#6B615A]">
            {disabled ? 'No messages.' : 'No messages yet — say something!'}
          </p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="text-xs">
              <span className="font-medium text-[#D4A574]">{msg.senderName}: </span>
              <span className="text-[#D9CFC6]">{msg.content}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {disabled && (
        <p className="border-t border-[#2A2622] px-4 py-2 text-center text-[11px] text-[#6B615A]">
          The live has ended — chat is closed.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[#2A2622] p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? 'Chat is closed' : 'Say something…'}
          className="w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-xs text-[#F5F0EB] placeholder:text-[#5A524A] outline-none focus:border-[#C2542D]/60 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          className="flex shrink-0 items-center justify-center rounded-lg bg-[#C2542D] px-3 text-[#1C1917] transition-colors hover:bg-[#D4A574] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}