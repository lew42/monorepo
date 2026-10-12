# real-page-move — drag a real page in Make and its directory moves on disk

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (one rpc, one seam, one confirm row). Clear beats brief by far (a move is the most visible thing a drag can do — the row says what will happen before it does). Prioritize (the rpc first, the Make hookup second, the proof third).
**Length budget:** your landing report is one screen with the before/after `ls` of the scratch tree.

## The owner's words (2026-09-17, 22:40)

> Pages could be actual sub dir with sub page.js files, or could by dynamic, stored anywhere. However, we want to maintain file system simplicity when possible (portability of the dir, for example). Real pages could actually move the dir on the file system, when dragged and dropped?

And (2026-09-18): make the call, build it, document the alternative.

## What exists

- Made pages (`/imagine/paging/made/<path>/page.json`) already move on a drag: Make's tree is `ux/Tree` (last night), its `move({ node, into, index })` feeds `apply()`, which writes the smallest set of files through `rpc:write` / `rpc:rm` (`public/imagine/paging/make/made.js`, `Store`/`FileStore`). Read `make/doc/decisions.md` (last night's nine decisions) first.
- The dev server's writers: `Server/plugins/SocketServer/Runtime.js` — `rpc:write`, `rpc:ls`, `rpc:rm` (recursive), `rpc:cmd` (the LAN-reachable exec that was closed — read `ai/2026-08-1x` notes via `rg "rpc:cmd" public/framework/ai --glob "*.md"` before touching this file; every rpc here is behind the same loopback guard); `Server/plugins/SocketServer/Append.js` for how a new rpc is registered and guarded.
- Core: a parent names children by name in `children:` (a string, an array, a POJO, or a function); `Page.load()` dynamic-imports `<url>page.js`.

## Deliverables

1. **`rpc:move`** — `move(from, to)` beside `rpc:rm` in `Runtime.js` (or a `Move.js` registered the same way as `Append.js`, if that is cleaner): both paths resolved under `public/`, never escaping it, never overwriting an existing target, `fs.rename` (atomic on one volume), the reply carrying the reverse move (`{ from: to, to: from }`) so a caller can undo; every move logged to the server's console with both paths. Same loopback guard as the other writers.
2. **Real pages in Make.** Make opened with `?real=<url>` (e.g. `?real=/imagine/paging/made-real/`) shows that real subtree as a second group in its tree (`Tree.from(page)` over the real page — the tree component already builds rows from a page's children); dragging a real page shows a confirm row in the right sidebar — "Move `/a/b/` into `/c/` — the folder moves on disk" with Move and Cancel — and on Move: (a) `rpc:move` the directory, (b) rewrite the old parent's `children:` line in its `page.js` (remove the name) and the new parent's (add the name at the dropped index) — ONLY when that line is a plain string literal; if the parent's `children` is an array, an object or a function, refuse with a visible one-line reason and move nothing; (c) reload the real subtree and select the moved page at its new url. Undo is the reverse move offered in the sidebar for one minute (the reply's payload), no history beyond that.
3. **Proof**, on your private server (`PORT=8117 node server.js`, background, killed by its real Windows PID): create a scratch tree `public/imagine/paging/made-real/` with three real pages (`page.js` each, string `children:`), open Make on it, drag one page under another → `ls` before and after shows the directory moved, both parents' `page.js` `children:` lines changed, the page answers at its new url, the old url no longer routes, a cold reload of Make shows the new tree; press Undo → everything back; then delete the scratch tree at landing (it is yours). Two numbers that must agree: directories under the scratch root before and after the round trip.
4. **Docs:** `make/readme.md` (Use: `?real=`, what a drag of a real page does), `make/doc/decisions.md` (the record: why a string-only rewrite, why one-minute undo and no history, the alternative — a `children` function reading a `tree.json` so nothing is rewritten in source — and when it wins), `Server/readme.md` or the SocketServer readme (the new rpc in one line).
5. **The owner item:** a Server/ change is live only after the owner restarts their dev server. Your landing report says so in one line; the mastermind stamps it on the ask as `needs: { owner: "restart the dev server", minutes: 1 }`.

## Rules

- Load `code`; `new-task` before the first edit (your dir exists: `ai/2026-09-18/real-page-move/`); `documentation` then `finish-task`; write your choices as `decision` lines.
- **Fence:** `Server/plugins/SocketServer/Runtime.js` (or a new `Move.js` + its one registration line), that readme, `public/imagine/paging/make/**`, the scratch `public/imagine/paging/made-real/**` (yours, deleted at landing), your task dir. Nothing else — never `made/` (the owner's pages), never core, never another realm's `page.js`.
- The owner's dev server on port 80 IS running: never touch it, never restart it. Never `git stash`, never `find /`, never drive the owner's tabs; an `rg` pattern starting with `/` returns nothing here — drop the slash.
- Landing: `outcome` = a headline, the `ls` before/after, the links, the restart line, what was left and why. One screen.
