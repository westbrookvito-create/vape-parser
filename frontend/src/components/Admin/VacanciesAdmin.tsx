import { useEffect, useState } from "react";
import { api } from "../../api";
import { Vacancy } from "../../types";

export default function VacanciesAdmin() {
  const [vacancies, setVacancies] = useState<Vacancy[] | null>(null);

  useEffect(() => {
    api.get<Vacancy[]>("/admin/vacancies").then(setVacancies);
  }, []);

  async function remove(id: string) {
    await api.del(`/admin/vacancies/${id}`);
    setVacancies((prev) => prev?.filter((v) => v.id !== id) ?? null);
  }

  if (vacancies === null) return <div className="center-loading">Загрузка вакансий…</div>;

  if (vacancies.length === 0) {
    return (
      <div className="empty-state">
        <span className="emoji">💼</span>
        <p>Пока нет опубликованных офферов</p>
      </div>
    );
  }

  return (
    <div className="admin-list">
      {vacancies.map((v) => (
        <div className="admin-card" key={v.id}>
          <div className="admin-card-title">{v.title}</div>
          <div className="admin-card-sub">
            {[v.author.firstName, v.author.lastName].filter(Boolean).join(" ")}
            {v.author.username ? ` · @${v.author.username}` : ""}
          </div>
          <p className="admin-card-text">{v.text}</p>
          <div className="admin-card-actions">
            <button className="admin-btn reject" onClick={() => remove(v.id)}>
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
