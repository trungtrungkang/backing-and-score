#!/usr/bin/env node
/**
 * Setup Appwrite database, collection, attributes, indexes, and storage bucket for Backing & Score.
 *
 * Prerequisites:
 * - .env or .env.local with NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY
 * - Create API key in Console: Project → API Keys → Create key with scopes: Databases, Collections, Storage
 *
 * Run: node scripts/setup-appwrite-database.mjs
 * Or:  npm run setup:appwrite
 *
 * Note: Uses createStringAttribute with large size for payload (not longtext) so it works with Appwrite 1.7.x.
 * If you see "SDK built for 1.8.0 / server is 1.7.4" you can ignore it or downgrade node-appwrite to match.
 */

import "dotenv/config";
import { config } from "dotenv";
import { Client, Databases, Storage, Permission, Role, IndexType, OrderBy } from "node-appwrite";

// Load .env.local if present (overrides .env)
config({ path: ".env.local", override: true });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "backing_score_db";
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID || "projects";
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_UPLOADS_BUCKET_ID || "uploads";

function requireEnv(name) {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    console.error(`Missing env: ${name}. Add it to .env or .env.local`);
    console.error("For setup script you need APPWRITE_API_KEY (Console → API Keys, scopes: Databases, Collections, Storage).");
    process.exit(1);
  }
  return v.trim();
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Wait for string/integer/boolean/datetime attribute to be ready. Longtext may not be in getAttribute; use delay instead. */
async function waitForAttribute(databases, databaseId, collectionId, key, maxWaitMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const att = await databases.getAttribute({ databaseId, collectionId, key });
      if (att.status === "available") return;
    } catch (_) {
      // getAttribute may not support all types (e.g. longtext)
    }
    await sleep(800);
  }
  // Timeout is not fatal; attribute may still be building
}

async function main() {
  requireEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
  requireEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  requireEnv("APPWRITE_API_KEY");

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  const databases = new Databases(client);
  const storage = new Storage(client);

  console.log("Using database ID:", DATABASE_ID);
  console.log("Using collection ID:", COLLECTION_ID);
  console.log("Using bucket ID:", BUCKET_ID);

  // 1. Create database
  try {
    await databases.create({ databaseId: DATABASE_ID, name: "Backing & Score DB" });
    console.log("Created database:", DATABASE_ID);
  } catch (e) {
    if (e.code === 409) console.log("Database already exists:", DATABASE_ID);
    else throw e;
  }

  // 2. Create collection with document security (per-document permissions)
  try {
    await databases.createCollection({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      name: "Projects",
      permissions: [Permission.create(Role.users())],
      documentSecurity: true,
    });
    console.log("Created collection:", COLLECTION_ID);
  } catch (e) {
    if (e.code === 409) console.log("Collection already exists:", COLLECTION_ID);
    else throw e;
  }

  // 3. Create attributes (schema from APPWRITE-BACKEND-DESIGN)
  // Use string with large size for payload (compatible with Appwrite 1.7.x; longtext API is 1.8+)
  const attributes = [
    { key: "userId", type: "string", required: true, size: 256 },
    { key: "name", type: "string", required: true, size: 512 },
    { key: "mode", type: "string", required: true, size: 64 },
    { key: "payload", type: "string", required: true, size: 16777216 }, // large string for JSON (1.7.x compatible)
    { key: "payloadVersion", type: "integer", required: true },
    { key: "published", type: "boolean", required: true },
    { key: "publishedAt", type: "datetime", required: false },
    { key: "coverUrl", type: "string", required: false, size: 2048 },
    { key: "description", type: "string", required: false, size: 4096 },
  ];

  for (const attr of attributes) {
    const { key, type, required } = attr;
    try {
      if (type === "string") {
        const size = attr.size ?? 16384;
        await databases.createStringAttribute({ databaseId: DATABASE_ID, collectionId: COLLECTION_ID, key, size, required });
      } else if (type === "integer") {
        await databases.createIntegerAttribute({ databaseId: DATABASE_ID, collectionId: COLLECTION_ID, key, required, ...(required ? {} : { xdefault: 1 }) });
      } else if (type === "boolean") {
        await databases.createBooleanAttribute({ databaseId: DATABASE_ID, collectionId: COLLECTION_ID, key, required, ...(required ? {} : { xdefault: false }) });
      } else if (type === "datetime") {
        await databases.createDatetimeAttribute({ databaseId: DATABASE_ID, collectionId: COLLECTION_ID, key, required });
      }
      console.log("  Attribute created:", key);
      await waitForAttribute(databases, DATABASE_ID, COLLECTION_ID, key);
      await sleep(500);
    } catch (e) {
      if (e.code === 409) {
        console.log("  Attribute already exists:", key);
      } else throw e;
    }
  }

  // 4. Create indexes for listDocuments queries (APPWRITE-BACKEND-DESIGN)
  // My projects: filter userId, sort $updatedAt desc
  // Discovery: filter published = true, sort publishedAt desc
  const indexes = [
    { key: "user_updated", type: IndexType.Key, attributes: ["userId", "$updatedAt"], orders: [OrderBy.Desc] },
    { key: "published_at", type: IndexType.Key, attributes: ["published", "publishedAt"], orders: [OrderBy.Desc] },
  ];
  for (const idx of indexes) {
    try {
      await databases.createIndex({
        databaseId: DATABASE_ID,
        collectionId: COLLECTION_ID,
        key: idx.key,
        type: idx.type,
        attributes: idx.attributes,
        orders: idx.orders,
      });
      console.log("  Index created:", idx.key);
    } catch (e) {
      if (e.code === 409) console.log("  Index already exists:", idx.key);
      else throw e;
    }
    await sleep(500);
  }

  // 5. Create storage bucket (uploads)
  try {
    await storage.createBucket({
      bucketId: BUCKET_ID,
      name: "Uploads",
      fileSecurity: true,
      permissions: [Permission.create(Role.users())],
      maximumFileSize: 10 * 1024 * 1024, // 10 MB
      allowedFileExtensions: ["musicxml", "xml", "mxl", "mid", "midi"],
    });
    console.log("Created storage bucket:", BUCKET_ID);
  } catch (e) {
    if (e.code === 409) {
      console.log("Bucket already exists:", BUCKET_ID);
    } else throw e;
  }

  console.log("\nDone. Database, collection, attributes, indexes, and bucket are ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
