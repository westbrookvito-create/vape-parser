export interface PublicUser {
  id: string;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
  businessNiche?: string | null;
}

export type DatingStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Me extends PublicUser {
  bio?: string | null;
  city?: string | null;
  age?: number | null;
  datingEnabled: boolean;
  datingBio?: string | null;
  datingPhotoUrl?: string | null;
  datingStatus: DatingStatus;
  datingRejectionReason?: string | null;
  isAdmin: boolean;
  canPostOffers: boolean;
}

export interface OfferRequest {
  id: string;
  userId: string;
  message?: string | null;
  status: RequestStatus;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface OfferRequestWithUser extends OfferRequest {
  user: PublicUser & { age?: number | null; city?: string | null };
}

export interface Vacancy {
  id: string;
  title: string;
  text: string;
  contact?: string | null;
  createdAt: string;
  author: PublicUser;
}

export interface AdminUser extends PublicUser {
  age?: number | null;
  city?: string | null;
  isAdmin: boolean;
  canPostOffers: boolean;
  datingStatus: DatingStatus;
  createdAt: string;
}

export interface DatingPendingProfile {
  id: string;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  age?: number | null;
  city?: string | null;
  businessNiche?: string | null;
  datingBio?: string | null;
  datingPhotoUrl?: string | null;
  photoUrl?: string | null;
  updatedAt: string;
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
