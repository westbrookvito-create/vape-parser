import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import { ChatMessage, Me } from "../../types";

const POLL_MS = 3000;

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<Me>("/users/me").then(setMe);
  }, []);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    async function poll() {
      const msgs = await api.get<ChatMessage[]>(`/dating/matches/${matchId}/messages`);
      if (!cancelled) setMessages(msgs);
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [matchId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    const value = text.trim();
    if (!value || !matchId) return;
    setText("");
    const msg = await api.post<ChatMessage>(`/dating/matches/${matchId}/messages`, { text: value });
    setMessages((prev) => [...prev, msg]);
  }

  return (
    <div className="chat-shell">
      <div className="chat-header">
        <button className="chat-back" onClick={() => navigate(-1)}>
          ←
        </button>
        <strong>Чат</strong>
      </div>
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble ${me && m.senderId === me.id ? "mine" : "theirs"}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          placeholder="Сообщение…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send}>Отправить</button>
      </div>
    </div>
  );
}
