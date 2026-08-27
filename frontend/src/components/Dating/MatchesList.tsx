import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { MatchSummary } from "../../types";

export default function MatchesList() {
  const [matches, setMatches] = useState<MatchSummary[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<MatchSummary[]>("/dating/matches").then(setMatches);
  }, []);

  if (matches === null) return <div className="center-loading">Загрузка мэтчей…</div>;

  if (matches.length === 0) {
    return (
      <div className="empty-state">
        <span className="emoji">💬</span>
        <p>Пока нет мэтчей. Свайпайте анкеты во вкладке «Свайп»!</p>
      </div>
    );
  }

  return (
    <div>
      {matches.map((m) => {
        const name = [m.other.firstName, m.other.lastName].filter(Boolean).join(" ");
        const photo = m.other.datingPhotoUrl ?? m.other.photoUrl;
        return (
          <div className="match-row" key={m.id} onClick={() => navigate(`/dating/chat/${m.id}`)}>
            <img className="avatar" src={photo ?? undefined} alt="" />
            <div>
              <div className="match-name">{name}</div>
              <div className="match-last-msg">{m.lastMessage ? m.lastMessage.text : "Скажите привет 👋"}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
