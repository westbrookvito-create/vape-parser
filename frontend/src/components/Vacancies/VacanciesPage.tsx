import { useEffect, useState } from "react";
import { api } from "../../api";
import { useMe } from "../../store/MeContext";
import { OfferRequest, Vacancy } from "../../types";
import ContactAdminButton from "../common/ContactAdminButton";
import ComposeVacancy from "./ComposeVacancy";
import VacancyCard from "./VacancyCard";

export default function VacanciesPage() {
  const { me, refetch } = useMe();
  const [vacancies, setVacancies] = useState<Vacancy[] | null>(null);
  const [request, setRequest] = useState<OfferRequest | null | undefined>(undefined);
  const [composing, setComposing] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    api.get<Vacancy[]>("/vacancies").then(setVacancies);
    if (!me?.canPostOffers) {
      api.get<OfferRequest | null>("/users/me/offer-request").then(setRequest);
    }
  }, [me?.canPostOffers]);

  async function createVacancy(data: { title: string; text: string; contact: string }) {
    const vacancy = await api.post<Vacancy>("/vacancies", data);
    setVacancies((prev) => [vacancy, ...(prev ?? [])]);
  }

  async function requestAccess() {
    setRequesting(true);
    try {
      const req = await api.post<OfferRequest>("/users/me/offer-request");
      setRequest(req);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <>
      <div className="vacancy-access-banner">
        {me?.canPostOffers ? (
          <p>У вас есть право публиковать офферы. Нажмите «+», чтобы добавить новый.</p>
        ) : request === undefined ? null : request === null ? (
          <>
            <p>Публиковать офферы можно только с разрешения админа.</p>
            <button className="btn-primary" onClick={requestAccess} disabled={requesting}>
              {requesting ? "Отправляем…" : "Запросить доступ к публикации"}
            </button>
            <ContactAdminButton label="Написать админу напрямую" />
          </>
        ) : request.status === "PENDING" ? (
          <p>⏳ Заявка на публикацию офферов на рассмотрении у админа.</p>
        ) : request.status === "REJECTED" ? (
          <>
            <p>❌ Заявка отклонена.</p>
            <ContactAdminButton label="Уточнить у админа" />
          </>
        ) : null}
      </div>

      {vacancies === null ? (
        <div className="center-loading">Загрузка офферов…</div>
      ) : vacancies.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">💼</span>
          <p>Пока нет офферов. Публиковать их могут пользователи с разрешением от админа.</p>
        </div>
      ) : (
        vacancies.map((v) => <VacancyCard key={v.id} vacancy={v} />)
      )}

      {me?.canPostOffers && (
        <button className="fab" onClick={() => setComposing(true)} aria-label="Новый оффер">
          +
        </button>
      )}

      {composing && (
        <ComposeVacancy
          onClose={() => setComposing(false)}
          onSubmit={async (data) => {
            await createVacancy(data);
            await refetch();
          }}
        />
      )}
    </>
  );
}
