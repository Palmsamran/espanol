# Español

A Spanish vocabulary practice app that runs in any browser and installs on your phone like a regular app (a "PWA"). It has no build step and no accounts, and it works offline.

## What's inside

| Mode | What it does |
|---|---|
| **Review** | Spaced repetition (Again / Hard / Good / Easy). Each day it shows the cards that are due plus a few new ones. |
| **Flashcards** | Tap to flip. Swipe right if you know it, left if you don't (or use ← →). |
| **Learn** | Each card is asked as multiple choice first, then you type it. A card you miss keeps coming back until you get it right. |
| **Write** | Type every answer. It accepts answers that only miss an accent (unless strict mode is on), small typos, and any one of the alternatives in "time / weather". |
| **Match** | Timed game: pair 6 Spanish words with their meanings. |

There's also text formatting on cards (**bold**, *italic*, underline and highlight in yellow, green, blue or pink, from the buttons in the deck editor or ⌘B / ⌘I / ⌘U / ⌘⇧H), text-to-speech in Spain, Mexico or US Spanish, starred cards, an accent keyboard (á é í ó ú ü ñ ¿ ¡), dark mode, and import from Quizlet.

## Files

- `index.html`, `styles.css`, `app.js`: the app
- `sw.js`: offline support
- `manifest.webmanifest`, `icons/`: what makes it installable
- `serve.js`: a tiny local server for testing (`node serve.js`, then open http://localhost:8765)

## Your data and sync

Cards and progress are saved in the browser on each device. To keep your phone and computer in step, turn on **Settings → Sync between devices**:

1. Create a GitHub token that has only the `gist` scope. The link in Settings opens GitHub's token page with that scope already ticked.
2. Paste the token on each device. The first device creates a private ("secret") gist called `espanol-sync.json`. Other devices find that gist and ask whether to combine their data with it or replace their own.

It syncs when the app opens, when you switch back to it, and a few seconds after you study. It merges card by card: the newest edit to a card's text wins, the most recent study progress wins, and deletions sync too. The token is stored only on each device and is never included in backup files.

**Settings → Save backup file / Restore from backup** still work if you just want a copy of your data as a file.

## Putting it online (needed to install on a phone)

Phones can only install the app from an `https://` address. Any free static host works. GitHub Pages:

1. Create a repository and push this folder to it.
2. On GitHub, go to the repo's **Settings → Pages**, then set **Source: Deploy from a branch** and pick `main` / root.
3. Open the `https://<you>.github.io/<repo>/` link on your phone:
   - **iPhone:** Safari → Share → **Add to Home Screen**
   - **Android:** Chrome → ⋮ → **Install app**

When you change a file later, also bump `CACHE` in `sw.js` (for example to `espanol-v2`) so installed copies pick up the change.
