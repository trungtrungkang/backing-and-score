# Appwrite setup for Backing & Score

This guide walks through creating the Appwrite project, database, collection, and storage bucket so the app can use Auth, My projects, and Discovery. Design reference: **Backing-and-Score/APPWRITE-BACKEND-DESIGN.md**.

---

## 1. Create Appwrite project

1. Go to [Appwrite Console](https://cloud.appwrite.io/console) (or your self-hosted URL).
2. Create a new project (e.g. **Backing & Score**).
3. **Add a Web platform:** Hostname `localhost` for dev; add your production domain later. This fixes CORS.

---

## 2. Env vars in the app

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```
2. In Appwrite Console → your project → **Settings** (or **Overview**):
   - **Endpoint:** e.g. `https://cloud.appwrite.io/v1` (or your region).
   - **Project ID:** copy the project ID.
3. In **API Keys** create a key with scopes: **Databases**, **Collections**, **Storage** (for the setup script).
4. In `.env` or `.env.local` set:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_API_KEY=your_api_key_here
   ```
5. **Run the setup script** to create database, collection, attributes, and bucket:
   ```bash
   npm run setup:appwrite
   ```
   This creates the `backing_score_db` database, `projects` collection (with all attributes), indexes for My projects and Discovery queries, and `uploads` bucket. If they already exist, the script skips them.
6. Restart the dev server (`npm run dev`).

---

## 3. Database and collection (or use script)

If you did **not** run `npm run setup:appwrite`, create these manually:

1. In the project, open **Databases** → **Create database**.
   - Name: e.g. **Backing Score DB**.
   - Database ID: use `backing_score_db` (or set `NEXT_PUBLIC_APPWRITE_DATABASE_ID` in `.env.local` to match).

2. **Create collection** inside that database:
   - Name: e.g. **Projects**.
   - Collection ID: `projects` (or set `NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID`).

3. **Add attributes** to the `projects` collection:

   | Attribute ID   | Type    | Required | Default |
   |----------------|---------|----------|---------|
   | `userId`       | string  | yes      | —       |
   | `name`         | string  | yes      | —       |
   | `mode`         | string  | yes      | —       |
   | `payload`      | string  | yes      | —       |
   | `payloadVersion` | integer | yes    | 1       |
   | `published`    | boolean | yes      | false   |
   | `publishedAt`  | string  | no       | —       |
   | `coverUrl`     | string  | no       | —       |
   | `description`  | string  | no       | —       |

   (`payload` stores the full project JSON; size limit may apply, so use a large enough limit in Appwrite if needed.)

4. **Permissions** for `projects`:
   - **Create:** role `users` (any logged-in user).
   - **Read:**  
     - owner (userId = current user);  
     - or anyone when `published` = true (for Discovery).  
     Use Appwrite rules: e.g. “Read if `userId` = request.user.id OR `published` = true”.
   - **Update / Delete:** only owner (`userId` = request.user.id).

   In Console you can set:
   - Create: Users
   - Read: “Custom” → e.g. `userId == request.user.id || published == true`
   - Update: “Custom” → `userId == request.user.id`
   - Delete: “Custom” → `userId == request.user.id`

---

## 4. Storage bucket (uploads)

1. **Storage** → **Create bucket**.
   - Name: e.g. **Uploads**.
   - Bucket ID: `uploads` (or set `NEXT_PUBLIC_APPWRITE_UPLOADS_BUCKET_ID`).

2. **Bucket settings:**
   - Allowed file extensions: e.g. `musicxml`, `xml`, `mxl`, `mid`, `midi` (or leave open for dev).
   - Max file size: e.g. 10 MB.

3. **Permissions:**
   - Create, Read, Update, Delete: owner (user who uploaded). In Appwrite: use “Users” with “own” or custom rule “request.user.id” for the file’s owner.

---

## 5. Auth (optional for first run)

- **Auth** is enabled by default; the app uses **Email/Password** (Account API).
- In Console → **Auth** → **Settings** you can enable “Email/Password” and optionally “Anonymous” or OAuth providers.

---

## 6. Verify

- Set `.env.local` and restart the app.
- Open the app; if you use an “Appwrite status” or “Login” UI, it should connect (no CORS errors).
- Try **Sign up** with email/password, then **Login**. After that you can implement “My projects” (list documents in `projects` where `userId` = current user).

---

## 7. IDs recap

| Purpose        | Env var (optional)                    | Suggested value      |
|----------------|---------------------------------------|----------------------|
| Database       | `NEXT_PUBLIC_APPWRITE_DATABASE_ID`    | `backing_score_db`   |
| Collection     | `NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID` | `projects`   |
| Uploads bucket | `NEXT_PUBLIC_APPWRITE_UPLOADS_BUCKET_ID`     | `uploads`    |

If you use these IDs in Console, you don’t need to set the env vars; the app defaults match. If you use different IDs, set the env vars so the app uses the same resources.
