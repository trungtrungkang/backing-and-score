#!/usr/bin/env node
/**
 * Setup Appwrite database, collections, attributes, indexes, and storage bucket for Lotusa V2.
 * Includes the new relational schema for tags, instruments, difficulty, and setlists.
 *
 * Prerequisites:
 * - .env or .env.local with NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY
 * - Create API key in Console: Project → API Keys → Create key with scopes: Databases, Collections, Storage
 *
 * Run: node scripts/setup-appwrite-v2.mjs
 */

import "dotenv/config";
import { config } from "dotenv";
import { Client, Databases, Storage, Permission, Role, IndexType, OrderBy } from "node-appwrite";

config({ path: ".env.local", override: true });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "backing_score_db";
const PROJECTS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID || "projects";
const SETLISTS_COLLECTION = "setlists";
const SETLIST_ITEMS_COLLECTION = "setlist_items";
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_UPLOADS_BUCKET_ID || "uploads";

function requireEnv(name) {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    console.error(`Missing env: ${name}. Add it to .env or .env.local`);
    process.exit(1);
  }
  return v.trim();
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForAttribute(databases, databaseId, collectionId, key, maxWaitMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const att = await databases.getAttribute({ databaseId, collectionId, key });
      if (att.status === "available") return;
    } catch (_) { }
    await sleep(800);
  }
}

async function createAttributes(databases, collectionId, attributes) {
  for (const attr of attributes) {
    const { key, type, required, array } = attr;
    try {
      if (type === "string") {
        const size = attr.size ?? 256;
        await databases.createStringAttribute({ databaseId: DATABASE_ID, collectionId, key, size, required, array });
      } else if (type === "integer") {
        await databases.createIntegerAttribute({ databaseId: DATABASE_ID, collectionId, key, required, array, ...(required ? {} : { xdefault: 0 }) });
      } else if (type === "boolean") {
        await databases.createBooleanAttribute({ databaseId: DATABASE_ID, collectionId, key, required, array, ...(required ? {} : { xdefault: false }) });
      } else if (type === "datetime") {
        await databases.createDatetimeAttribute({ databaseId: DATABASE_ID, collectionId, key, required, array });
      }
      console.log(`  Attribute created: ${collectionId}.${key}`);
      await waitForAttribute(databases, DATABASE_ID, collectionId, key);
      await sleep(500);
    } catch (e) {
      if (e.code === 409) {
        console.log(`  Attribute already exists: ${collectionId}.${key}`);
      } else throw e;
    }
  }
}

async function main() {
  requireEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
  requireEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  requireEnv("APPWRITE_API_KEY");

  const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
  const databases = new Databases(client);
  const storage = new Storage(client);

  console.log("Setting up Appwrite V2 Schema...");

  // 1. Database
  try {
    await databases.create(DATABASE_ID, "Backing & Score DB");
    console.log("Created database:", DATABASE_ID);
  } catch (e) {
    if (e.code === 409 || e.code === 403) console.log("Database already exists or limit check preempted creation:", DATABASE_ID);
    else throw e;
  }

  // 2. Collections
  const collections = [
    { id: PROJECTS_COLLECTION, name: "Projects" },
    { id: SETLISTS_COLLECTION, name: "Setlists" },
    { id: SETLIST_ITEMS_COLLECTION, name: "Setlist Items" }
  ];

  for (const col of collections) {
    const isProject = col.id === PROJECTS_COLLECTION;
    const permissions = isProject ? [
      Permission.create(Role.label("admin")),
      Permission.create(Role.label("creator")),
      Permission.update(Role.label("admin")),
      Permission.delete(Role.label("admin")),
      Permission.read(Role.label("admin"))
    ] : [
      Permission.create(Role.users()),
      Permission.update(Role.label("admin")),
      Permission.delete(Role.label("admin")),
      Permission.read(Role.label("admin"))
    ];

    try {
      await databases.createCollection({
        databaseId: DATABASE_ID,
        collectionId: col.id,
        name: col.name,
        permissions,
        documentSecurity: true
      });
      console.log("Created collection:", col.id);
    } catch (e) {
      if (e.code === 409) {
        console.log("Collection already exists, updating permissions:", col.id);
        await databases.updateCollection({
          databaseId: DATABASE_ID,
          collectionId: col.id,
          name: col.name,
          permissions,
          documentSecurity: true,
          enabled: true
        });
      } else throw e;
    }
  }

  // 3. Attributes for Projects
  console.log("Creating attributes for Projects...");
  await createAttributes(databases, PROJECTS_COLLECTION, [
    { key: "userId", type: "string", required: true, size: 256 },
    { key: "name", type: "string", required: true, size: 512 },
    { key: "mode", type: "string", required: true, size: 64 },
    { key: "payload", type: "string", required: true, size: 16777216 }, // Large JSON
    { key: "payloadVersion", type: "integer", required: true },
    { key: "published", type: "boolean", required: true },
    { key: "publishedAt", type: "datetime", required: false },
    { key: "coverUrl", type: "string", required: false, size: 2048 },
    { key: "description", type: "string", required: false, size: 4096 },
    { key: "creatorEmail", type: "string", required: false, size: 256 },
    // V2 New Fields
    { key: "tags", type: "string", required: false, size: 100, array: true },
    { key: "instruments", type: "string", required: false, size: 100, array: true },
    { key: "difficulty", type: "integer", required: false, array: false },
    { key: "durationSec", type: "integer", required: false, array: false },
  ]);

  // 4. Attributes for Setlists
  console.log("Creating attributes for Setlists...");
  await createAttributes(databases, SETLISTS_COLLECTION, [
    { key: "userId", type: "string", required: true, size: 256 },
    { key: "name", type: "string", required: true, size: 512 },
    { key: "createdAt", type: "datetime", required: false },
  ]);

  // 5. Attributes for Setlist Items
  console.log("Creating attributes for Setlist Items...");
  await createAttributes(databases, SETLIST_ITEMS_COLLECTION, [
    { key: "setlistId", type: "string", required: true, size: 256 },
    { key: "projectId", type: "string", required: true, size: 256 },
    { key: "orderIndex", type: "integer", required: true },
  ]);

  // 6. Indexes
  const indexes = [
    { collection: PROJECTS_COLLECTION, key: "user_updated", type: IndexType.Key, attributes: ["userId", "$updatedAt"], orders: [OrderBy.Desc] },
    { collection: PROJECTS_COLLECTION, key: "published_at", type: IndexType.Key, attributes: ["published", "publishedAt"], orders: [OrderBy.Desc] },
    { collection: SETLISTS_COLLECTION, key: "user_created", type: IndexType.Key, attributes: ["userId", "createdAt"], orders: [OrderBy.Desc] },
    { collection: SETLIST_ITEMS_COLLECTION, key: "setlist_order", type: IndexType.Key, attributes: ["setlistId", "orderIndex"], orders: [OrderBy.Asc] },
  ];

  for (const idx of indexes) {
    try {
      await databases.createIndex({
        databaseId: DATABASE_ID,
        collectionId: idx.collection,
        key: idx.key,
        type: idx.type,
        attributes: idx.attributes,
        orders: idx.orders,
      });
      console.log(`  Index created: ${idx.collection}.${idx.key}`);
    } catch (e) {
      if (e.code === 409) console.log(`  Index already exists: ${idx.collection}.${idx.key}`);
      else throw e;
    }
    await sleep(500);
  }

  // 7. Storage Bucket
  try {
    // Note: If you want to allow audio uploads, we add audio types.
    await storage.createBucket({
      bucketId: BUCKET_ID,
      name: "Uploads",
      fileSecurity: true,
      permissions: [Permission.create(Role.users())],
      maximumFileSize: 50 * 1024 * 1024, // 50 MB
      allowedFileExtensions: ["musicxml", "xml", "mxl", "mid", "midi", "wav", "mp3", "ogg"],
    });
    console.log("Created storage bucket:", BUCKET_ID);
  } catch (e) {
    if (e.code === 409) {
      console.log("Bucket already exists:", BUCKET_ID);
    } else throw e;
  }

  console.log("\n✅ V2 Appwrite Setup Complete. You can now use the new collections and attributes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
