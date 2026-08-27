import { useState } from "react";

export default function ComposePost({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await onSubmit(text.trim());
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Новый пост</h3>
        <textarea
          autoFocus
          placeholder="Чем занимаетесь, о чём думаете?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div style={{ height: 12 }} />
        <button className="btn-primary" disabled={!text.trim() || busy} onClick={handleSubmit}>
          {busy ? "Публикуем…" : "Опубликовать"}
        </button>
      </div>
    </div>
  );
}
