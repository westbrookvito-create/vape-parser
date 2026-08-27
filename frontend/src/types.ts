export interface PublicUser {
  id: string;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
  businessNiche?: string | null;
}

export interface Me extends PublicUser {
  bio?: string | null;
  city?: string | null;
  age?: number | null;
  datingEnabled: boolean;
  datingBio?: string | null;
  datingPhotoUrl?: string | null;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: PublicUser;
}

export interface Post {
  id: string;
  text: string;
  imageUrl?: string | null;
  createdAt: string;
  author: PublicUser;
  likes: { userId: string }[];
  comments: Comment[];
  likedByMe: boolean;
}

export interface DatingCandidate {
  id: string;
  firstName: string;
  lastName?: string | null;
  age?: number | null;
  city?: string | null;
  businessNiche?: string | null;
  datingBio?: string | null;
  datingPhotoUrl?: string | null;
  photoUrl?: string | null;
}

export interface MatchSummary {
  id: string;
  other: DatingCandidate;
  lastMessage: { text: string; createdAt: string } | null;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: string;
}
