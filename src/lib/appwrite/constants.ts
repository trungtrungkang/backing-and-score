/**
 * Appwrite resource IDs. Set via env or use these defaults after creating resources in Console.
 * See docs/appwrite-setup.md.
 */

export const APPWRITE_DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "backing_score_db";

export const APPWRITE_PROJECTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID ?? "projects";

export const APPWRITE_UPLOADS_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_UPLOADS_BUCKET_ID ?? "uploads";

export function isAppwriteConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT &&
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  );
}
