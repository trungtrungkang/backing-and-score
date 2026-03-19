# Core — musicxml-player

**Backing & Score** uses **[@music-i18n/musicxml-player](../musicxml-player)** (local package `file:../musicxml-player`) as the **playback and notation core**.

## What the core provides

- **SpessaSynth** — SF2/SF3 synthesizer + MIDI sequencer (Web Audio, AudioWorklet)
- **Timemap** — measure index ↔ milliseconds for cursor sync and click-to-seek
- **Converters** — MusicXML → MIDI + timemap (Verovio, MuseScore, FetchConverter, MmaConverter)
- **Renderers** — Sheet music (Verovio, OpenSheetMusicDisplay, MuseScore static)
- **Player** — Load MusicXML, attach renderer + converter, play with cursor sync

## Usage in Next.js

The library uses browser-only APIs (AudioContext, Verovio, etc.). Use it only on the client:

- **Dynamic import with `ssr: false`** when you need the Player or renderers.
- Or use inside a **`"use client"`** component that mounts only in the browser (e.g. after `useEffect` or a user gesture).

Example:

```ts
'use client';
import { useEffect, useState } from 'react';

export function ScorePlayer({ musicXmlUrl }: { musicXmlUrl: string }) {
  const [Player, setPlayer] = useState<typeof import('@music-i18n/musicxml-player') | null>(null);
  useEffect(() => {
    import('@music-i18n/musicxml-player').then(setPlayer);
  }, []);
  // ... use Player.Player, Player.VerovioRenderer, etc. when Player is loaded
}
```

## Docs

- **Integration vision:** `lotusa/docs/projects/pattern-song-builder/Backing-and-Score/MUSICXML-PLAYER-REVIEW-AND-INTEGRATION.md`
- **musicxml-player repo:** `lotusa/projects/musicxml-player/` — source, tests, demo.
