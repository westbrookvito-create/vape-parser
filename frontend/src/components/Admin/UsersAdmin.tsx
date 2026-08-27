import { useEffect, useState } from "react";
import { api } from "../../api";
import { AdminUser } from "../../types";

const statusLabels: Record<AdminUser["datingStatus"], string> = {
  NONE: "—",
  PENDING: "на проверке",
  APPROVED: "одобрена",
  REJECTED: "отклонена",
};

export default function UsersAdmin() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [query, setQuery] = useState("");

  function load(q = "") {
    api.get<AdminUser[]>(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`).then(setUsers);
  }

  useEffect(() => load(), []);

  async function toggleOffers(u: AdminUser) {
    const updated = await api.post<AdminUser>(`/admin/users/${u.id}/offer-permission`, {
      canPostOffers: !u.canPostOffers,
    });
    setUsers((prev) => prev?.map((p) => (p.id === u.id ? { ...p, canPostOffers: updated.canPostOffers } : p)) ?? null);
  }

  async function toggleAdmin(u: AdminUser) {
    try {
      const updated = await api.post<AdminUser>(`/admin/users/${u.id}/admin`, { isAdmin: !u.isAdmin });
      setUsers((prev) => prev?.map((p) => (p.id === u.id ? { ...p, isAdmin: updated.isAdmin } : p)) ?? null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка");
    }
  }

  return (
    <div className="admin-list">
      <div style={{ padding: "10px 16px 0" }}>
        <input
          type="text"
          placeholder="Поиск по имени или @username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(query)}
        />
      </div>

      {users === null ? (
        <div className="center-loading">Загрузка…</div>
      ) : (
        users.map((u) => (
          <div className="admin-card" key={u.id}>
            <div className="admin-card-header">
              <img className="avatar" src={u.photoUrl ?? undefined} alt="" />
              <div>
                <div className="admin-card-title">
                  {[u.firstName, u.lastName].filter(Boolean).join(" ")}
                  {u.isAdmin && <span className="admin-badge">админ</span>}
                </div>
                <div className="admin-card-sub">
                  {u.username ? `@${u.username} · ` : ""}
                  Знакомства: {statusLabels[u.datingStatus]}
                </div>
              </div>
            </div>
            <div className="admin-card-actions">
              <button className={`admin-btn ${u.canPostOffers ? "approve" : ""}`} onClick={() => toggleOffers(u)}>
                {u.canPostOffers ? "Право на офферы: есть ✕" : "Дать право на офферы"}
              </button>
              <button className="admin-btn" onClick={() => toggleAdmin(u)}>
                {u.isAdmin ? "Забрать админку" : "Сделать админом"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
