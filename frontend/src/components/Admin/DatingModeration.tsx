import { useEffect, useState } from "react";
import { api } from "../../api";
import { DatingPendingProfile } from "../../types";

function displayName(p: DatingPendingProfile) {
  return [p.firstName, p.lastName].filter(Boolean).join(" ") + (p.age ? `, ${p.age}` : "");
}

export default function DatingModeration() {
  const [profiles, setProfiles] = useState<DatingPendingProfile[] | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  function load() {
    api.get<DatingPendingProfile[]>("/admin/dating/pending").then(setProfiles);
  }

  useEffect(load, []);

  async function approve(id: string) {
    await api.post(`/admin/dating/${id}/approve`);
    setProfiles((prev) => prev?.filter((p) => p.id !== id) ?? null);
  }

  async function reject(id: string) {
    await api.post(`/admin/dating/${id}/reject`, { reason });
    setProfiles((prev) => prev?.filter((p) => p.id !== id) ?? null);
    setRejectingId(null);
    setReason("");
  }

  if (profiles === null) return <div className="center-loading">Загрузка анкет…</div>;

  if (profiles.length === 0) {
    return (
      <div className="empty-state">
        <span className="emoji">✅</span>
        <p>Нет анкет на модерации</p>
      </div>
    );
  }

  return (
    <div className="admin-list">
      {profiles.map((p) => (
        <div className="admin-card" key={p.id}>
          <div className="admin-card-header">
            <img className="avatar" src={p.datingPhotoUrl ?? p.photoUrl ?? undefined} alt="" />
            <div>
              <div className="admin-card-title">{displayName(p)}</div>
              <div className="admin-card-sub">
                {[p.businessNiche, p.city, p.username ? `@${p.username}` : null].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
          {p.datingBio && <p className="admin-card-text">{p.datingBio}</p>}

          {rejectingId === p.id ? (
            <div className="admin-reject-row">
              <input
                type="text"
                placeholder="Причина отказа (необязательно)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="admin-card-actions">
                <button className="admin-btn reject" onClick={() => reject(p.id)}>
                  Подтвердить отказ
                </button>
                <button className="admin-btn" onClick={() => setRejectingId(null)}>
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-card-actions">
              <button className="admin-btn approve" onClick={() => approve(p.id)}>
                Одобрить
              </button>
              <button className="admin-btn reject" onClick={() => setRejectingId(p.id)}>
                Отклонить
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
