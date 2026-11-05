import { useEffect, useRef, useState } from "react";
import { chat } from "../api";
import type { Message } from "../types";

interface Props {
  topic: string;
  messages: Message[];
  onChange: (messages: Message[]) => void;
}

export function Chat({ topic, messages, onChange }: Props) {
  const [input, setInput] = useState("");
  const [hint, setHint] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setHint(0);
    setError("");
  }, [topic]);

  const ask = async (history: Message[], level: number) => {
    setLoading(true);
    setError("");
    try {
      const { reply } = await chat(topic, history, level);
      onChange([...history, { role: "bot", text: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd");
    } finally {
      setLoading(false);
    }
  };

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setHint(0);
    const history = [...messages, { role: "user" as const, text }];
    onChange(history);
    void ask(history, 0);
  };

  const hintClick = () => {
    if (loading) return;
    const level = Math.min(3, hint + 1);
    setHint(level);
    const history = [
      ...messages,
      { role: "user" as const, text: "Potrzebuję podpowiedzi, ale nie podawaj gotowej odpowiedzi." },
    ];
    onChange(history);
    void ask(history, level);
  };

  return (
    <div className="chat">
      <div className="messages">
        {messages.length === 0 && (
          <p className="muted">Napisz, co już wiesz o temacie, albo zacznij od pytania.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="msg bot muted">Myślę…</div>}
        <div ref={endRef} />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Twoja odpowiedź lub pytanie"
        />
        <button onClick={send} disabled={loading}>
          Wyślij
        </button>
        <button onClick={hintClick} disabled={loading || hint >= 3}>
          Podpowiedź ({hint}/3)
        </button>
        {messages.length === 0 && (
          <button onClick={() => void ask([], 0)} disabled={loading}>
            Zacznij
          </button>
        )}
      </div>
    </div>
  );
}
