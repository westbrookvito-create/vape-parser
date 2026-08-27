import { useEffect, useState } from "react";
import { api } from "../../api";
import { OfferRequestWithUser } from "../../types";

function displayName(u: OfferRequestWithUser["user"]) {
  return [u.firstName, u.lastName].filter(Boolean).join(" ");
}

export default function OfferRequests() {
  const [requests, setRequests] = useState<OfferRequestWithUser[] | null>(null);

  function load() {
    api.get<OfferRequestWithUser[]>("/admin/offer-requests?status=PENDING").then(setRequests);
  }

  useEffect(load, []);

  async function approve(id: string) {
    await api.post(`/admin/offer-requests/${id}/approve`);
    setRequests((prev) => prev?.filter((r) => r.id !== id) ?? null);
  }

  async function reject(id: string) {
    await api.post(`/admin/offer-requests/${id}/reject`);
    setRequests((prev) => prev?.filter((r) => r.id !== id) ?? null);
  }

  if (requests === null) return <div className="center-loading">Загрузка заявок…</div>;

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <span className="emoji">✅</span>
        <p>Нет заявок на публикацию офферов</p>
      </div>
    );
  }

  return (
    <div className="admin-list">
      {requests.map((r) => (
        <div className="admin-card" key={r.id}>
          <div className="admin-card-header">
            <img className="avatar" src={r.user.photoUrl ?? undefined} alt="" />
            <div>
              <div className="admin-card-title">{displayName(r.user)}</div>
              <div className="admin-card-sub">
                {[r.user.businessNiche, r.user.city, r.user.username ? `@${r.user.username}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
          </div>
          {r.message && <p className="admin-card-text">«{r.message}»</p>}
          <div className="admin-card-actions">
            <button className="admin-btn approve" onClick={() => approve(r.id)}>
              Выдать доступ
            </button>
            <button className="admin-btn reject" onClick={() => reject(r.id)}>
              Отклонить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
