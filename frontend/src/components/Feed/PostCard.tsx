import { useState } from "react";
import { api } from "../../api";
import { Post } from "../../types";
import { haptic } from "../../telegram";
import { CommentIcon, HeartIcon } from "../common/Icons";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "сейчас";
  if (min < 60) return `${min}м`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}ч`;
  return `${Math.floor(hours / 24)}д`;
}

function displayName(p: { firstName: string; lastName?: string | null }) {
  return [p.firstName, p.lastName].filter(Boolean).join(" ");
}

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  async function toggleLike() {
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    haptic("light");
    try {
      const res = await api.post<{ liked: boolean }>(`/feed/${post.id}/like`);
      setLiked(res.liked);
    } catch {
      setLiked((v) => !v);
      setLikeCount((c) => c + (liked ? 1 : -1));
    }
  }

  async function submitComment() {
    const text = commentText.trim();
    if (!text) return;
    setCommentText("");
    const comment = await api.post<Post["comments"][number]>(`/feed/${post.id}/comments`, { text });
    setComments((c) => [...c, comment]);
  }

  return (
    <article className="post-card">
      <img className="avatar" src={post.author.photoUrl ?? undefined} alt="" />
      <div className="post-body">
        <div className="post-author-row">
          <span className="post-author-name">{displayName(post.author)}</span>
          {post.author.businessNiche && <span className="post-niche">· {post.author.businessNiche}</span>}
          <span className="post-time">{timeAgo(post.createdAt)}</span>
        </div>
        <p className="post-text">{post.text}</p>
        <div className="post-actions">
          <button className={`post-action-btn ${liked ? "liked" : ""}`} onClick={toggleLike}>
            <HeartIcon filled={liked} />
            {likeCount > 0 && likeCount}
          </button>
          <button className="post-action-btn" onClick={() => setShowComments((v) => !v)}>
            <CommentIcon />
            {comments.length > 0 && comments.length}
          </button>
        </div>

        {showComments && (
          <>
            {comments.map((c) => (
              <div className="comment-row" key={c.id}>
                <img className="avatar sm" src={c.author.photoUrl ?? undefined} alt="" />
                <span className="comment-text">
                  <span className="comment-author">{displayName(c.author)}</span>
                  {c.text}
                </span>
              </div>
            ))}
            <div className="comment-input-row">
              <input
                type="text"
                placeholder="Написать комментарий…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
              />
              <button className="post-action-btn" onClick={submitComment}>
                Отпр.
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
