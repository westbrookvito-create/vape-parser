import { useRef, useState } from "react";
import { DatingCandidate } from "../../types";
import { haptic } from "../../telegram";

function displayName(c: DatingCandidate) {
  return [c.firstName, c.lastName].filter(Boolean).join(" ") + (c.age ? `, ${c.age}` : "");
}

export default function SwipeDeck({
  candidate,
  onSwipe,
}: {
  candidate: DatingCandidate;
  onSwipe: (direction: "LIKE" | "PASS") => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const start = useRef({ x: 0, y: 0 });

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, active: true });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.active) return;
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y, active: true });
  }

  function finish(direction: "LIKE" | "PASS") {
    haptic(direction === "LIKE" ? "medium" : "light");
    onSwipe(direction);
    setDrag({ x: 0, y: 0, active: false });
  }

  function onPointerUp() {
    if (Math.abs(drag.x) > 110) {
      finish(drag.x > 0 ? "LIKE" : "PASS");
    } else {
      setDrag({ x: 0, y: 0, active: false });
    }
  }

  const rotate = drag.x / 18;
  const likeOpacity = Math.min(Math.max(drag.x / 100, 0), 1);
  const passOpacity = Math.min(Math.max(-drag.x / 100, 0), 1);
  const photo = candidate.datingPhotoUrl ?? candidate.photoUrl;

  return (
    <div className="swipe-area">
      <div
        ref={cardRef}
        className="swipe-card"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotate}deg)`,
          transition: drag.active ? "none" : "transform 0.25s ease",
        }}
      >
        {photo && <img src={photo} alt="" />}
        <span className="swipe-badge like" style={{ opacity: likeOpacity }}>
          LIKE
        </span>
        <span className="swipe-badge pass" style={{ opacity: passOpacity }}>
          PASS
        </span>
        <div className="swipe-card-info">
          <h2>{displayName(candidate)}</h2>
          {(candidate.businessNiche || candidate.city) && (
            <div className="niche">{[candidate.businessNiche, candidate.city].filter(Boolean).join(" · ")}</div>
          )}
          {candidate.datingBio && <p>{candidate.datingBio}</p>}
        </div>
      </div>

      <div className="swipe-controls">
        <button className="swipe-btn pass" onClick={() => finish("PASS")} aria-label="Пропустить">
          ✕
        </button>
        <button className="swipe-btn like" onClick={() => finish("LIKE")} aria-label="Нравится">
          ♥
        </button>
      </div>
    </div>
  );
}
