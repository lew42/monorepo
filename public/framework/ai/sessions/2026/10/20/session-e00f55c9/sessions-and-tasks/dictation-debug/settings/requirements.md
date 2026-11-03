# Dictation: a settings panel in the widget (Part 7.6)

Budget: $4. Load the `minion` skill first, then the `page` and `ui` skills (this is a control the owner presses). The owner's words: `../requirements.md` Part 7, item 6 (and Part 5, the per-sentence flood; Part 10's "every ~10–15 s, configurable in the settings panel"). The card is `2026/10/25/dictation-that-never-fails-in-the-browse`.

## What
The dictation widget's sheet (`ux/Dictate/`, tabs AI · Debug) gets a small **Settings** panel. Item 6 says "back again": there was one before.

## Do
1. Worktree: `node Server/worktree-up.mjs dictation-settings`; work only there. Its port is in the main repo's `.worktrees.json`.
2. **Look first (past-work):** `git log --oneline -S "settings" -- public/framework/ux/Dictate public/framework/ext/Chat | head` and `grep -rn "setting" public/framework/ux/Dictate --include=*.js`. Find the old panel and the knobs that already exist in code (a send delay, a batch interval, anything read from localStorage). Reuse or restore it; never build a second settings system (Law 6). Write what you found as one `log` line in this folder's `session.jsonl`.
3. **Build the smallest working panel:** (a) the send delay (default 2 s: if the owner keeps talking within it, the words join the same prompt instead of a new one), wired to the code that actually waits; (b) the batch interval for the smart assistant (default 12 s), only if a knob for it exists in code; if not, show it disabled with a one-line "not wired yet" and log where it would go. Values persist per browser (whatever store the old panel used, else localStorage under one `dictate.` key).
4. **Prove:** a headless Playwright test `ux/Dictate/test/settings.mjs` (copy the shape of `test/order.mjs`): change the delay, reload, the value holds; with the delay set, two sentences 1 s apart become one prompt. Screenshots of the panel at 400 and 1920 into this folder's `shots/`; read them yourself. Also run `order.mjs`, `flicker.mjs`, `repeat.mjs`: no FAIL.
5. Docs: one line in `ux/Dictate/readme.md` naming the panel and where the values live; detail, if any, in `ux/Dictate/doc/settings.md`.
6. Commit by path in the worktree. Message the parent (`mastermind-dictation-2`) a few lines and stop. Don't merge.

Fence: `ux/Dictate/**`, `ext/Chat/Mic.js`, `ext/Chat/Chat.js` (only if the delay lives there), this folder.

Never: kill or restart the dev server or Servex, stash, push, drive the owner's tabs (headless only), or `git add -A` (files.jsonl rows are auto-written noise: add by path).
