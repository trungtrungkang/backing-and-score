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
