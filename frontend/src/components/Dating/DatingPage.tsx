import { useEffect, useState } from "react";
import { api } from "../../api";
import { DatingCandidate, MatchSummary } from "../../types";
import MatchesList from "./MatchesList";
import MatchToast from "./MatchToast";
import SwipeDeck from "./SwipeDeck";

export default function DatingPage() {
  const [tab, setTab] = useState<"swipe" | "matches">("swipe");
  const [candidate, setCandidate] = useState<DatingCandidate | null | undefined>(undefined);
  const [match, setMatch] = useState<MatchSummary | null>(null);

  async function loadNext() {
    setCandidate(undefined);
    const res = await api.get<{ candidate: DatingCandidate | null }>("/dating/next");
    setCandidate(res.candidate);
  }

  useEffect(() => {
    if (tab === "swipe") loadNext();
  }, [tab]);

  async function handleSwipe(direction: "LIKE" | "PASS") {
    if (!candidate) return;
    const res = await api.post<{ match: { id: string; userA: DatingCandidate; userB: DatingCandidate } | null }>(
      "/dating/swipe",
      { toUserId: candidate.id, direction }
    );
    if (res.match) {
      setMatch({
        id: res.match.id,
        other: candidate,
        lastMessage: null,
        createdAt: new Date().toISOString(),
      });
    }
    loadNext();
  }

  return (
    <>
      <div className="dating-subtabs">
        <button className={tab === "swipe" ? "active" : ""} onClick={() => setTab("swipe")}>
          Свайп
        </button>
        <button className={tab === "matches" ? "active" : ""} onClick={() => setTab("matches")}>
          Мэтчи
        </button>
      </div>

      {tab === "swipe" &&
        (candidate === undefined ? (
          <div className="center-loading">Ищем анкеты…</div>
        ) : candidate === null ? (
          <div className="empty-state">
            <span className="emoji">🙌</span>
            <p>Анкеты закончились. Загляните позже — здесь появляются новые участники.</p>
          </div>
        ) : (
          <SwipeDeck key={candidate.id} candidate={candidate} onSwipe={handleSwipe} />
        ))}

      {tab === "matches" && <MatchesList />}

      {match && <MatchToast match={match} onClose={() => setMatch(null)} />}
    </>
  );
}
