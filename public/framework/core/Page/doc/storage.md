# Page storage: one page system, many places to keep its lines

**A page is a list of changes (deltas), one JSON line each. Where those lines are kept can change; the page never knows.** Today they are kept in a file, `page.jsonl`. Later the same lines can sit in a Cloudflare Durable Object (live, for visitors), in a D1 table, or in an archive, and the page code does not change.

Three words do the work. The **Store** (`Item.Store`, the page's `page.store`) reads the lines into the page and writes its changes out. A **Backend** is how the browser reaches the lines. A **Journal** is where a server keeps them: the page's *home*. ("Store" here always means `Item.Store`; `ai/AISession/StoreFolder.js` and `ext/Saver` are unrelated.)

```jsonc
// a page.jsonl: line 1 builds the page, each later line is one change
// "home": "room" = in production, kept live in a Durable Object
{"title": "Comments", "home": "room"}
{"content": {"add": {"id": "c1", "text": "First!"}}}
{"c1": {"text": "First! (edited)"}}
```

```
Page ─ page.store ─▶ Store          core/Item/Store.js (exists)
  backend (how the browser reaches the lines):
    DevBackend      localhost: fetch, live socket, append
    StaticBackend   production: fetch once, read only
    MemoryBackend   demos and tests: writes nothing
    CloudBackend    a page whose home is Cloudflare (later)

Journal (the page's home, on a server):
    FileJournal     page.jsonl files: the default
    RoomJournal     one Durable Object per live page
    D1Journal       one table: lists across visitor pages
    Archive         E:, R2, Drive: old pages, read only
```

- **The first slice** (a brief, ready to spawn): [storage-slice-1.md](storage-slice-1.md): split `Store`'s fetch/socket code into `DevBackend` + `StaticBackend` with zero behaviour change.
- **Monthly cost at today's volume: $0** (free tiers), or **$5** if the deploy moves to Workers Paid. The trap is a Durable Object left awake: about half a cent per page-hour. [Costs](#4-costs-cloudflare-prices-read-2026-10-13).
- **The one rule for syncing:** every page has exactly one home that accepts writes; every other copy is a read-only mirror. [Syncing](#syncing-a-laptop-and-cloudflare).

Sections: [1 Classes](#1-the-classes) · [2 Declaring and archiving](#2-how-a-page-declares-its-home-and-how-an-archive-keeps-the-url) · [3 Decisions](#3-decisions) · [4 Costs](#4-costs-cloudflare-prices-read-2026-10-13) · [5 Past Cloudflare asks](#5-past-cloudflare-asks-prioritised). The ask: [requirements.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/storage-design/requirements.md) (the owner's words: asks 5 and 6 of [requirements-2.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-2.md), asks 3 and 6 of [requirements-3.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-3.md)).

---

## 1. The classes

Two sides, because a line has two ends: the **browser** that shows the page, and the **server** where the line is kept. The browser side picks *how to reach* the lines (by where it is running); the server side is *where they live* (by what kind of page it is).

### Browser side: `Store` and its backends

```js
// core/Item/Store.js — EXISTS. The one class a page talks to (page.store). Its API does not change.
class Store {                                  // one log of lines ↔ one live object
	static for(url)                            // one Store per url (exists)
	static dev                                 // NEW: the ONE "am I on localhost" test (Page.Reader.dev becomes an alias)
	static pick(url)                           // NEW: the ONE place a backend is chosen (dev → Dev, else Static)
	backend                                    // NEW: a Store.Backend; every fetch, socket and write goes through it
	open()        → this                       // read everything, then tail (exists; body now calls the backend)
	close()                                    // stop tailing (Page.Reader's close() moves here, into backend.close())
	load()        → this                       // read once (exists; body now calls the backend)
	read(lines)                                // replay each line through host.set(line); echo skip (exists, unchanged)
	attach(host)                               // listen for the host's "delta" event → append (exists, unchanged)
	append(line) / flush()                     // queue a tick's lines, then backend.append(lines) (exists)
	changed() / reset()                        // hooks for subclasses (exist)
}
class PageLogReader extends Store             // core/Page/Reader.js — EXISTS, unchanged (Page.Reader)

// core/Item/backend/Backend.js — NEW in slice 1. How the browser reaches one page's lines.
class Backend {
	open(store)                  → store            // base: same as load(); a live backend (DevBackend) also keeps tailing
	load(store)                  → store            // read everything once, into store.read()
	append(lines)                                   // resolves once the lines are durable; base: does nothing
	close(store)                                    // stop tailing
	get writable()                                  // false: changes stay in memory, with the one warning Store prints today
	get live()                                      // false: nothing streams (static production)
}
class DevBackend    extends Backend   // [slice 1] localhost: fetch + ext/JSONL/live.js + FsFile.send() (Store's code today, moved)
class StaticBackend extends Backend   // [slice 1] production: one fetch, not writable, not live (Store.load() today, moved)
class MemoryBackend extends Backend   // [slice 1] an array; demos and node tests (a demo never persists)
class CloudBackend  extends Backend   // [later, ext/Cloud/] GET /api/page?since=, then a WebSocket to the page's RoomJournal

// NOT in slice 1: CloudBackend adds a line-number cursor (it can't replay a whole file on every reconnect)
//	read(since = 0)               → { lines, seq }   // every line after line number `since`
//	tail(seq, on_lines, on_reset) → stop()           // new lines within ~100 ms; on_reset = history was replaced
```

### Server side: `Journal`, the page's home

```js
// core/Item/Journal.js — later (slice 2), plain ESM with no node imports, so node AND a Cloudflare Worker can extend it.
class Journal {                                // where one kind of page keeps its lines; the "home"
	append(path, lines)        → { seq, bytes } // validate (jsonl-schema check), then write; durable before it returns
	read(path, since = 0)      → { lines, seq }
	watch(path, since, on_lines, on_reset) → stop
	snapshot(path)             → { state, seq } | null   // the cached current state (section 3), when one exists
	compact(path)                              // old lines → page.<n>.jsonl beside it; the live file restarts with a snapshot line
	archive(path, archive)                     // every segment → the Archive; the folder keeps a two-line pointer
}
class FileJournal extends Journal   // Server/FileJournal.mjs — today's files; folds Append.js's write, Tail.js's read, page_tools' write_line()
class RoomJournal                    // worker/room.js's Room, generalised: one Durable Object per page url, SQLite table lines(seq, line, at),
                                     //   hibernating WebSockets; a Durable Object class must be its own class, so it implements the five verbs, not extends
class D1Journal  extends Journal    // worker/pages.js grows into it (later): table page_lines(path, seq, line, at), indexed on (path, seq)
class Archive                        // Server/Archive.mjs — put(path, files) · get(path) · where(path); one bundle per day
	DiskArchive · R2Archive · DriveArchive    // E:, Cloudflare R2, Google Drive; read only once written
```

### Which existing file becomes which

| Today | Becomes | Change |
|---|---|---|
| `core/Item/Store.js` (`Item.Store`) | `Store`, same name, every existing method kept; adds `dev`, `pick`, `backend`, `close` | its `fetch`, `live.js` and `FsFile` lines move into `DevBackend`/`StaticBackend` |
| `core/Page/Reader.js` (`Page.Reader`) | unchanged | still `extends Item.Store` |
| `ext/JSONL/live.js`, `ext/filesystem/FsFile.js` | used by `DevBackend` | none |
| `Server/plugins/SocketServer/Append.js`, `Tail.js` | callers of `FileJournal` | their file reads and writes move into it (slice 2) |
| `Servex/agents/page_tools.js` `write_line()`, `.claude/hooks/append.mjs`, Servex `append_log` | callers of `FileJournal.append` | one validated append path instead of four (slice 2) |
| `worker/room.js` `Room` | `RoomJournal` | table `deltas(author, role, text)` becomes `lines(seq, line, at)` |
| `worker/pages.js` | `D1Journal` | later, only for visitor pages listed across pages |
| `ext/Query` `QueryServer.Source` | **the in-memory index** (not a Journal) | loads a collection's lines from its Journal, filters in JavaScript, `watch()`es for changes; built by the sibling task session-index |
| `ext/JSONL/JSONL.js` (`TaskJSONL`) | a second replayer, for task logs | converges onto `Store` later (the converge note in [ext/JSONL/readme.md](../../../ext/JSONL/readme.md)); not touched now |
| `ext/Saver`, `page.prefs()` | the "snapshot store" that was asked for | state-only data (a setting, a draft) already has a home; no second one is built |

### What `Page` calls, and never calls

- **Calls:** `Store.for(url)`, `store.open()`, `store.attach(page)`, `store.close()`. A page change emits `"delta"`; the Store records it.
- **Never calls:** a backend, a journal, `fetch`, a socket, a table name. A page that knows where it is kept can't be moved.

---

## 2. How a page declares its home, and how an archive keeps the url

**One word, `home`,** in `page.js` (`home: "room"`) or as a line in its `page.jsonl` (`{"home": "room"}`). It names the *kind* of home, never a database: `files` (the default, can be omitted), `room` (a live Durable Object), `table` (D1 rows), `archive`. Two resolvers read it, one per side: `Store.pick()` in the browser and `Journal.pick()` on the server. So "the page never names its backend" ([cms/thinking.md](/imagine/cms/thinking.md), test 3) still holds: it names a need, and one table maps the need to a class.

On localhost every home is served from files (`room` included), so local development needs no Cloudflare account. In production a `room` page loads its static file first, sees the `home` line, and `Store` hands over to `CloudBackend` from that line number on: the static file is the seed, the room holds everything after it.

**Archiving keeps the url working, and destroys nothing:**

1. `journal.archive(path, archive)` writes every segment (`page.jsonl`, `page.1.jsonl`, … and the folder's other files) into one bundle in the Archive, with a sha256 and a manifest line in `Server/archive-manifest.jsonl` (old path → bundle).
2. The folder keeps a new, two-line `page.jsonl`: a **snapshot line** (so the page, its card and its listing still render) and `{"home": {"archive": "r2:lew42-archive/2026/09/04.tar", "lines": 412, "sha256": "…"}}`.
3. Opening the page shows the snapshot; "Open the full log" asks the server for the bundle (on localhost from E: or R2, in production from R2 through a Worker).

Compaction is the same move one size down: old lines go to `page.1.jsonl` *beside* the file (still in git), and the live file restarts with one snapshot line. Both are moves plus a pointer, done by a script with a dry run and a manifest (CLAUDE.md: moves are scripted).

---

## 3. Decisions

**Deltas stay the primary mechanism; a snapshot is a cache.** A line is the unit of storage everywhere: a file line, a table row `(path, seq, line)`, a Durable Object row. *Why:* appending is safe with many writers (read-modify-write lost 98% of updates when measured, 2026-09-19); streaming at ~100 ms is "send the new lines"; history and undo come free; git diffs stay readable. *Alternative:* the snapshot as the truth (rewrite `page.json` on every change): rejected for those four reasons. *Trade-off:* reading a page means replaying it, which the snapshot cache and compaction fix.

**A snapshot is computed at three moments only:** at compaction (a log past ~1 MB: 10 files today, the largest 7.2 MB), at archive, and on request (`page_read`). Never on every write. It is a line, `{"snapshot": {"state": {…}, "seq": 4120, "of": "page.1.jsonl"}}`, so it travels like any other line. *Blocker, named:* it needs a node replay that equals the browser's `Page.set()`; today's `page_read` replay is partial. The answer is to run the real `Item` replay in node (`Item.js` and `Store.js` already load in plain node), not to write a second replayer. Until then nothing is compacted, because a wrong snapshot loses information.

**What a real-time home must provide** (the test any candidate passes or fails):
1. `append` is durable before it answers (`appendFileSync` does it; a Durable Object's output gate does it).
2. New lines reach every open tab within ~100 ms, pushed, never polled.
3. A reconnecting tab resumes from its line number with no gap and no duplicate. The cursor is a line number (`seq`), never a byte offset ([durable-objects.md](/imagine/stream/doc/durable-objects.md), gotcha 3).
4. A reset signal when history is replaced (compaction): `jsonl_reset` today.
5. The writer's own line comes back byte for byte, or `append` answers with the stamped line, so `Store`'s echo skip still matches.
6. Idle costs nothing (hibernation).

`FileJournal` passes all six on localhost; `RoomJournal` passes all six in production; **D1 fails 2** (no push), so a D1 table is never a live page's home, only a list across pages.

**Which home fits which page kind:**

| Page kind | Home now | Home later | Why |
|---|---|---|---|
| Task log, session page (`task.jsonl`, `page.jsonl`) | files | files; archived after ~30 days | one writer (the agent), dev only, git is the history |
| Card, board, inbox | files | files | read far more than written; the inbox is one appendable JSONL set |
| Session index (8,700 sessions) | files + the in-memory index | the same | the owner's choice (below) |
| A page visitors write to (comments, likes, a live room) | none | `room` (a Durable Object per page) | strangers can't `git push`; it needs live |
| A list across visitor pages ("every like I made") | none | `table` (D1) | no query can span many Durable Objects |
| Anything older than ~30 days | files | `archive` (E: + R2), pointer left behind | out of the deploy's 20,000-file cap |

**The index is a process with everything in memory, not a database** (the owner, requirements-3.md ask 6: "a process that has them all loaded in memory that can do JavaScript-based filtering… keeps it simple"). It sits *beside* the Journals, not among them: a `QueryServer.Source` ([ext/Query](../../../ext/Query/readme.md)) loads a collection's lines on first query, keeps current state per record, `watch()`es the Journal for new lines, and answers filters in JavaScript (median 1.4 ms over 8,729 sessions, measured 2026-10-12). It is never a home and holds nothing that can't be rebuilt from the files. *Alternative:* SQLite (`node:sqlite`, built into Node 24, so no install): kept for the day memory runs out, which at about 1 KB per session is millions of sessions away. The sibling task session-index builds it.

**One Durable Object per page, for live pages only** (the owner's proposal, requirements-3.md ask 3). This agrees with the 2026-09-04 ruling ([data.md](/imagine/platform/decisions/data.md): the key is the page url). What costs money is the time an object is awake, not how many objects exist: an idle or hibernated object costs only its storage. So "hundreds for every little thing" is wrong for a different reason than cost: no query spans objects, so per-item objects make every list a fan-out. Per page is the grain. The cost per page-hour is in section 4.

### Syncing a laptop and Cloudflare

**The one rule: every page has exactly one home that accepts writes; every other copy is a read-only mirror that pulls the lines after its last `seq`.**

- Pages written on the laptop (the AI log, docs) have files as home; Cloudflare gets them as static files through `git push`, a mirror.
- Pages written by visitors have a room as home; the laptop pulls them (`node Server/pull.mjs <url>`, slice 4) into a local mirror file that `jsonl-guard` refuses to edit.
- Moving a home is itself a line: `{"home": "room"}` is appended to the old home, which then refuses writes and points to the new one.

*Alternative:* two-way sync with a merge (last-writer-wins, or a CRDT). Rejected: two writers to one ordered log is exactly the conflict the rule prevents, and a merge engine is a large thing to own for a site with one author.

---

## 4. Costs (Cloudflare prices, read 2026-10-13)

Sources, with each page's own "last updated" date: [Workers](https://developers.cloudflare.com/workers/platform/pricing/) (2026-10-02, also lists KV and static assets) · [Durable Objects](https://developers.cloudflare.com/durable-objects/platform/pricing/) (2026-09-30) · [D1](https://developers.cloudflare.com/d1/platform/pricing/) (2026-04-21) · [R2](https://developers.cloudflare.com/r2/pricing/) (2026-10-01).

| Service | Free plan | Paid ($5/month Workers Paid): included, then |
|---|---|---|
| Workers | 100,000 requests/day; 10 ms CPU per request | 10 M requests + 30 M CPU-ms; then $0.30/M requests, $0.02/M CPU-ms |
| Static assets (today's site) | free, unlimited requests; 20,000 files | 100,000 files |
| Durable Objects (SQLite only on free) | 100,000 requests/day; 13,000 GB-s/day; 5 M rows read, 100,000 rows written per day; 5 GB | 1 M requests, 400,000 GB-s, 25 B rows read, 50 M rows written, 5 GB; then $0.15/M requests, $12.50/M GB-s, $0.001/M reads, $1.00/M writes, $0.20/GB-month |
| D1 | 5 M rows read, 100,000 written per day; 5 GB | 25 B read, 50 M written, 5 GB; then $0.001/M reads, $1.00/M writes, $0.75/GB-month |
| R2 | 10 GB-month; 1 M writes, 10 M reads per month; egress free | $0.015/GB-month; $4.50/M writes, $0.36/M reads |
| KV | 100,000 reads, **1,000 writes** per day | 10 M reads, 1 M writes, 1 GB; then $0.50/M reads, $5.00/M writes |

**A Durable Object per page, per hour awake:** an object is billed as 128 MB for every second it is awake, so one awake hour is 0.125 GB × 3,600 s = **450 GB-s ≈ $0.0056 (about half a cent)** past the included amount. The free plan covers about **29 awake page-hours a day**; Paid includes about **890 a month**. A hibernated object (tabs open, nobody typing) costs $0 in duration. Incoming WebSocket messages bill at 20 to 1, so 1,000 lines typed into a page are 50 requests.

**This repo's volume** (computed 2026-10-13 from git, not recalled): 142,410 JSONL lines committed in the last 30 days (37,276 of them `page.jsonl`), about 30 MB of text records in all history, about 350 MB of new pictures a month ([repo-size.md](/framework/ai/doc/repo-size.md)).

| Scenario | Monthly cost |
|---|---|
| Today: static site, files on the laptop | **$0** (19,619 of 20,000 deploy files: the [deploy-cap](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/deploy-cap/) task trims it; otherwise Workers Paid, $5) |
| Archive to R2: ~0.4 GB a month (pictures + text), one bundle a day | **$0** for about two years (10 GB free), then $0.015/GB-month (15 GB ≈ $0.08) |
| Every page log live in rooms at today's rate: 142k lines ≈ 300k row writes a month (each line plus its index) | **$0** on free (≈ 10k writes a day of the 100k), if objects hibernate |
| The same, with 20 pages kept awake 8 hours a day | ≈ 2.2 M GB-s: **≈ $27** ($5 + $22 of duration). The cost is awake time, nothing else |
| A D1 table of visitor lines | **$0** at this volume. The known trap is rows *scanned*: one public bill reached 127.6 B row reads on an unindexed table ([data.md](/imagine/platform/decisions/data.md)); index `(path, seq)` |
| KV as a store | not used: 1,000 writes a day rules it out |

**Rules that keep it cheap:** hibernating WebSockets only, no timer or alarm that keeps an object awake; every D1 query on an index; the laptop stays home for everything only the owner writes.

---

## 5. Past Cloudflare asks, prioritised

Most important to this design first. Collected from `node Server/PastWork.mjs` runs and `git log` by a Haiku helper ([cloudflare-asks.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/storage-design/cloudflare-asks.md)), cross-checked against the [production-stack inventory](/framework/ai/sessions/2026/10/09/session-54d56780/production-stack/doc/inventory.md).

| # | Ask | Date | Status |
|---|---|---|---|
| 1 | One page system, many stores (this page) | 2026-10-13 | ⬜ designed here; [slice 1](storage-slice-1.md) not built |
| 2 | Keep the deploy under Cloudflare's 20,000-file cap | 2026-10-13 | ⬜ [deploy-cap](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/deploy-cap/) |
| 3 | Archive old sessions to the E: drive and R2 | 2026-10-13 | ⬜ planned in [repo-size.md](/framework/ai/doc/repo-size.md), phase 2; R2 waits on the login (row 4) |
| 4 | "Cloudflare API setup, 5 mins": `npx wrangler login`, D1 create | 2026-09-18 | ⚠️ not done; needs you ([inventory](/framework/ai/sessions/2026/10/09/session-54d56780/production-stack/doc/inventory.md), blocker 1) |
| 5 | Where state lives: one Durable Object per page url, D1 for rows, R2 for media | 2026-09-04 | ✅ decided ([data.md](/imagine/platform/decisions/data.md), [decision-data](/framework/ai/sessions/2026/09/04/decision-data/)) |
| 6 | A page log in a Durable Object (snapshot, log, row-id cursor, hibernation) | 2026-08-30 | ✅ designed ([durable-objects.md](/imagine/stream/doc/durable-objects.md)) |
| 7 | Simulated Cloudflare services you can run locally | 2026-09-08 | ✅ partly: Worker + D1 + Durable Object under `wrangler dev` ([local-dev-harness](/framework/ai/sessions/2026/09/04/local-dev-harness/), [run.md](/framework/ai/sessions/2026/09/06/platform-slice/run.md)); no R2 |
| 8 | Pages stored in D1 | 2026-09-17 | ✅ locally ([pages-in-d1](/framework/ai/sessions/2026/09/17/pages-in-d1/), [/imagine/cms/d1/](/imagine/cms/d1/)) |
| 9 | Production stack inventory; first slice "GitHub sign-in + one like" | 2026-10-09 | ✅ inventory; ⬜ slice not built ([production-stack](/framework/ai/sessions/2026/10/09/session-54d56780/production-stack/)) |
| 10 | Cost and shape research ($0 / $20 / $150–200 a month at 100 / 10k / 1M users) | 2026-09-04 | ✅ ([research-cloudflare](/framework/ai/sessions/2026/09/04/research-cloudflare/)) |
| 11 | Cloudflare Tunnel + Access, to reach the PC from outside | 2026-10-01 | ⬜ decided, not installed ([remote-access](/framework/ai/sessions/2026/10/01/remote-access/requirements.md)) |
| 12 | Cloudflare's MCP server (agents create D1/KV/R2) | 2026-08-30 | ✅ documented ([cloudflare-mcp](/framework/ai/sessions/2026/08/30/cloudflare-mcp/), [/imagine/cms/services/](/imagine/cms/services/)) |
| 13 | Sign-up UX, Google sign-in, avatars | 2026-09-18 | ⬜ partly: `ux/Auth` UI only, no backend |
| 14 | Cloudflare page-to-markdown API for agent web search | 2026-10-01 | ⬜ not researched |
| 15 | Payments | 2026-09-05 | ⬜ nothing built |
| 16 | Prior Cloudflare work, audited (no Worker ever shipped) | 2026-09-04 | ✅ ([prior-cloudflare](/framework/ai/sessions/2026/09/04/prior-cloudflare/)) |

**The order to build in:** slice 1 (the backend seam, no behaviour change) → slice 2 (`FileJournal`: one validated append path, and the node replay that unblocks snapshots) → slice 3 (archive to E:, then R2 once row 4 is done) → slice 4 (`RoomJournal` + `CloudBackend` for the first page a visitor writes to, on a preview branch). Nothing reaches Cloudflare before row 4.
