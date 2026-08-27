import { useEffect, useState } from "react";
import { api } from "../../api";
import { Me } from "../../types";

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Me>("/users/me").then(setMe);
  }, []);

  if (!me) return <div className="center-loading">Загрузка профиля…</div>;

  function update<K extends keyof Me>(key: K, value: Me[K]) {
    setMe((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!me) return;
    setSaving(true);
    try {
      const updated = await api.patch<Me>("/users/me", {
        bio: me.bio,
        businessNiche: me.businessNiche,
        city: me.city,
        age: me.age,
        datingEnabled: me.datingEnabled,
        datingBio: me.datingBio,
        datingPhotoUrl: me.datingPhotoUrl,
      });
      setMe(updated);
    } finally {
      setSaving(false);
    }
  }

  const name = [me.firstName, me.lastName].filter(Boolean).join(" ");

  return (
    <>
      <div className="profile-header">
        <img className="avatar" src={me.photoUrl ?? undefined} alt="" />
        <div className="profile-name">{name}</div>
        {me.businessNiche && <div className="profile-niche">{me.businessNiche}</div>}
      </div>

      <div className="form-section">
        <div>
          <div className="form-label">Ниша / бизнес</div>
          <input
            type="text"
            value={me.businessNiche ?? ""}
            onChange={(e) => update("businessNiche", e.target.value)}
            placeholder="Например: e-commerce, маркетинг, крипта"
          />
        </div>

        <div>
          <div className="form-label">О себе</div>
          <textarea value={me.bio ?? ""} onChange={(e) => update("bio", e.target.value)} placeholder="Пару слов о себе" />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="form-label">Город</div>
            <input type="text" value={me.city ?? ""} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div style={{ width: 90 }}>
            <div className="form-label">Возраст</div>
            <input
              type="number"
              value={me.age ?? ""}
              onChange={(e) => update("age", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>

        <div className="toggle-row">
          <div>
            <div style={{ fontWeight: 700 }}>Участвовать в «Знакомствах»</div>
            <div className="form-label" style={{ textTransform: "none" }}>
              Ваша анкета будет показываться другим в свайпе
            </div>
          </div>
          <button
            className={`switch ${me.datingEnabled ? "on" : ""}`}
            onClick={() => update("datingEnabled", !me.datingEnabled)}
            aria-label="Переключить участие в знакомствах"
          />
        </div>

        {me.datingEnabled && (
          <>
            <div>
              <div className="form-label">Фото для анкеты знакомств (URL)</div>
              <input
                type="url"
                value={me.datingPhotoUrl ?? ""}
                onChange={(e) => update("datingPhotoUrl", e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div>
              <div className="form-label">Био для анкеты знакомств</div>
              <textarea
                value={me.datingBio ?? ""}
                onChange={(e) => update("datingBio", e.target.value)}
                placeholder="Что ищете, чем занимаетесь"
              />
            </div>
          </>
        )}

        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>
      </div>
    </>
  );
}
