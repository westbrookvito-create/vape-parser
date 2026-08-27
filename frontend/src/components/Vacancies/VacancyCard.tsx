import { Vacancy } from "../../types";

export default function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const name = [vacancy.author.firstName, vacancy.author.lastName].filter(Boolean).join(" ");

  return (
    <article className="post-card">
      <img className="avatar" src={vacancy.author.photoUrl ?? undefined} alt="" />
      <div className="post-body">
        <div className="post-author-row">
          <span className="post-author-name">{name}</span>
          {vacancy.author.businessNiche && <span className="post-niche">· {vacancy.author.businessNiche}</span>}
        </div>
        <div className="vacancy-title">{vacancy.title}</div>
        <p className="post-text">{vacancy.text}</p>
        {vacancy.contact && <div className="vacancy-contact">Контакт: {vacancy.contact}</div>}
      </div>
    </article>
  );
}
