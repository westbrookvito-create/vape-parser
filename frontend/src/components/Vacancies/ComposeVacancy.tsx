import { useState } from "react";

export default function ComposeVacancy({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { title: string; text: string; contact: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !text.trim() || busy) return;
    setBusy(true);
    try {
      await onSubmit({ title: title.trim(), text: text.trim(), contact: contact.trim() });
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Новый оффер</h3>
        <div className="form-label">Заголовок</div>
        <input type="text" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ищем growth-маркетолога" />
        <div style={{ height: 10 }} />
        <div className="form-label">Описание</div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Условия, требования, что предлагаете" />
        <div style={{ height: 10 }} />
        <div className="form-label">Контакт для связи</div>
        <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="@username или ссылка" />
        <div style={{ height: 12 }} />
        <button className="btn-primary" disabled={!title.trim() || !text.trim() || busy} onClick={handleSubmit}>
          {busy ? "Публикуем…" : "Опубликовать"}
        </button>
      </div>
    </div>
  );
}
