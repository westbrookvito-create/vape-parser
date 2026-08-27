import { useState } from "react";
import { api } from "../../api";
import { useMe } from "../../store/MeContext";
import { Me } from "../../types";
import ContactAdminButton from "../common/ContactAdminButton";

const statusInfo: Record<Me["datingStatus"], { label: string; className: string }> = {
  NONE: { label: "", className: "" },
  PENDING: { label: "⏳ Анкета на проверке у админа", className: "status-pending" },
  APPROVED: { label: "✅ Анкета одобрена и видна в свайпе", className: "status-approved" },
  REJECTED: { label: "❌ Анкета отклонена", className: "status-rejected" },
};

export default function ProfilePage() {
  const { me, setMe, loading } = useMe();
  const [draft, setDraft] = useState<Me | null>(null);
  const [saving, setSaving] = useState(false);

  const value = draft ?? me;

  if (loading || !value) return <div className="center-loading">Загрузка профиля…</div>;

  function update<K extends keyof Me>(key: K, val: Me[K]) {
    setDraft((prev) => ({ ...(prev ?? me!), [key]: val }));
  }

  async function save() {
    if (!value) return;
    setSaving(true);
    try {
      const updated = await api.patch<Me>("/users/me", {
        bio: value.bio,
        businessNiche: value.businessNiche,
        city: value.city,
        age: value.age,
        datingEnabled: value.datingEnabled,
        datingBio: value.datingBio,
        datingPhotoUrl: value.datingPhotoUrl,
      });
      setMe(updated);
      setDraft(null);
    } finally {
      setSaving(false);
    }
  }

  const name = [value.firstName, value.lastName].filter(Boolean).join(" ");
  const status = statusInfo[value.datingStatus];

  return (
    <>
      <div className="profile-header">
        <img className="avatar" src={value.photoUrl ?? undefined} alt="" />
        <div className="profile-name">{name}</div>
        {value.businessNiche && <div className="profile-niche">{value.businessNiche}</div>}
      </div>

      <div className="form-section">
        <div>
          <div className="form-label">Ниша / бизнес</div>
          <input
            type="text"
            value={value.businessNiche ?? ""}
            onChange={(e) => update("businessNiche", e.target.value)}
            placeholder="Например: e-commerce, маркетинг, крипта"
          />
        </div>

        <div>
          <div className="form-label">О себе</div>
          <textarea
            value={value.bio ?? ""}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Пару слов о себе"
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="form-label">Город</div>
            <input type="text" value={value.city ?? ""} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div style={{ width: 90 }}>
            <div className="form-label">Возраст</div>
            <input
              type="number"
              value={value.age ?? ""}
              onChange={(e) => update("age", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>

        <div className="toggle-row">
          <div>
            <div style={{ fontWeight: 700 }}>Участвовать в «Знакомствах»</div>
            <div className="form-label" style={{ textTransform: "none" }}>
              Анкета проходит проверку админа перед показом в свайпе
            </div>
          </div>
          <button
            className={`switch ${value.datingEnabled ? "on" : ""}`}
            onClick={() => update("datingEnabled", !value.datingEnabled)}
            aria-label="Переключить участие в знакомствах"
          />
        </div>

        {value.datingEnabled && (
          <>
            {status.label && <div className={`status-badge ${status.className}`}>{status.label}</div>}
            {value.datingStatus === "REJECTED" && value.datingRejectionReason && (
              <div className="status-reason">Причина: {value.datingRejectionReason}</div>
            )}

            <div>
              <div className="form-label">Фото для анкеты знакомств (URL)</div>
              <input
                type="url"
                value={value.datingPhotoUrl ?? ""}
                onChange={(e) => update("datingPhotoUrl", e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div>
              <div className="form-label">Био для анкеты знакомств</div>
              <textarea
                value={value.datingBio ?? ""}
                onChange={(e) => update("datingBio", e.target.value)}
                placeholder="Что ищете, чем занимаетесь"
              />
            </div>
          </>
        )}

        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>

        <ContactAdminButton />
      </div>
    </>
  );
}
