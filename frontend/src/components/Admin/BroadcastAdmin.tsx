import { useState } from "react";
import { api } from "../../api";
import { BroadcastResult } from "../../types";

export default function BroadcastAdmin() {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!text.trim() || sending) return;
    if (!confirm("Отправить это сообщение всем пользователям бота?")) return;

    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post<BroadcastResult>("/admin/broadcast", { text: text.trim() });
      setResult(res);
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка рассылки");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="form-section">
      <div className="form-label">Текст рассылки</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Например: обновление в приложении, анонс, важная новость…"
        style={{ minHeight: 140 }}
      />
      <button className="btn-primary" onClick={send} disabled={!text.trim() || sending}>
        {sending ? "Отправляем…" : "Отправить всем пользователям"}
      </button>

      {result && (
        <div className="status-badge status-approved">
          Готово: доставлено {result.sent} из {result.total}
          {result.failed > 0 ? ` (не доставлено ${result.failed} — бот заблокирован или чат недоступен)` : ""}
        </div>
      )}
      {error && <div className="status-badge status-rejected">{error}</div>}
    </div>
  );
}
