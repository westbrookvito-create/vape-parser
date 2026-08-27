import { useState } from "react";
import { useMe } from "../../store/MeContext";
import BroadcastAdmin from "./BroadcastAdmin";
import DatingModeration from "./DatingModeration";
import OfferRequests from "./OfferRequests";
import UsersAdmin from "./UsersAdmin";
import VacanciesAdmin from "./VacanciesAdmin";

type Tab = "dating" | "offers" | "vacancies" | "users" | "broadcast";

export default function AdminPage() {
  const { me, loading } = useMe();
  const [tab, setTab] = useState<Tab>("dating");

  if (loading) return <div className="center-loading">Загрузка…</div>;

  if (!me?.isAdmin) {
    return (
      <div className="empty-state">
        <span className="emoji">🔒</span>
        <p>Раздел доступен только администраторам.</p>
      </div>
    );
  }

  return (
    <>
      <div className="dating-subtabs admin-subtabs">
        <button className={tab === "dating" ? "active" : ""} onClick={() => setTab("dating")}>
          Анкеты
        </button>
        <button className={tab === "offers" ? "active" : ""} onClick={() => setTab("offers")}>
          Доступ к офферам
        </button>
        <button className={tab === "vacancies" ? "active" : ""} onClick={() => setTab("vacancies")}>
          Вакансии
        </button>
        <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>
          Пользователи
        </button>
        <button className={tab === "broadcast" ? "active" : ""} onClick={() => setTab("broadcast")}>
          Рассылка
        </button>
      </div>

      {tab === "dating" && <DatingModeration />}
      {tab === "offers" && <OfferRequests />}
      {tab === "vacancies" && <VacanciesAdmin />}
      {tab === "users" && <UsersAdmin />}
      {tab === "broadcast" && <BroadcastAdmin />}
    </>
  );
}
