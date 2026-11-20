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

Cards can have a **photo**: tap the picture button next to a card in the deck editor to take a photo or pick one, tap the 🔍 button to search free, openly licensed pictures (from [Openverse](https://openverse.org)) for the card's English word, or paste an image on a computer. Settings → *Photos show on* picks the English side, the Spanish side or both.

**Auto-translate**: in the deck editor, type the Spanish and press Enter, and the English fills in, with other meanings to tap underneath (*encender → to light · to turn on · to switch on…*). It works the other way too: type only the English and the Spanish fills in. The suggestion is selected, so just type to replace it, or press Enter to keep it. It only fills an empty side and never overwrites what you typed. It uses Google Translate's free web endpoint, so it needs the internet. Turn it off in Settings → *Auto-translate new cards*.

**Spelling & grammar check**: in the deck editor, mistakes in the Spanish and the English are flagged when you leave a field, each with a label and a short reason. It catches spelling (*naturalesa → naturaleza*), accents (*cancion → canción*), agreement (*la problema → el problema*, *yo tiene → yo tengo*), gender (*la presupuesto → el presupuesto*), weather *hace* (*hacen veinte grados → hace veinte grados*) and English grammar (*a apple → an apple*). Tap a suggestion to fix it, or *Ignore* to stop flagging it on all your devices. *Check for mistakes* at the top checks the whole deck. Most checks use [LanguageTool](https://languagetool.org)'s free service, so they need the internet and send the card's words (nothing else) there. A few built-in learner rules (gender, *hace*) also work offline. You can turn the automatic check off in Settings → *Check spelling & grammar as I type*. It can't tell whether a translation is right (for example *quedarte* means "to stay", not "you stay").

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

Photos sync too. They're shrunk to small JPEGs when added and kept in a second private gist ("Español app — synced photos"), one file per photo, so each device only downloads the photos it's missing. Backup files contain your cards but not the photos.

**My words**: a word becomes yours once you've (1) known it on a flashcard (*Know it* in Flashcards, or *Good* / *Easy* in Review) and (2) typed it exactly right in Write, Learn or Review typing. Small typos and missing accents don't count. The two steps can happen in any order, and missing it again resets that step. Your words are counted on the home screen (🏆 *my words*), listed on the My words page with an *Almost yours* list, and left out of Review and practice. On a deck page, *Practice my words too* includes them, and *Practice again* on the My words page sends a word back. Progress syncs between devices.

**Deck order**: decks with a date in their name (*2026/11/17*, *2026-11-17* or *2026.11.17*, with or without extra words) are listed newest first on the home screen, and decks without a date come after them. **New** names a deck with today's date, written the same way as your newest dated deck.

**Duplicates**: if the same deck ends up on the list twice (for example a Quizlet set imported on two devices and then combined by sync), or the same card is saved twice (in one deck or in two different decks), the home screen shows *Found N duplicates → Review & remove*. Settings → *Find & remove duplicates* does the same. Decks with the same name are merged. Cards are matched even if one copy was corrected (*naturalesa* / *naturaleza*). For each pair, the most recently edited text is kept, along with stars, photos and the latest study progress. When the same card is in two decks, the copy in the older deck is kept as it is. The removal syncs to other devices. The deck editor also flags a card as soon as you add one that already exists ("Duplicate: Already in Starter: Essentials"), with a button to delete it.

**Settings → Save backup file / Restore from backup** still work if you just want a copy of your data as a file.

## Putting it online (needed to install on a phone)

Phones can only install the app from an `https://` address. Any free static host works. GitHub Pages:

1. Create a repository and push this folder to it.
2. On GitHub, go to the repo's **Settings → Pages**, then set **Source: Deploy from a branch** and pick `main` / root.
3. Open the `https://<you>.github.io/<repo>/` link on your phone:
   - **iPhone:** Safari → Share → **Add to Home Screen**
   - **Android:** Chrome → ⋮ → **Install app**

When you change a file later, also bump `CACHE` in `sw.js` (for example to `espanol-v2`) so installed copies pick up the change.
