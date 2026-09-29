# Server

Dev only — Servex starts it behind its proxy: `http://monorepo.localhost/` (port 80 is
Servex's since 2026-09-23). By hand: `PORT=<n> node server.js` (`PORT` defaults to 80, `HOST` to bind somewhere
other than `0.0.0.0` — Servex passes `HOST=127.0.0.1` to the servers it starts).
Reuse the one already running. ⚠ It used to pin a core (~130%) every few days;
**fixed 2026-09-06**, but a server started before that is still running the old
code — restart it. What it was: [`doc/spin.md`](./doc/spin.md).

The owner-facing server also starts `whisper-server` for dictation on its own —
[`plugins/Whisper.js`](./plugins/Whisper.js), `NO_WHISPER=1` to opt out; see
[`ux/Dictate`](/framework/ux/Dictate/).

**`node Server/health.mjs`** is a separate, optional "is it working" watcher — not a
plugin, no port of its own, safe to run beside any of these servers or none: it
headless-checks a page after the file that could have broken it changes, and tells
the editing agent at its very next write. `HEALTH_BASE` picks which server to load
pages against (default `http://localhost:8123`, the mastermind's). Full story:
[`public/framework/ai/health/readme.md`](/framework/ai/health/).

**`node Server/layout-check.mjs <url...>`** shoots pages at four widths and flags wasted space; **`Server/on-landing.mjs`** runs it by itself on every task landing (the ledger hook spawns it) and logs the result to the task, and flagged pages to `servex-mastermind`.

**`node Server/merge.mjs <worktree>`** now finds the pages a branch changed by itself (every `page.js`/`page.jsonl` in its diff, mapped to its site url) and hands them to `Server/smoke.mjs`, which follows every same-origin link it finds one level deep instead of only loading the pages it was told about — the gap that let 7 broken concept-tile links land unnoticed; a NEW page in the diff also gets a 1920 screenshot into `.merge-shots/`. [`public/framework/ai/2026-09-28/smoke-links/`](/framework/ai2/2026-09-28/smoke-links/).

**`node Server/window-lint.mjs`** answers one question about the whole repo: **which
`spawn`/`exec`/`execFile`/`fork`/`Start-Process` call is missing `windowsHide: true` (or
`-WindowStyle Hidden`)**, the flag that stops a process popping a visible console in front of
the owner. The same per-call check runs on every Edit/Write, live, in
`.claude/hooks/syntax-guard.mjs`'s `hidden_guard`; this is the repo-wide sweep version. It's
advisory (never throws, always exits 0) and can flag a same-named method definition or a
prose mention as a false positive — read the hit before editing anything.
[`public/framework/ai/2026-09-28/hidden-windows/`](/framework/ai2/2026-09-28/hidden-windows/).
Same idea, one launcher: every script starts Chromium through
[`Server/browser.mjs`](./browser.mjs), never `chromium.launch(` on its own — window-lint and
syntax-guard's `browser_guard` both flag a stray one too. `node Server/window-watch.mjs` is the live catcher —
an always-on `EnumWindows` probe that logs any NEW visible console or browser window (scoped so
the owner's own Chrome never counts). [`doc/browser.md`](./doc/browser.md).

**`node Server/padding-check.mjs <url>`** answers one question about one page, and
exits non-zero when the answer is no: **does any text on it sit at 0 from an edge** —
the nav rail, the window, the ToC column, or the border of any box that paints a
ground of its own. The owner made that a law of the whole system on 2026-09-22.
Four widths by default (`--width 3440` for one; `--base` picks the server), because
the bug that prompted it only appears above 1312px and `health.mjs` was looking at
1280 alone. `health.mjs` now imports the same measurement, so the watcher checks it
too — one definition, three callers. The before/after over 107 pages:
[`/framework/ai/2026-09-22/padding-law/`](/framework/ai/2026-09-22/padding-law/).

**`Server/on-landing.mjs`** runs automatically the first time the ledger hook sees a task with
`landed_at`: text-check (walls of text), layout-check and padding-check on the pages the landing
names, and — new in the task-loop work — **`Server/doc-check.mjs`**, which checks every module
the task touched (the nearest directory at or above a touched file that has its own `page.js`,
skipping a task's own `ai/**` notebook) for a `readme.md`, a `doc/` dir, and readme links that
actually resolve. Each check appends one line to the task's own log; a dirty doc-check also
posts one nag line on the task's card (Servex's `card_reply`, over its `/mcp` door) so the owner
sees it without opening the log. ⚠ It is a plain file/dir existence check, so a module whose
`page.js` routes some of its readme's links to *virtual* children (declared in code, no matching
directory on disk) can flag those as dead when the site actually serves them fine — it does not
understand the router, on purpose, to stay this simple.
[`public/framework/ai/2026-09-28/task-loop/landing-checks/`](/framework/ai2/2026-09-28/task-loop/landing-checks/).

**Landing needs an outcome.** The ledger hook (`.claude/hooks/ledger.mjs`) refuses a `landed_at`
with an empty or missing `outcome` — it blocks the stop, every time, and logs the refusal to the
task once (not on every retry), so `landed_at` alone can never read as done.

**node Server/review.mjs <taskdir> [<worktree>]** gets a fresh agent — one that never saw the
author's conversation — to read the brief and the diff and say pass or fix, before `merge.mjs`
will take a `light` or `full` branch. Full story: [`doc/review.md`](./doc/review.md).

## The supervisor

`server.js` at the repo root is a small supervisor: it forks the real server —
[`run.js`](./run.js), every `Server.use(...)` — as a child, and restarts that
child when `Server/` or `server.js` itself really changes (never on a plain
read — same [`MtimeFilter.js`](./MtimeFilter.js) as below). `NO_SUPERVISE=1
node server.js` skips it and runs `run.js` bare, exactly as `server.js` always
used to.

**It boot-tests a change before it ever touches the live child (2026-09-19).**
A four-minute outage on 2026-09-19 (a `Server/` file that parsed but threw at
boot) showed `node --check` proves a file *parses*, never that it *boots* — so
now every real change first forks a CANDIDATE on a spare port with
`BOOT_TEST=1` (a flag `Directory.js` and `LiveReload.js` honour with one line
each, so a candidate never rebuilds `directory.json` or touches the
reload-hold lock) and waits up to 8s for a real HTTP 200. Only then does it
kill the old live child and start the new one — on any failure the live child
is never touched, and `.server-boot-failed.json` at the repo root says why.
Every kill is deadline-bounded, so the supervisor itself can never wedge, and
a cold start into an already-broken tree stays up and waits for a fixing
change instead of crash-looping. Full story and the eight-case proof:
[`doc/watch.md`](./doc/watch.md).

⚠ **Saving `server.js` does not upgrade a supervisor already running** — the
owner's and the mastermind's each keep their own in-memory copy until
restarted by hand (their *child* still restarts on any `Server/` change, same
as always). Restart by hand only once you know this exact file boots — see
`doc/watch.md`.

## Watching public/

**One** recursive `fs.watch` handle on `public/` — [`watch.js`](./watch.js) — feeds
both `LiveReload` and `Directory`. `watch(fn)` calls `fn(absolute path, "rename" |
"change")`; Windows says `"rename"` for anything that changes the shape of the tree
and `"change"` for a write into an existing file. `LiveReload` takes both,
`Directory` only `"rename"`.

⚠ **One handle, not one per directory, is the whole point.** chokidar opened 8,532
of them, and a handle whose directory is deleted underneath it spins for ever on
Windows — that is what pinned a core. [`doc/spin.md`](./doc/spin.md).

⚠ **A "change" event fires on a plain file READ too**, not just a write — this
machine has Windows' last-access tracking on. [`MtimeFilter.js`](./MtimeFilter.js)
only lets a "change" through when the file's `mtime` really moved; the
supervisor above uses the same class on `Server/`. The trap, the measurement,
and the proof: [`doc/watch.md`](./doc/watch.md).

`LiveReload` feeds two channels — the protocol both sides build to is
`public/framework/dev/Socket/doc/wire.md`.

- **`.jsonl` → `Tail`** (a `Socket` plugin, `DevSocket.Socket.use(Tail)`): the
  subscribed sockets get the appended lines, nothing reloads. A file's byte
  offset always lands just past a `\n`, so a half-written trailing line is left
  unread and every offset a client echoes back on re-subscribe is resumable.
- **everything else → a debounced `changed([url paths])` broadcast**, deduped
  over ~300ms. `changed()` with no path still means "reload everything"
  (`[null]`). A socket muted for a path drops that path from its own batch and
  keeps the rest.

`Directory` rebuilds the two `directory.json` files and reports them by name, so
a new file reloads the boards that list it without reloading the whole site.

### Holding the reloads for YOUR OWN files during a batch of writes

`node Server/hold.mjs on "<who> — <what>" --paths "public/framework/<yours>/**"` — before a
batch of edits that touch a file the live site loads, this queues `LiveReload`'s broadcast
**for the paths you named, and only those**: they still queue, deduped, and nothing about them
gets sent until `node Server/hold.mjs off "<who>"` — one reload, once, for the whole batch.
Everything outside your fence keeps reloading normally, for everyone.

⚠ **Quote the globs**, or bash expands `**` before node sees it. A hold with no `--paths` falls
back to `public/framework/ai/**` and prints a warning naming the holder.

⚠ **It was global until 2026-09-22 and that was the wrong shape.** While any agent held, the
owner's own save did not reload the owner's own tab — their dev bar said "held by
board-declutter, 220s" and gave them no way to know that was why. The readout names the fence
now ("board-declutter holds ai/v/3/\*\*, 220s"), and `Server/hold.mjs`'s `matches()` is the one
place the glob rules live. Why, and the proof:
[`reload-rethink`](/framework/ai/2026-09-22/reload-rethink/).

`.jsonl` streams (`Tail`, above) are a separate channel and are never held. The lock is
one small JSON file at the repo **root** (`.reload-hold.json`, git-ignored, outside
`public/` — a hold must never itself look like a change to watch), a list so two agents can
hold at once, and it expires on its own after 5 minutes so it can never stick. `LiveReload`
polls that one file every 500ms rather than opening a second watch handle — a hold also has to
expire on a timer with no file write at all, so one mechanism does both jobs. Full design, the
"prove" numbers and why the first poll has to wait for the server's own `"listening"` event
(touching `socket_server.sockets` any earlier crashed the child at boot — Server.js hadn't
finished constructing it yet): `public/framework/ai/2026-09-19/reload-hold/requirements.md`.

The watcher used to lock every directory under `public/` against renaming (*Permission
denied* from `git mv` and `Rename-Item` alike). Fixed with the same change — only
`public/` itself carries a handle now.

## What a browser can ask the dev server to do

Every one of these is a `Socket` plugin, and every one comes in through the loopback-only
upgrade below.

| rpc | file | what it does |
| --- | --- | --- |
| `write(file, data)` | `Runtime.js` | writes one file under `public/`, creating directories |
| `ls(dir)` | `Runtime.js` | lists a directory |
| `rm(dir)` | `Runtime.js` | removes a path, recursively |
| `move(from, to)` | `Runtime.js` | **renames one path to another under `public/`** — one atomic `fs.rename`, refusing a path that escapes `public/`, a source that is not there and a target that already exists; the reply carries the reverse move so the caller can undo. Also rewrites every link and import that pointed at `from`, site-wide, using the census `core/Page/tools/links.mjs` keeps at `public/links.json` — the reply's `links: {count, files}` says how many. Added 2026-09-18 for Make's real-page drag (`/imagine/paging/make/readme.md`) |
| `append(file, lines)` | `Append.js` | appends whole lines to a `.jsonl` |
| `cmd(command)` | `Runtime.js` | ⚠ `child_process.exec`, no allowlist — see below |
| `ask({..., stream: true, preset})` | `Ask.js`, `Assistant.js` | a `claude -p` turn; `stream` adds `--include-partial-messages` and streams `ask_chunk`/`ask_done` as it generates — `ext/Ask/doc/decisions.md` |
| `card_answer({id, answer})` | `CardAnswer.js` | the doorbell for a card that asked the owner a question (`say.mjs --ask`): appends the answer onto the same card on the board, tells the mastermind's inbox, and RINGS the session named on the card (`ask_to`) with one tiny headless turn given only the `SendMessage` tool — pushes `card_rung` when that finishes. `ai/2026-09-19/card-replies/` |

## The socket wire is loopback-only

`server.js` loads `DevSocket` — a bare subclass of `SocketServer` — so every
`Socket` plugin (`Runtime`, `Ask`, `Start`, `Tab`, `Tail`) comes in through **one
door**, the WebSocket upgrade. `SocketServer.js` guards it with two checks, and
both have to stand because they refuse different callers:

- **the peer address**, via `MCP.js`'s `loopback()` — the same predicate `/mcp`
  uses. It is the one field a caller cannot choose.
- **the `Origin`**, when one is sent. A WebSocket upgrade is *not* subject to the
  same-origin policy, so any site visited in a local tab can open
  `ws://localhost` — and that request does come from loopback, so only Origin
  refuses it. A browser always sends an honest one; local CLI tooling sends none.

**What was open until 2026-08-16:** only the Origin check existed, and it began
`if (!origin) return true`. Origin is a header the caller writes, so any
non-browser client on the LAN was accepted — and `Runtime`'s `rpc:cmd`
(`child_process.exec`, no allowlist) then ran as the logged-in user. Confirmed by
executing `whoami` over the wire from this machine's LAN address; the server binds
`0.0.0.0` and Windows Firewall has a standing inbound allow for `node.exe`.
`LAW#6` already made this tier localhost-only — the guard just enforces it
server-side, where the client cannot be taken at its word.

**`GET /ai-logs/:id` (`AILogs.js`) is now also `loopback()`-gated (2026-08-17).**
The UUID-shaped id was never a fence: `session_id` is written in plain text
into `task.jsonl` files under `public/framework/ai`, which `express.static`
serves unguarded to the same LAN — so reading one task log handed an attacker
the id needed to fetch the next transcript. Same guard, same import, same
shape as the socket fix above; a loopback caller (the dashboard's own
`replay()` fetch) is unaffected, verified on a throwaway `PORT=8081` instance.

**`AILogs.js` grew three more routes (2026-09-19, `devbar-chat`):** `GET
/ai-logs/` (a cached index of every session — mtime+size cache, so 1.1GB of
transcripts is not re-read per request), `GET /ai-logs/<id>/subagents/` and
`/subagents/<file>` (a minion's own list and transcript, filename validated
against `^agent-[0-9a-f]+\.jsonl$` — no path traversal). Same `loopback()`
guard on every one; `AI_LOGS_DIR` is a test-only env override, never set
against a real server.

**`GET /screenshot` (`Screenshots.js`) is `loopback()`-gated from birth
(2026-08-17, `shots-in-log`).** Serves screenshots a worker takes outside the
repo (RULE#12) — the session scratchpad, or wherever `Shot.js` wrote the
file — so the AI task dashboard can render them, keyed off a `path` a
`task.jsonl` `shot` line logs. Reading arbitrary files outside `public/` is
the exact hole `AILogs.js` had, so this route was built with the guard rather
than having one added later: same `loopback()` import, plus the path is
confined to `os.tmpdir()` **after** `path.resolve()` — a prefix check on the
raw string is defeated by `..` and by symlinks — and only a fixed image-type
allowlist is served. Verified on a throwaway `PORT=8090` instance (the shared
`:80` instance was never touched or restarted): a loopback request for a real
png under the temp root → `200`/`image/png` at the exact byte count; the same
request from this machine's LAN address (`192.168.1.206`) → `403`; a loopback
request whose `path` resolves outside the temp root via `..` (`Temp\..\..\..\
evil.png` → `C:\Users\mike\evil.png`) → `403`, proving the confinement check
fires *before* the `404` a missing file would otherwise give. A headless
Playwright probe then confirmed the whole loop against 5 real screenshots
logged into a real `task.jsonl`: rendered thumbnails whose `naturalWidth`
matched each PNG exactly on the guarded instance, and a `.missing` fallback
swatch with zero console errors and zero failed requests against the live
`:80` instance, which doesn't have this route registered yet.

## MCP — the dev server's powers as tools

`MCP` (`plugins/MCP.js`) answers `POST /mcp` with hand-rolled JSON-RPC 2.0 —
MCP streamable HTTP in its simplest legal form: one POST, one
`application/json` answer, no session id, no SSE. `.mcp.json` at the repo root
points every Claude session in this repo at it, so the tools arrive as
`mcp__site__pages`, `mcp__site__eval`, `mcp__site__shot`.

| tool | does |
|---|---|
| `pages` | the connected tabs — `[{path, connected_since}]` |
| `eval` | `{code, path?}` run in a live tab, result JSON-serialized. DOM truth without a browser driver |
| `shot` | `{url, selector?, width?, height?}` → a png path, via `Shot.js` and a **globally** installed playwright |
| `claim` | `{note?, who?, path?}` — ring a tab orange so the owner sees which window an agent drives (`public/framework/dev/Claim/`) |
| `release` | `{path?}` — drop the ring, when the task lands |

**Every `eval` answer ends with the tab's state at answer time** — `visibility`,
`focused`, size — attached inside `Socket.js`'s `reply`, not when the call was made,
because a three-second eval spans a click-away. ⚠ A hidden tab does **not** sleep: it
evaluates fine and stops *rendering*, so no rAF and no ResizeObserver. CSS-driven
layout still measures true (a geometry read forces a reflow); anything the page sizes
in a frame callback is frozen, and that reads as a plausible number, never an error.
`shot` is the escape hatch — its own browser, always rendering.
`ai/2026-08-18/mcp-tab-awareness/`.

`eval` needs a reply channel the socket wire lacks, so
`plugins/SocketServer/Tab.js` — a `Socket` plugin, `DevSocket.Socket.use(Tab)` —
sends `{method:"eval", args:[code, token]}` and correlates the browser's
`eval_result` by token, giving up after 10s. `Tab` also records the `hello` each
tab sends — on connect, on every SPA navigation (the site's `navigated()` hook),
and before each `eval` — which is what `pages` lists and what `eval`'s optional
`path` matches. Protocol:
`public/framework/dev/Socket/doc/wire.md`.

**⚠ `/mcp` is loopback-only, and that is the whole security model.** The server
binds `0.0.0.0`; a request whose `req.socket.remoteAddress` is not `127.0.0.1`
/ `::1` is refused with a 403 and logged. `eval` runs arbitrary JS in your
browser and `shot` drives a headless chromium — widening this fence hands the
machine to anything on the LAN.

Deliberately not built: `server_config` (nothing worth configuring yet — a tool
with no consumer is API surface forever), auth tokens, SSE streaming, per-session
tool scoping, exposing subagent transcripts.