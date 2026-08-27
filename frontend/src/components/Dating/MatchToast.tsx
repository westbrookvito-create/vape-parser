import { useNavigate } from "react-router-dom";
import { MatchSummary } from "../../types";

export default function MatchToast({ match, onClose }: { match: MatchSummary; onClose: () => void }) {
  const navigate = useNavigate();
  const name = [match.other.firstName, match.other.lastName].filter(Boolean).join(" ");

  return (
    <div className="match-toast">
      <h2>🎉 Это мэтч!</h2>
      <p>Вы с {name} понравились друг другу</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose}>Продолжить</button>
        <button onClick={() => navigate(`/dating/chat/${match.id}`)}>Написать</button>
      </div>
    </div>
  );
}
