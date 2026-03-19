# Backing & Score

Web DAW + Live — play along, arrange, perform. Next.js **16** app with **musicxml-player** as the core (SpessaSynth, Verovio, MIDI + timemap).

- **Core:** `@music-i18n/musicxml-player` (local package `file:../musicxml-player`). See `src/core/README.md`.
- **Docs:** `lotusa/docs/projects/pattern-song-builder/Backing-and-Score/` (DEVELOPMENT-PLAN, UI-SCREENS-AND-DESIGN, etc.).

**Why `--webpack` in scripts:** Next.js 16 uses Turbopack by default; Turbopack currently does not resolve `file:` (local) dependencies. We use `next dev --webpack` and `next build --webpack` so the local musicxml-player package is resolved. You can remove `--webpack` once Turbopack supports local packages.

### Appwrite (Auth, Database, Storage)

- Copy `.env.local.example` → `.env.local` and set `NEXT_PUBLIC_APPWRITE_ENDPOINT` and `NEXT_PUBLIC_APPWRITE_PROJECT_ID`.
- Create the database, collection, and bucket in [Appwrite Console](https://cloud.appwrite.io/console) — see **[docs/appwrite-setup.md](docs/appwrite-setup.md)** for step-by-step setup (attributes, permissions).
- App code: `src/lib/appwrite/` — client, constants, types; use `isAppwriteConfigured()` to show setup UI when env is missing.
- **Setup database:** After setting `.env` / `.env.local` (and `APPWRITE_API_KEY` from Console → API Keys), run `npm run setup:appwrite` to create the database, `projects` collection (with attributes), and `uploads` bucket. See [docs/appwrite-setup.md](docs/appwrite-setup.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
