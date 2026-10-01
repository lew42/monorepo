Budget: $8

# page-holds — dev-server restarts are rare, and the owner's page holds and reconnects, never white

The owner's words (2026-10-01, `.claude/skills/servex-mastermind/improvements.md`, last item): "A dev-server restart blanked the owner's page (15:32). Restarts must be rare. The page should hold and reconnect, never go white."

## What we know (read it first)
- `server.js` is a supervisor (`Server/doc/watch.md`, "It boot-tests a change…"): it restarts the live child on ANY real change under `Server/**`. Agents edit `Server/*.mjs` in the MAIN tree all day (merge.mjs, review.mjs, health.mjs, on-landing.mjs, hooks), so every merge that touches `Server/` restarts the owner's server. That is why restarts are not rare.
- The socket client is `public/framework/dev/Socket/Socket.js` (`reconnect()` with backoff, `doc/backoff.md`). The live-reload path is in `Server/watch.js` and `Server/run.js`.
- The logs for 15:32: `%LOCALAPPDATA%\lew42\servex\logs\monorepo.jsonl` (the dev server's own lines: look for "exited", "launching", "boot test", "Rebuilding") and `servex.jsonl` (`proxy_error ECONNRESET` on `monorepo.localhost` at 15:26–15:33). Find the exact trigger of the 15:32 restart and name it on the card in one line.

## Fence
`server.js`, `Server/run.js`, `Server/watch.js`, `Server/doc/watch.md`, `public/framework/dev/Socket/` (its `Socket.js`, `doc/`, `readme.md`), `public/framework/core/App/mode.js` only if the reload path lives there, and your own task dir. Nothing else; if the blank screen comes from a file outside this fence, say which on the card and stop at the seam.

## Build
1. **Restarts only when the running server needs them.** The supervisor restarts only on changes to files the live server actually loads: `server.js`, `Server/run.js`, and whatever `run.js` imports (walk its import graph once at boot, static imports only). A write to a tool script nobody imports (`Server/merge.mjs`, `review.mjs`, `health.mjs`, `on-landing.mjs`, `*.test.mjs`, `doc/`) restarts nothing. Log one line per skipped change ("changed Server/merge.mjs — not loaded by the server, no restart").
2. **The page holds.** When the socket closes, the page must NOT reload, blank or show an error screen: it keeps what is rendered, shows one small unobtrusive line (reuse the existing dev-bar or notice surface if there is one; otherwise the smallest fixed strip, inside a CSS layer) saying "server restarting… reconnecting", reconnects with the existing backoff, and clears the line. A reload happens only if the server says the page's own files changed (the normal live-reload message), never because the connection dropped. Find the code that currently blanks the page (a `location.reload()` on close? a module-load failure?) and fix that exact spot.
3. **Reconnect catches up.** After reconnecting, if the server's boot id changed, request ONE reload only when a file the page loaded changed during the gap (the server can answer with its restart time; compare to the page's load time). Otherwise stay.

## Proof (on the card)
- A headless Playwright run (`Server/smoke.mjs` style, scratchpad script): open `/framework/`, kill and restart the worktree's server, screenshot at 1920 during the gap and after reconnect: the page never goes white, the strip appears and clears. Two shots linked from the card.
- `touch Server/merge.mjs` (or an edit of a comment) in the worktree → the supervisor logs "no restart"; a comment edit in `Server/run.js` → one restart. Paste the two log lines.
- The one-line cause of the 15:32 restart.

## How you work
- Load the `minion` skill first, then `code`; the `css` skill if you add a rule. Read the readme chain for `Server/` and `public/framework/dev/Socket/`.
- `take_worktree` from Servex; work and commit there by exact path. This touches a page surface: run `node Server/review.mjs <taskdir> <worktree>` (default size), answer every finding with an answer line in the main tree's `<taskdir>/task.jsonl` (`{"review":{"answer":{"n":N,"reply":"fixed: …"}}}` via append.mjs — never typed into review.md), then `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree> /framework/`. Say "landed <sha>" on the card and "the owner's :80 server picks this up at its next restart" (do not restart it yourself).
- Every look is headless; never touch an owner tab. Log only through `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`.
- Report on the card `2026/10/01/process-fixes-session-minions-through-th` (card_reply): two sentences at start, the proof when landed, or if blocked. Nothing else to the mastermind.
