# Minion E: AI 2 gets its own page shell, with the one chat on the right (merge 3)

Load the `minion` skill first, then `code`, `css`, `page`, `layout`.

**Read first:**
- the owner's words, last section of `public/framework/ai/2026-09-30/dev-shell/owner-words.md`;
- the design (picture + table), `public/framework/ai/2026-09-30/dev-shell/design-2.md`;
- `public/framework/core/Shell/readme.md`. The shell with `paper: true` is the nine-grid: a white paper in the middle and a gray well around it.

**Work ONLY in the worktree** `C:\Code\lew42\worktrees\dev-shell` (branch `worktree/dev-shell`). First merge `michael/dev` into it. Server: http://localhost:54678/. If it's down, start it by hand from the worktree with `PORT=54678 node Server/index.js` and `windowsHide: true`. Commit by exact path. Use headless Playwright only (global: `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`), never the owner's browser.

**Fence:**
- `public/framework/ai2/page.js`: only `content()` and the outer wrapper `board()` builds (`.ai2` / `.ai2-rail` / `.ai2-detail` placement);
- `public/framework/ai2/ai2.css`;
- `public/framework/ai2/card.js`: only the `.ai2-foot-chat` branch around line 270–300 and the auto-transcribe start below it;
- `public/framework/ai2/readme.md` and `doc/`;
- this folder.

**Not yours:**
- the inbox's internals (rows, read/unread, archive, scoring, search) and stalled-ask rows. If you must move the inbox's container, say so in result.md with the new selector.
- `ux/Dictate/*`, `ext/drawer/*`, `core/Shell/*`.

## What to build

AI 2 becomes one `new Shell({ paper: true, … })`. Today it is `.ai2-head` (title + tabs) over `.ai2-shell` (the rail, then the card):

| Shell region | What goes there |
|---|---|
| header | `.ai2-head`: the "AI 2" title and its tab bar, text lined up with the paper's left edge |
| left | `.ai2-rail`, the inbox list, unchanged inside |
| main (the white paper) | `.ai2-detail`: the open card, or the empty state |
| right | **the one chat**: `chat(el, { path, card, placeholder })` from `/framework/ux/Dictate/chat.js`. Mount it ONCE for the page, and on every card change call `handle.nav(path, cardId)`, with `null` when no card is open. Call `remove()` when the page unmounts. Above it, one small line names what it's talking into ("Talking into: <card title>" / "this page"). No chat code of your own. |

Rules:

1. **The card's own footer chat goes.** In `card.js`, skip the `.ai2-foot-chat` mount when the page shell's chat exists. Keep the old branch reachable as a named v1 (a flag or a `?chat=v1` url; say which). A fresh card's auto-transcribe start goes to the shell mount's `panel.start_mic()`. The phone path (the ✦ sheet) stays as it is.
2. **Phone (below 40em):** the shell's right sidebar does NOT show and does not mount a chat. The ✦ sheet carries it there, as today. Exactly one chat at every width.
3. **The level reads at a glance.** The rail, the paper and the chat all start at the same top edge, under the header. The well is gray, the paper is white, and the ☰ drawer (site level) sits outside all of it.
4. **Routes and behaviour unchanged**: every url, tab, the rail's scroll, `overview/` and `needs/` taking over the whole area, and the resize seams (keep `--ai2-chat` / `ai2-chat-w` as the right sidebar's width if that's simplest).
5. Width rules: the rail and the chat keep about the widths they have today at 1920; at 3440 the paper gets the extra room.

## Proof

Shoot `/framework/ai2/`, one open card, and `/framework/ai2/overview/` at 400, 1200, 1920 and 3440, before (michael/dev, http://monorepo.localhost) and after (the worktree). Save them here and put the pairs in `result.md`. Count `.widget`/chat mounts on each shot (must be exactly 1 on desktop and 0 visible on the phone besides the ✦ sheet). Report the console errors, which should be none new. Write the `card.js` diff out as `card-diff.txt` here, because the dictation task reviews it before merge. Commit, then reply with the commit id, the mount counts and anything you deviated on.

