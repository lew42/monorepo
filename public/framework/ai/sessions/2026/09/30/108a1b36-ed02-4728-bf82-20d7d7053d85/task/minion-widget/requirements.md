# Minion: one dictation widget, the same everywhere

Load the `minion`, `code`, `page` and `layout` skills first. Read [../requirements.md](../requirements.md) in full — **asks 5, 6, 7** are yours — and open the two phone shots beside it (`phone-dictate-1.jpg`, `phone-dictate-2.jpg`). The owner, from the phone: "There's so much text on the page before anything useful… the button is so far down the page… then the actual transcription is below another paragraph or two." Card dir: `public/framework/ai/2026/09/29/audio-a-library-of-audio-parts-transcrip/`.

**Work in the worktree only:** `C:\Code\lew42\worktrees\audio-consolidate` (branch `worktree/audio-consolidate`, server http://localhost:53292/). It already contains the sheet-regression fix (merged in as 16a0ea5f) — build on it. Commit by exact path; never `git add -A` (the tree has unrelated auto-written `files.jsonl` changes: leave them).

## Fence
`public/framework/ux/Dictate/**` and `public/framework/ext/drawer/**`. NOT `framework/audio/` (another minion's, later), NOT `ext/tabs/` (shared; mastermind-page owns the tab-row fix).

⚠ **Until I tell you otherwise, do NOT write `ext/drawer/rail.js` or `ux/Dictate/floor.js`** — voice-sessions-2 is editing both and merges them soon. Build the widget in NEW files, and use it on the Dictate page first. When I message you that voice-sessions-2 has merged, merge `michael/dev` into the worktree and only then wire the widget into rail.js (the sheet), on top of their version.

## Deliverables
1. **ONE widget** (ask 5): the ✦ sheet's compact widget — chat bubbles per settled sentence, the mic, the live line — becomes one class in ux/Dictate that the drawer, the sheet and the Dictate page all use (delete the duplicate markup paths). Config options, each a plain property: `level` (show the level), `source` (show the mic picker), `debug` (the debug bar), `revision` (revision level). Parts as static subclasses (the `code` skill).
2. **Debug bar**: small filter/toggle buttons — raw vs clean, Chunks, Corrections, Live, Side by side — collapsed by default. ON on the Dictate page, OFF in the sheet. Reuse the views Dictate already has for these; don't rebuild them.
3. **Dictate Overview = the widget FIRST** (ask 6): directly under the title and tabs, no paragraph above it. The explanation moves below it or into Docs.
4. **Mobile tabs** (ask 7): on the Dictate page only, fewer tabs in the row — group, or put extras behind "more ▾" using what ext/tabs already offers. If ext/tabs can't do it, note it for me in your log; don't edit ext/tabs.
5. **Keep v1 reachable** (the "never destroy a viable version" rule): the old Overview stays one click away (e.g. a `v1` child page).
6. Update ux/Dictate's `readme.md` and `doc/` (the widget, its four options), and ext/drawer's readme if its use changed.

## Proof
- Headless Playwright with `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream` (scripts in your session scratchpad, named `widget-*.mjs`; `windowsHide: true` on every spawn; stop what you start).
- Shots into this dir: Dictate Overview at 400 and 1920 (`dictate-400.png`, `dictate-1920.png`), the ✦ sheet open at 400 (`sheet-400.png`), debug bar expanded at 1920 (`debug-1920.png`). At 400 the mic button must be visible without scrolling. Open each shot and judge it.
- Zero console errors on /framework/ux/Dictate/ and a page with the drawer.
- The ✦ sheet still works: start, speak (fake stream), stop, mic released.

## Budget
Sonnet, about $4. Log steps and decisions in your task.jsonl. When committed and proven, end your turn with a 5-line summary (what changed, shots, anything left) and wait — do not merge; I merge.

