# Minion brief: the fast assistant splits a bubble into paragraphs (merge 9)

Load the `minion` skill first, then `code`. Your parent is **task-mastermind-one-dictation**, and its task dir is `public/framework/ai/2026-09-30/one-dictation/`. Read the owner's words first: the last section of `owner-words.md` there, the part about paragraphs.

## What the owner asked
A new sentence joins the last bubble when it continues the thought. There is no bubble per sentence; merge 8 already does this, through `ext/Chat/Chat.js`'s `mergeable()`. Later, the fast assistant may decide that the newest thought is a new paragraph. Then that last chunk moves out of the bubble into a new bubble of its own.

## How (one marker, the same pattern as `(listening)`)
The fast assistant has no tools; its reply text is the message (`Servex/agents/session-fast.md`). Servex already turns a `(listening)` reply into an invisible `{skip}` line (`Servex/agents/Sessions.js`, near `is_filler`).
1. **The prompt.** In `session-fast.md`, add one short rule: when the thought you just heard starts a new topic, rather than continuing the owner's last one, begin your reply with `(new paragraph)`. You may add nothing else after it (`(listening)` still means silence). Keep it short, in the file's own voice.
2. **Servex.** In `Sessions.js`, a fast reply that starts with `(new paragraph)` writes an invisible marker line `{"para": {"at", "re"}}`. `re` is the `at` of the FIRST owner line of the thought the fast assistant just heard. Whatever text follows the marker is handled as the reply would have been (usually nothing, or `(listening)`). Add a check to `Servex/agents/Sessions.test.mjs` for both cases.
3. **The client.** `ext/Session/Session.js`'s `entry()` passes the `para` line through (it is never a bubble). `ux/Dictate/Widget.js` (its Thread, which draws through `ext/Chat`) handles it: the paragraph for line `re`, and every paragraph after it in the same bubble, move into a NEW bubble placed right after it. A whole-file redraw from line 0 must give the same picture.
4. **Docs.** One line each in `ext/Session/doc/markers.md` (the new marker) and `ux/Dictate/doc/chat.md`.
5. **Merge 8's review leftovers, in `Widget.js`.** You are in that file anyway (review.md findings 5-7):
   - Delete `Widget.Thread.draw()`'s `fix` branch for a non-stream `at`. Nothing uses it, and `fill()` throws its write away.
   - `Widget.Composer` and `Widget.ComposerV1` each have their own copy of `meter()`, `source_picker()`, `refresh_devices()` and `pick_device()`. Keep one copy (plain helpers both call), without changing how V1 behaves.
   - Trim the long doc comments in `Widget.js` and `Widget.css` to a few lines each. The history and the proof story go into `doc/chat.md` (or are dropped).

## Proof
- `node Servex/agents/Sessions.test.mjs` passes, with the new checks.
- Headless Playwright (import from `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`) on the worktree server, Servex stubbed: feed a session file with three owner lines, then a `para` line on the third. Shoot the Dictate demo at 400 before and after the `para` line: one bubble, then two. Save into `minion-para/shots/`.
- Never `say()` into a live session, never drive the owner's tabs, and never restart Servex (your parent asks for that).

## Fence
`Servex/agents/session-fast.md`, `Servex/agents/Sessions.js`, `Servex/agents/Sessions.test.mjs`, `ext/Session/Session.js` (`entry()` only), `ux/Dictate/Widget.js` (the para handling and item 5), `ux/Dictate/Widget.css` (comments only), the two doc files above, and your task dir `minion-para/`.

## Land
Commit in the worktree `C:\Code\lew42\worktrees\dictate-workbench` by exact path. End your turn with one line per item (1-4), the commit, and the shot paths.
