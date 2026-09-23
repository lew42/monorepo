# reload-rethink — a tab reloads only when something it runs changed; data streams; scroll survives

Minion: Opus, effort high. Session id `f875ec48-d91a-4890-b15f-db197b55aa13`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `code`. Private
port **8095**. ⚠ Any `Server/` save restarts the owner's live server after a boot test: hold on,
write the batch, `node --check`, boot `PORT=8095 node server.js`, curl a 200 AND open a page
headless that receives a `changed` broadcast, before you release.

## The owner's words (2026-09-22 17:33, verbatim)

> btw, I don't really like live reload, as it is... it's always reloading the page (while
> minions are off working), which clobbers my scroll position, for example.
>
> what's the state of the streaming log system? shouldn't most page updates be able to happen
> in more of a HMR way? do we even need live reload? maybe spawn a minion to look into this.
> also, with the worktree system, most work should be done on alternate branches/worktrees/
> servers, which shouldn't trigger live reload...

## What exists — read before deciding anything

- `Server/plugins/SocketServer/LiveReload.js` — watches `public/`, debounces, broadcasts
  `changed(paths)` (or `null` = unknown → reload everything); honours the reload hold
  (`Server/hold.mjs`, `ai/2026-09-19/reload-hold/`).
- `public/framework/dev/Socket/Socket.js` `changed(paths)` — **already scoped**: a tab reloads
  only if it loaded one of the paths (`performance.getEntriesByType("resource")`), and a CSS
  file hot-swaps instead. BUT a path the tab fetched as DATA (`initiatorType === "fetch"`,
  e.g. `directory.json`, a `task.jsonl`, `board.jsonl`) is marked not-swappable, so any change
  to it reloads the tab. `directory.json` is rebuilt whenever a task dir appears (every
  minion's `new-task`) — the likely cause of "always reloading while minions work".
- Streams: `.jsonl` appends reach open tabs over the socket without a reload (`Append.js`,
  `Tail.js`; the AI board, the chat log, `ai/2026-09-19/assistant-stream/`); `hold` state is
  pushed; the MCP `eval` rides the same socket. `ai/2026-09-19/reload-hold/` and
  `ai/2026-09-19/page-health/` measured reload storms before.
- Worktree servers (`Server/worktree-up.mjs`) watch their own checkout — verify that the
  owner's `:80` server never broadcasts for a change made inside `C:/Code/lew42/worktrees/`.

## Deliverables

1. **The census first.** Add one log line per broadcast in `LiveReload.js` (`[reload] <n
   paths> <first three> → <sockets told>`), then reconstruct today's reloads on the owner's
   tab from whatever evidence exists (the server's stdout if it is captured; the health log
   `ai/health/2026-09-22.jsonl`; `directory.json`'s mtime history is gone, so count task dirs
   created today as a floor). Log: how many reloads today, and the top three causes with
   counts. Two numbers that must agree: task dirs created today (`ls ai/2026-09-22 | wc -l`)
   and `directory.json` rebuild broadcasts you can attribute to them.
2. **Data never reloads a tab.** A changed path whose tab-side entry is a data fetch (`.json`,
   `.jsonl`, `.md` fetched by `fetch`) does not count as stale; instead the socket emits a
   page-level event (`socket.on("data", path)` — house style) that a page may subscribe to.
   `directory.json` in particular: the router that consumes it re-reads it on that event
   without a reload (find where it is consumed — `core/Page`'s router / the catalog — and
   subscribe there if it is a one-liner; otherwise log what it needs). Prove headless: create
   a task dir while a tab is open on `/framework/ai/`; the tab does NOT navigate
   (`framenavigated` count 0) and the new dir appears in the day page's list within 2 s.
3. **Scroll and state survive a reload that is needed.** Before `window.location.reload()`,
   stash `scrollY`, the open card id / `?view=` and the focused input's text in
   `sessionStorage`; restore on load. Prove: scroll 1500px on the timeline, touch a JS file
   the tab loaded, the tab reloads and lands within 50px of where it was.
4. **A pause switch the owner owns.** On the dev bar (`dev/DevBar/`): a per-tab toggle "hold
   reloads here" (sets the existing `window.$BLOCKRELOAD` and remembers per tab in
   `sessionStorage`), showing a count of reloads skipped; a click on the count reloads once.
   Distinct from the server-side hold, which is for agents.
5. **Worktrees never reach the owner.** Prove it with a real worktree
   (`node Server/worktree-up.mjs reload-proof`, edit a file inside it, count broadcasts on the
   main server's socket = 0; `worktree-down.mjs reload-proof` after).
6. **The answer to "do we even need live reload?"** — one paragraph on a page,
   `ai/2026-09-22/reload-rethink/page.js`: what reloads now vs before (the census numbers),
   what streams, what hot-swaps, what still needs a reload and why (a changed ES module cannot
   be re-imported in place without a build step — say it plainly), and the alternative you
   did not pick.

## Fence

`Server/plugins/SocketServer/LiveReload.js`, `Server/plugins/Directory.js` (only if the rebuild
must announce itself differently), `public/framework/dev/Socket/Socket.js`, `public/framework/dev/DevBar/**`
(the toggle only), one subscribe line where `directory.json` is consumed (name it in a
`decision`), your task dir, `ai/2026-09-22/page.js` `children:`. Append-only to `.jsonl`.
Never the owner's `:80` or the mastermind's `:8123` directly; never `git stash`/`reset`.

## Length

Landing report: eight sentences with the census numbers and the four proofs.

## Owner addendum (17:51, verbatim) — deliverable 7, the highest priority of this task

> So in my dev bar, it says live reload is held by board-declutter for 220 seconds. My page
> didn't live reload. Pass this along to the live reload minion about like how we're handling
> all of this because this is crazy and bad.

The hold is global: while any minion holds, the OWNER's own edits do not reload the owner's
own tab. That is backwards — the hold exists so a minion's half-written batch does not flash
the owner; it must never stop the owner seeing their own change.

7. **A hold is scoped to its holder's fence, never global.** `hold.mjs on "<slug>" --paths
   <comma-separated globs>` records the holder's fence in `.reload-hold.json`; `LiveReload`
   queues only changes whose path matches a live holder's fence and broadcasts everything else
   at once — so the owner's save reloads the owner's tab while a minion's batch stays held. A
   hold with no `--paths` (today's calls) is treated as the holder's task dir plus the paths
   it names in its brief if you can read them cheaply; otherwise it holds only files under
   `public/framework/ai/` (the boards) and logs a warning that the holder gave no fence. The
   dev bar's hold readout says WHAT is held ("board-declutter holds v/3/**, 220 s"), not just
   who. Update `Server/hold.mjs`, `Server/plugins/SocketServer/LiveReload.js`, the dev bar's
   readout, and the one line in the `minion` skill's reload-hold section that gives the
   command (a fail-safe correction; do it via a node script since Write refuses `.claude/`).
   Prove headless on 8095: a hold with `--paths public/framework/ai/v/3/**` on; touch
   `public/framework/ai2/page.js` → the tab on `/framework/ai2/` reloads (or restyles) within
   2 s; touch `public/framework/ai/v/3/v3.css` → nothing reaches any tab until `off`.
