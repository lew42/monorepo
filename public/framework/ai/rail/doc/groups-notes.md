# groups.js notes

## THE GROUPS — overview

The left list of previews should primarily be GROUPS, familiar groups. If any new thing happens, instead of becoming its own card, it gets added to one of those groups (owner, 2026-09-24).

`groups.json` names them; each is also a card (`card`), so a prompt can be appended to it. 

**MEMBERSHIP IS A LINE ON THE MEMBER**, latest wins:
- `{"group": "system-design"}` — appended to a task's task.jsonl, or to a card

A GROUP RISES BY ITS MEMBERS, and that is computed in the view: its time is the newest line of its own card or of any member, and its "latest update" is that member's own words. Nothing is copied into the group's log. Detail: doc/groups.md.

## Member.apply() — heartbeat and assign field handling

**ITEM A, 2026-09-30**: a servex-heartbeat check-in ("its agent is not running: it was stopped on purpose") is Servex looking at itself, not real progress — it must never move this task's `last_at`, which is what bumps a task to the top of the Log tab and what every group's own `at()` reads. The line is still handed to `super.apply()` further down, so a task-loop escalation inside it (`log.js`'s `task_status()`) is still seen — only the ACTIVITY-TIME bump is skipped.

An `assign` naming a verb (`{"assign":{"agent":…}}`, waiting-on-you, 2026-09-28) replays as a FIELD over that verb's method, and the next `{"agent":…}` line threw "this[verb] is not a function" on every AI 2 load. The method wins back.

## Member — page events

AN EVENT ON A PAGE: any line whose value names `"page": "/framework/…/"` (real.js).

## real_activity_at()

A card's real last activity — the newest of its own messages and prompts, skipping a `servex-heartbeat` notice (item A, `is_heartbeat_line()`), or its `created` time when it has said nothing real yet. `Groups.real_at()` is how a caller reaches this.

## task_words() and card_words()

**task_words()**: What a task says in a preview — never its slug. Landed: its landing headline. Running: its request's first sentence, and what it is doing now.

**card_words()**: What a card says in a preview: its title, and the last thing said into it.

## Groups class — static days field

How many days of task dirs to read, newest first. Every task log streams over the dev socket: no HTTP request each, and a folder with no task.jsonl answers quietly instead of a 404 (off localhost live() is a plain load()).

## initialize() — MEMBERS() CACHE

**⚠ MEMBERS() CACHE (ai2-hang, 2026-09-30)**: `members(gid)` walks every task and every fold and sorts the result; before this, ONE `paint()` called it 6-8 times per group (once inside `ordered()`'s sort via `at()`→`latest()`, once from `latest()` direct, once for `size`, once inside `cost()`, once more from the `at_of` loop's own `at()` call) — a CPU profile of `/framework/ai2/` found `groups.js`'s `at()`, its index array and `card_words()` among the top hand full of self-time functions. 

`_rev` is bumped every time `changed()` fires — the one place that always means "tasks, folds or task_files really changed" — so the cache can never serve a stale answer, only skip re-doing work nothing asked to change. Detail: ai/sessions/2026/09/30/inbox-ext/ai2-hang/profile.md.

## start() — initialization

`folders` is AI 2's `CardList`; `socket` (optional) says when a new task dir appears.

## read_tasks() — task loading

Every task dir of the days shown. ONE request per day: the day folder's own page.jsonl names its task folders, and each task's task.jsonl is loaded as before (a folder with none fails quietly and is never shown). 

A task folder's OWN listing is fetched only when a card shows that task (task_at()): on a phone every extra request waits a whole round trip (the owner's measurement, 09-29).

directory.json is read only for a day with no page.jsonl. `fresh` (a day) refetches that day's list: a task folder was added to it.

**On phantom tasks**: A task's own folder may not have a task.jsonl at all (e.g. a dir's own listing may not be loaded yet, voice-dir-404) — so this fetch is sometimes for a dir with no task.jsonl at all, and gets a 404. `JSONL.load()` already swallows that quietly (never throws, never logs), but the browser's own network log still notes the failed request once; nothing in JS suppresses that. 

What IS this file's job: never leave a phantom "task" behind, and never ask again. A `m` that never loaded ANY line is no task — drop it from the map, and remember that folder as task-less in the same cache `no_task()` reads, so a later `day()` call skips it without asking.

The shape matches `PageLog.Listing` (Log.js) — `.folder()` included — since anything that later reads this same cache entry (a Page building its own child list) expects that real shape, not just the two fields `no_task()` itself reads.

## day() — one day's task folders

A dir whose own listing hasn't loaded yet (so `no_task` below can't say yet) still gets included here, optimistically — its task.jsonl may 404 (a folder with files but no task, e.g. a voice session's raw-dictation scratch notes, `voice-dir-404`).

`read_tasks()` is where that gets cleaned up: a fetch that comes back with nothing drops the phantom task and remembers the folder as task-less, so this only ever asks once.

A day the ai/ index doesn't name has no flat folder (tasks now live in ai/sessions/): don't probe it, that is a 404 per load.

A folder whose own list is already in and names no task.jsonl is no task; nothing is fetched to ask.

## names() — listing entries

A listing's entries as one list of names, files and folders alike.

## tree() — THE FALLBACK

The dev server's directory.json, read once, for a day or a task with no page.jsonl. The SPA fallback answers a miss with index.html — the content-type is the 404.

`priority: "low"` — this file is ~3.3MB. A browser only opens ~6 connections per origin, and a slow, uncompressed 3.3MB download can occupy one of them long enough to queue a page's own small requests behind it; this lets those go first when both are in flight. See ai/sessions/2026/09/29/slow-card-fix/slow-card-fix/ for the measurement.

## read_cards() — group and recent cards

A card's `group` line is only in its own log, so the folds of the cards touched lately are read through Servex, once per change of their `last`. The group cards are always read: a prompt filed into one moves it.

## real_at() — CARD'S REAL LAST ACTIVITY

**ITEM A, 2026-09-30**: A CARD'S REAL LAST ACTIVITY — its own last message or prompt, skipping any `servex-heartbeat` notice, or its `created` time when it has said nothing else (`real_activity_at()`, below `read_cards()`'s own fold). 

Servex's own index (`cards.jsonl`'s `last`, what `inbox.js`'s `items()` reads by default) folds a card the same naive way `fold.js`'s `state.last` does — a heartbeat notice bumps it there too — so this is the one place in the browser with the card's raw lines already in hand (`read_cards()`'s own `want` filter fetches every card touched in the last two days, which is every card that could plausibly be a hot Inbox row) to know better. 

`null` when this card's fold has not been fetched yet — the caller falls back to the server's own `last` exactly as before.

## group_of() — find group membership

`kind` is "task" (id = slug or "<date>/<slug>") or "card".

## filed() — is this already in a group

Is a rail item already inside a group? Then it is not "not filed".

## members() — everything in one group

Everything in one group, newest first: its tasks, its cards, and what was said into the group card itself.

## task_at() — task directory listing

The task a card points at, as a member-shaped `{ base, files }` — or nothing until the directory listing is in, so the task page is never drawn without knowing which of its files exist.

No page.jsonl there: the directory.json fallback look() read.

## look() — fetch task folder's listing

A task folder's own page.jsonl, fetched when a card first shows it, and again (`fresh`) when the socket says that log grew; then the view redraws.

## task_member() — loaded task at url

The loaded task a task-page url (`/framework/ai/<date>/<slug>/`) points at, or null — null too for a task older than `days`, which is never read.

## cost() — sum member tasks

What a group cost: its member TASKS summed, each dollar once — `total()` is the board's own sum (ext/AITask/cost.js), so AI 2 and the day page agree. Cards carry no cost of their own; nothing measures them.

## latest() — group's newest member

One group's newest member — its time and its own words — or null.

## at() — when a group was last updated

The newest of its members and of its own card's lines — as the card index (`cards.jsonl`) has them, a sub-card counting as for any card.

**⚠ THE INDEX IS WHAT MAKES THIS KNOWN AT FIRST PAINT**: Members are read one log at a time; without it a group had no time for seconds after every (live-)reload and sorted to the bottom of ~350 rows, then jumped back up — "it was there and then it wasn't… a few seconds later it just popped back" (ai2-row-vanish, 2026-09-28).

**ITEM A**: `real_at()` (above) — the fold-based recompute that skips a servex-heartbeat notice — wins over the index's own `last` whenever this card's fold has already been fetched; the index is still the fallback for a card `read_cards()` hasn't reached yet.

## ordered() — groups by newest activity

The groups, the one with the newest activity first. A group with none sorts by its card's own birth.
