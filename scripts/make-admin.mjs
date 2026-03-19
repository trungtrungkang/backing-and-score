#!/usr/bin/env node
/**
 * Utility script to manually elevate a user to 'admin' and 'creator' roles via Appwrite User Labels.
 * 
 * Run: node scripts/make-admin.mjs <USER_EMAIL_OR_ID>
 */

import "dotenv/config";
import { config } from "dotenv";
import { Client, Users } from "node-appwrite";

config({ path: ".env.local", override: true });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error("Missing required environment variables (ENDPOINT, PROJECT_ID, API_KEY)");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const users = new Users(client);

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node scripts/make-admin.mjs <USER_EMAIL_OR_ID>");
    process.exit(1);
  }

  let finalUserId = target;

  console.log(`Looking up user: ${target}...`);
  if (target.includes("@")) {
    const list = await users.list();
    const user = list.users.find(u => u.email === target);
    if (!user) {
      console.error(`User with email ${target} not found!`);
      process.exit(1);
    }
    finalUserId = user.$id;
    console.log(`Found user ID: ${finalUserId}`);
  }

  // Get current user to merge labels
  console.log(`Fetching current labels...`);
  const currentUser = await users.get(finalUserId);
  const currentLabels = new Set(currentUser.labels || []);
  
  console.log(`Current labels:`, Array.from(currentLabels));
  
  currentLabels.add("admin");
  currentLabels.add("creator");

  console.log(`Updating labels to:`, Array.from(currentLabels));
  
  await users.updateLabels(finalUserId, Array.from(currentLabels));
  
  console.log("✅ Successfully elevated user to Admin and Creator!");
}

main().catch(console.error);
