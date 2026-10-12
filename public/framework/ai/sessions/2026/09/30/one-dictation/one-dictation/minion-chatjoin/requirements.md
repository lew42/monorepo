# Minion brief: the Dictate widget inside the Chat (merge 8)

Load the `minion` skill first, then `code`, `ui` and `layout`. Your parent is **task-mastermind-one-dictation**, and its task dir is `public/framework/ai/2026-09-30/one-dictation/`. Read the owner's words first: the last section of `owner-words.md` there ("the Dictate page is the workbench").

## Why
There are two of everything today (CLAUDE.md law 6, "one of everything"):
- **The conversation:** `ux/Dictate/Widget.js` has its own `Widget.Thread`. But `ext/Chat/Chat.js` already draws a chat log that **joins a sentence onto the last bubble** when the same sender speaks again within `MERGE_GAP_MS` (`mergeable()`). It also takes a `refined` line that re-splits a bubble into paragraphs (`refine()`), and it has reactions and avatars.
- **The entry:** `Widget.Composer` is a one-line input with `Dictate` in "open" mode, so a sentence skips the text box. But `ext/Chat/Composer.js` + `Mic.js` already do what the owner asked: Whisper types into the composer's own text box (the rough buffer), and whole sentences go out (`SETTINGS.send_mode`).

The owner's recommendation is a Dictate box (entry + Whisper + correction + submit) inside a Chat (the whole conversation). This merge makes the one widget exactly that, built from `ext/Chat`'s parts.

## Do (in the worktree `C:\Code\lew42\worktrees\dictate-workbench`, server `http://localhost:51812/`)
1. **The conversation is `ext/Chat`.** `Widget` draws its bubbles through `ext/Chat/Chat.js` (`chat()`, or `speak()` + `mergeable()` + `refine()`). Then a sentence that continues the thought joins the last bubble, and there is no bubble per sentence. Keep `Widget`'s own methods that `chat.js` calls (`submit`, `sync`, `stream`, `draw`, `mark`, `mark_failed`, `retag`, `reset`, and so on) working, so `ux/Dictate/chat.js` and its callers need no change. Streaming replies must still stream.
2. **The entry is `ext/Chat`'s composer.** `Widget` uses `ext/Chat/Composer.js` (with its `Mic`), so Whisper writes into the text box and whole sentences go out from it. Give that composer the owner's 2026-10-01 layout itself (one composer, so AI 2's card composer gets it too): the text box is full width (a little side padding on a phone), auto-height up to a ceiling with no empty void, and the mic, Send and extras sit in one row below it. The live grey guess reads as the text box's continuation.
3. **Send at the end of a sentence.** The default: a finished sentence (it ends in `.`, `!` or `?`) goes out after about 700 ms of quiet (the owner said 500 to 1000 ms), and the box is cleared each time. Never send mid-sentence. An unfinished remainder goes out only on Send, or after the existing long silence (`pause_send_ms`). Set this in `Mic.js`'s `SETTINGS` defaults, so every composer gets it.
4. **Keep the old ones reachable.** The old `Widget.Thread` and `Widget.Composer` stay, behind a `v1: true` option, so a regression can be switched back to.

Not this merge: the fast assistant splitting a bubble into paragraphs (that is a Servex change, merge 9), and modes.

## Proof
Headless Playwright (import from `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`) on the worktree server, into `minion-chatjoin/shots/`:
- The Dictate demo at 400 and 1920, after a scripted three-sentence sample (no mic: use the `Mic`/`Dictate` sample path, never a real session). The three sentences sit in ONE bubble, and the box is empty after each send.
- The ✦ sheet at 400: it opens, sends, and keeps its chat across a navigation (never regress the mobile rail).
- An AI 2 card page at 1920, showing its composer still works.
Never `say()` into a live session, and never drive the owner's tabs.

## Fence
`ux/Dictate/Widget.js`, `Widget.css`, `chat.js` (only if its calls must change), `doc/chat.md`, `readme.md`; `ext/Chat/Composer.js`, `Mic.js` (defaults and layout), `Chat.css` (the composer layout), `ext/Chat/readme.md`; your task dir `minion-chatjoin/`.

## Land
Commit in the worktree by exact path. End your turn with one line per item (1-4), the commit, and the shot paths.
