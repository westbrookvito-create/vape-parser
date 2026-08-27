import { useEffect, useState } from "react";
import { api } from "../../api";
import { Post } from "../../types";
import ComposePost from "./ComposePost";
import PostCard from "./PostCard";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    api.get<{ posts: Post[] }>("/feed").then((r) => setPosts(r.posts));
  }, []);

  async function createPost(text: string, imageUrl: string) {
    const post = await api.post<Post>("/feed", { text, imageUrl: imageUrl || undefined });
    setPosts((prev) => [post, ...(prev ?? [])]);
  }

  if (posts === null) return <div className="center-loading">Загрузка ленты…</div>;

  return (
    <>
      {posts.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">📝</span>
          <p>Пока нет постов. Будьте первым, кто поделится новостью!</p>
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}

      <button className="fab" onClick={() => setComposing(true)} aria-label="Новый пост">
        +
      </button>

      {composing && <ComposePost onClose={() => setComposing(false)} onSubmit={createPost} />}
    </>
  );
}
