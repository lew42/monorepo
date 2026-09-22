# reload-hold — agents hold every live reload while they write a batch of files, then release once; then a study of hot module reloading

Load the `minion` skill first. Then this brief. Model: Sonnet.

**Three laws.** Less is more (one lock, one command, one reload). Clear beats brief by far. Prioritize (the hold first, proven; the hot-reload study second and only as a study).

## The owner's words (2026-09-19)

> the dev bar has changed like seven times in the last few seconds. […] Launch a minion and build a live reload blocker. And build into CLAUDE.md that this block mechanism needs to block all live reloads across all pages. You would use it before making any edits. So then you do a batch of file writes — you do all the file writes — and then wait, and once everything is ready then you're basically triggering a repaint or a reload. Also afterwards figure out how to maybe do something like hot module reloading — I know a lot of frameworks have it — so that we can get things to update without even having to do a browser refresh.

## What exists (read first)

- `Server/doc/watch.md` (landed today): `Server/watch.js` is one recursive `fs.watch` behind `Server/MtimeFilter.js`; `node server.js` is a supervisor over `Server/run.js` that restarts the child when `Server/` really changes.
- `Server/plugins/SocketServer/LiveReload.js`: every real change is queued, debounced 300 ms, and flushed as `rpc("changed", [paths])` to every socket; `.jsonl` changes go to `Tail.js` instead (streams — those must keep flowing during a hold: the owner's dev bar chat and the V3 board live on them). `mute(file, socket)` already spares a tab its own write.
- The browser side decides what to do with `changed`: find it (`public/framework/dev/` — LiveReload client / DevBar's Block checkbox, which blocks reloads in ONE tab by the owner's hand). Read how a tab decides a changed path concerns it (resource entries).
- `.claude/hooks/syntax-guard.mjs` (today): every `.js` write by any agent is `node --check`ed at once.

## Build — the hold

1. **One lock, on disk, that any agent can take with one command and no socket:** `node Server/hold.mjs on "<who> — <what>"` writes a small JSON lock (who, what, when, pid) — put it OUTSIDE `public/` (the repo root's `.reload-hold.json`, git-ignored) ; `node Server/hold.mjs off` removes it; `node Server/hold.mjs` prints the state. Two agents may hold at once: the lock is a list; `off "<who>"` removes that holder; reloads resume when the list is empty.
2. **While any hold is on, `LiveReload` sends nothing**: changes keep queueing (deduplicated); `.jsonl` tails keep streaming. When the last hold comes off: ONE flush with everything that changed. The server watches the lock file itself (it is outside `public/`, so give it its own tiny watcher or a 500 ms poll — say which and why).
3. **It can never stick.** A hold expires by itself after 5 minutes (stamp `until`; an agent may renew); an expired hold flushes exactly like a release and logs one plain line naming who let it lapse. The supervisor's restart must not lose the queue's meaning: on boot with no hold, nothing special; on boot WITH a live hold, stay held.
4. **The owner can see it.** A socket rpc (`hold`, with the holders) on change, and one small line in the dev bar head beside Block — "held by sidebar-repair, 40 s" — and nothing when free. ⚠ The dev bar is being edited by a sibling (`devbar-chat`) and is on the owner's screen: write that line as ONE small new file (`dev/DevBar/hold.js`) and touch `DevBar.js` ONCE, at the end, in a proven single write — or, if the sibling has not landed by then, leave the wiring line in your landing report for the mastermind to apply.
5. **The habit, written where agents meet it:** one short paragraph for the `minion` skill (you may edit it: "before your first write to a file the live site loads, `node Server/hold.mjs on …`; write the batch; `node --check` is automatic; load the page headless on your private server; then `off`") and the exact two or three lines the mastermind should add to `CLAUDE.md` — **propose them in your landing; do not edit `CLAUDE.md`** (the owner asked for the line, and the mastermind adds it once the mechanism is proven).
6. ⚠ The owner's own server on port 80 still runs the pre-supervisor code until they restart it once; nothing you build reaches it before that. Say so in the landing.

## Prove

Private supervised server `PORT=8140 node server.js`; a headless tab with a REAL socket on a page. Hold on → write three files the page loads → the tab does NOT reload for 10 s (count `load` events: still 1) while an appended `.jsonl` line still streams into the page (use `/framework/ai/v/3/` with a scratch copy of the board file, never the real one) → hold off → exactly ONE reload. Two holders: first `off` does nothing, second releases. Expiry: a 5-second test expiry via an env var → one flush, one log line. A restart of the child mid-hold stays held. Kill your server by real PIDs (supervisor and child) at landing.

## Then — hot module reloading, as a STUDY with one working example (time-box: an hour)

The site is native ESM, no bundler. Say plainly, with a demo page in your task dir, what is possible without a build step: (a) **CSS**: swap a changed stylesheet's `<link>` (or re-fetch the constructed sheet `View.stylesheet()` makes — find which) with no reload — this is likely easy and worth shipping: build it behind the same `changed` rpc, for `.css` paths only, and prove a CSS edit repaints a page with zero `load` events; (b) **a page module**: re-`import()` it with a cache-busting query and re-render the active page through the Router — show what survives (scroll, state) and what breaks (module singletons, double-registered listeners, `css()` templates applied twice); (c) a shared module (`core/View`): say why that one needs a full reload. Deliver a `decision` line: what to ship now (the mastermind expects: CSS hot swap yes; page re-import as an opt-in experiment; everything else reload), with the alternatives.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/reload-hold/`); `code`, `documentation`, `ui-test`; `finish-task`; `skill-improvement` if a skill misled you.
- **Fence:** `Server/hold.mjs` (new), `Server/plugins/SocketServer/LiveReload.js`, `Server/doc/watch.md` + `Server/README.md` (a paragraph), `.gitignore` (one line), the LiveReload CLIENT file (find it; CSS hot swap + the `hold` rpc), `public/framework/dev/DevBar/hold.js` (new) and ONE line in `DevBar.js` per step 4, `.claude/skills/minion/SKILL.md` (one paragraph), your task dir. Not `Server/run.js`, not `Server/plugins/AILogs.js`, not `Server/plugins/Whisper.js` (siblings hold them), not `CLAUDE.md`, not `.claude/hooks/**`.
- **Never kill or restart the owner's dev server (port 80, PID 31028) or the mastermind's (8123 — it is supervised and WILL restart its child when you save a `Server/` file; make every save parseable and bootable), never stop whisper-server (PID 35172), never drive the owner's tabs.** Never `git stash`, never `find /`. Write files with the Write or Edit tool, never a bash heredoc. Do not write the owner's name anywhere.
- Landing `outcome`: one screen — the three commands, the proofs as counts of `load` events, the CLAUDE.md lines you propose, what hot reloading can and cannot do here in three sentences, what was left and why.

## Added mid-task by the coordinator (2026-09-19): a real jsonl-streaming bug

Owner's report, relayed verbatim: "my chat stream, the UI, doesn't seem to update without reloading. I have to uncheck the block reload for it to work." The owner keeps the dev bar's Block checkbox ticked (`window.$BLOCKRELOAD`) so pages stop flashing, and with it ticked the live `.jsonl` streams stop reaching the page: the V3 board (`/framework/ai/v/3/`, reads `ai/v/3/board.jsonl` through `ext/JSONL`'s `live()`) and the dev bar's chat log (`dev/DevBar/says.js`, same file) only show new lines after a manual reload.

Take this ahead of the hot-reload study. Reproduce on the private server with a REAL socket: open `/framework/ai/v/3/`, set `window.$BLOCKRELOAD = true` the way the checkbox does, append a card line to a **scratch copy** of the board file (never the real one), and count: the text must appear with ZERO load events, Block on and Block off. Check the tail path end to end (`ext/JSONL/live.js` subscribe → `Server/plugins/SocketServer/Tail.js` → the rpc back): does a tab open before the file's first append get it; does the subscription survive a socket reconnect (the supervisor restarts the child on every `Server/` edit — does `live()` re-subscribe on reconnect, or does every stream on every open tab die silently at the first `Server/` edit). Fix the cause in the smallest place, prove it with load-event counts, and say which part reaches the owner's OLD `:80` server at once (client files serve fresh from disk) and which part waits for their one restart. The rule to hold to: Block and the reload hold stop RELOADS only; streams always flow.
