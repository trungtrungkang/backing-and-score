/**
 * Types for Backing & Score Appwrite documents.
 * Matches APPWRITE-BACKEND-DESIGN.md and WEB-DAW-AND-LIVE-VISION.md (Project payload).
 */

export interface ProjectDocument {
  /** Appwrite document ID */
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  /** Owner (Appwrite user ID) */
  userId: string;
  name: string;
  /** Legacy mode label; prefer payload for view type. */
  mode: "practice" | "arrange" | "chart";
  /** Full project data (tracks, arrangement, sectionLibrary, etc.) — JSON string */
  payload: string;
  payloadVersion: number;
  published: boolean;
  publishedAt?: string;
  coverUrl?: string;
  description?: string;
  /** Author email added in Phase 6 */
  creatorEmail?: string;
  /** Project Tags for discovery filters Phase 9 */
  tags?: string[];
  instruments?: string[];
  difficulty?: number;
  durationSec?: number;
}

export type ProjectPayload = Record<string, any>;

export interface PlaylistDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  ownerId: string;
  name: string;
  description?: string;
  isPublished: boolean;
  coverImageId?: string;
  projectIds: string[];
}

export interface FavoriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  targetType: "project" | "playlist";
  targetId: string;
}

export interface PostDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  authorId: string;
  content?: string;
  attachmentType?: "project" | "playlist" | "none";
  attachmentId?: string;
}

export interface CommentDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  postId: string;
  authorId: string;
  content: string;
}

export interface ReactionDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  targetType: "post" | "comment" | "project" | "playlist";
  targetId: string;
  userId: string;
  type: string;
}

export interface FollowDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  followerId: string;
  followingId: string;
}
