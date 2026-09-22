# `TaskJSONL` — the task manifest as a log

`session.json` used to be written once and re-saved whole. `TaskJSONL` is the
same fields — `title`, `now`, `requested_at`, `landed_at`, `tokens`, `agents`,
`chats` — arriving as an append-only stream of `assign` lines instead, plus
six verbs `JSONL` doesn't have.

```js
export class TaskJSONL extends JSONL {
	static verbs = [...JSONL.verbs, "agent", "chat", "shot", "ask", "decision", "verdict", "rank", "note"];

	agents = [];
	chats = [];
	shots = [];
	asks = [];
	decisions = [];
	verdicts = [];
	notes = [];

	agent(value){
		const known = this.agents.find(a => a.task === value.task);
		known ? Object.assign(known, value) : this.agents.push(value);
	}

	ask(value){
		const known = this.asks.find(a => a.id === value.id);
		known ? Object.assign(known, value) : this.asks.push(value);
	}

	chat(value){ this.chats.push(value); }
	shot(value){ this.shots.push(value); }
	note(value){
		const known = value.id && this.notes.find(n => n.id === value.id);
		known ? Object.assign(known, value) : this.notes.push(value);
	}
}
```

## `agent` — dispatched once, landed later, one row

An orchestrator appends `{"agent": {"kind", "task", "model"}}` when it hands a
task to a worker, then appends `{"agent": {"task", "outcome", "tokens"}}`
again when that worker lands. `agent()` finds the existing row by `task` and
`Object.assign`s onto it rather than pushing a second one — an append-only
file expressing a value that mutates, the same move `assign` makes for the
whole object, done here for one array entry.

## `ask` — one thing the owner asked for, in their own words

`{"ask": {"id", "at", "summary", "quote", "prompt", "status", "tasks", "links"}}`,
written by whoever is running the session as they read a prompt back. `summary`
is one plain sentence; `quote` is what the owner actually said, verbatim, never
tidied; `prompt` is the `uuid` of the transcript message they said it in, so a
reader can get back to the real sentence; `status` is `open`, `building` or
`landed`; `tasks` are the slugs of the task dirs doing the work.

It merges by `id`, exactly as `agent` merges by `task`: the ask is appended once
when it is heard and again whenever its status moves, so an append-only file
never holds two disagreeing copies of it. `ext/AITask` renders `asks[]` as the
**Asks** tab — see
[`ext/AITask/doc/asks.md`](/framework/ext/AITask/doc/asks/).

An ask may also carry **`topic`** — one short phrase naming the parent subject
it belongs to (`"AI log"`, `"Layouts"`, `"Design system"`). The Asks tab groups
the wall by it, one small heading per topic, in the order the topics first
appear in the log. It is optional in every sense: an ask without one joins a
last group called *Other*, and a task whose asks carry no topic at all renders
exactly the one ungrouped wall it always did. Because it merges by `id` like
everything else, topics can be stamped onto asks long after they were written —
a line carrying only `{"ask": {"id": …, "topic": …}}` is enough.

### `conclusion` and `minutes` — the owner's own words, 2026-09-18

*"The easy, clear, matter-of-fact statements — this is this or this is not
this — conclusions that summarize what I've been asking are the best things
to put at the top of any report… lead with the conclusion as the title; if
I'm curious I drill down and see what I asked."*

`{"ask": {"id": "layout-browser", "conclusion": "Every layout on the site is
one wall you can approve or improve."}}` — one plain sentence, written once
the work has actually answered the question, usually as its own line long
after the ask was first heard (it merges by `id`, like everything else here).
When an ask carries one, the Asks tab uses it as the card's title **instead
of** the id-derived title — verbatim, no markdown, no trimming — and the
`summary` that used to sit there moves down to the detail sheet, under a
small "you asked" label, so the reader sees the answer first and the
question one click down. An ask with no `conclusion` yet renders exactly as
it always did: the id-derived title, the summary on the card.

`{"ask": {"id": "…", "minutes": 5}}` — an optional number, set only when
digging into this one will take the owner more than a glance (the owner's
own line: "most items should read in under a minute; if something takes more
than three to five minutes, put a time estimate"). It renders as a small
`~5 min` note beside the card's status chip and says nothing at all when
absent, which is most of the time. **This is a different field from
`needs.minutes`** (below) — `needs.minutes` is how long the *owner's own*
task will take (a login, a decision); this `minutes` is how long *reading
this card* will take. Don't confuse the two when writing a line by hand.

## `decision` — one choice, and the alternatives it was chosen over

```json
{"decision": {
  "id": "spacing-ladder", "at": "2026-09-17T22:43:00-05:00",
  "about": "How many rungs under --gap?",
  "options": [
    {"id": "five", "say": "Five rungs", "why": "83% of the census lands within 15% of a rung."},
    {"id": "two",  "say": "Two rungs",  "why": "Stricter, and it moves 70% of scaled values."}],
  "chose": "five",
  "because": "Five is what the existing code already supports.",
  "rule": "layout#spacing",
  "status": "open"}}
```

A decision is a **claim tree**: the question in one line (`about`), the options
that were really considered, the one that won (`chose`, an option's `id`), one
sentence of reason (`because`), and the rule that produced it — `<skill>#<section>`,
so an objection is traceable back to the skill that caused it. `status` is
`open`, `approved` or `improve`, and nothing but a verdict moves it.

`say` and `why` are **plain text**: nothing runs them through markdown, so a
backtick prints as itself, the same rule `ui.table()` follows for a cell.

It merges by `id`, like `ask` and `agent`. Whoever made the choice writes it —
the `code` and `layout` skills both now say so in as many words.

## `verdict` — the owner's answer to one decision

```json
{"verdict": {"id": "v-spacing-ladder-2026-09-17T23:40:19-05:00",
  "at": "2026-09-17T23:40:19-05:00", "decision": "spacing-ladder",
  "say": "improve", "note": "two rungs, not five", "filed": "2026-09-18"}}
```

Written by a press on the **Decisions** tab, through the dev socket's
`rpc:append`, into the task's own log — never a second file. `say` is the
button (`approve` or `improve`), `note` is the one line an Improve takes, and
`filed` is stamped later by
[`decisions.mjs`](/framework/ext/AITask/doc/decisions-tab/) once the note has
been written into the skill's `improvements.md`.

A verdict is **its own line, never an edit of the decision** — the log is the
record of what was thought over time, and an append-only file can never retract
a rewrite. `judged()` is what keeps the two in agreement: after either verb it
finds the newest verdict on that decision and assigns `status`/`note` onto the
decision itself, so every reader has one place to look. It runs from *both*
verbs because a replayed file can carry them in either order.

⚠ `say` and `status` are deliberately different words: the button says
`approve`, the decision's state is `approved`. `judged()` translates the one
into the other, and the tab counted zero approvals until it did.

Full design record, and why the filing is a CLI:
[`ext/AITask/doc/decisions-tab.md`](/framework/ext/AITask/doc/decisions-tab/).

## `needs` — this one is waiting on the owner

An `ask` or a `decision` may carry one more field:

```json
{"ask": {"id": "sqlite-status", "at": "…", "topic": "Pages", "status": "landed",
  "needs": {"owner": "Cloudflare login and wrangler d1 create", "minutes": 5}}}
```

`owner` is the thing only the owner can do, in their own words — a login, a paid
account, a deploy, an answer — and `minutes` is how long it will take them. Both
are what the **"Needs you" strip** renders, at the top of
[`/framework/ai/`](/framework/ai/) and at the top of that task's own Asks tab, one
line each, shortest first.

The off switch is **`needs.done`** — a date, stamped by a later line on the same
id, and the line goes.

⚠ It is deliberately NOT the ask's own `status`. The ask above is marked
**landed** — the scout finished its report — while the owner has still never
logged into Cloudflare, which is the whole thing that thread is stopped on. An
ask's `status` says what the bot's half of the work is doing; `needs.done` says
what the owner's half is doing, and reading one off the other loses exactly the
item you most needed to see. A **decision** has a second, free off switch: a
verdict on it. "Say whether ranking should stay a drag" is answered by pressing
Approve or Improve, so nothing has to be stamped twice.

Full design record: [`ext/AITask/doc/ranking.md`](/framework/ext/AITask/doc/ranking/).

## `rank` — the owner's order for one list

```json
{"rank": {"list": "asks", "at": "2026-09-18T00:14:55-05:00",
  "order": ["owner-items-first", "threaded-lists", "rank-the-asks",
            "rank-the-decisions", "column-paging-ranked"]}}
```

`list` names which list of this task's own log is being ordered — `asks`,
`decisions`, `tasks`, or **`topics`**, which orders the *bands* the Asks tab
groups its cards into rather than the cards inside one — and `order` is
**every** id in that list, best first. Written by the owner dragging a card, a
row or a band heading on the task's own page, through the dev socket's
`rpc:append`, into this same file.

A rank line may also carry **`fold`**: how many of the list a reader sees
before the rest tucks under an "N more" they open — `{"rank": {"list": "asks",
"order": [...], "fold": 6}}` keeps a busy band to one screen. Omit it and
nothing folds.

⚠ **The last line wins outright.** The whole order is replaced, never merged.
`ask` and `decision` merge by id because each line describes *one thing that keeps
changing*; a rank line describes *the whole list at one moment*, and half of an
order is not an order. Nothing is lost by that: every earlier order is still a
line in the file, the way `verdict` keeps every press.

`ranked(items, order, id)` — exported beside `TaskJSONL` — is the reader half.
Anything the order does not name keeps its place **behind** everything it does, so
an ask written after the last drag appears at the end of its band rather than
jumping to the top.

⚠ Unranked items are numbered `order.length + i`, never `Infinity`:
`Infinity - Infinity` is `NaN`, and a comparator that answers NaN leaves the array
in whatever order the engine's sort happened to reach.

## `chat` — the browser's turn, in the same log

`{"chat": {"at", "role", "text", "cost_usd"}}`, appended by
`Server/plugins/Ask.js` when someone talks to a task from its own page, and
replayed into `chats[]`. A new verb rather than a second file: the task log
already *is* the record for that task, and two stores would need joining. See
[`ext/Ask`](/framework/ext/Ask/).

Two optional fields, both added 2026-09-18 by `ext/Ask`'s
[reply in place](/framework/ext/Ask/doc/reply/), and both written by the
**browser** rather than by the server:

- **`about`** — `{"kind", "id"}`, which ONE item of the task this line belongs
  to: `{"kind": "ask", "id": "even-columns"}`, or a `decision`, a `task`, a
  `dictation`. A line carrying it is drawn in that item's own little thread
  instead of in the task-wide conversation; a line without it is exactly the
  chat this verb has always been, and nothing about it changed.
- **`id`** — a uuid for this one line, so another line can point back at it. A
  dictated `ask` carries `prompt: <the chat line's id>`, which is how a new ask
  card says which sentence it came out of.

Neither is required and neither is read by anything that does not look for it, so
every `chat` line ever written stays valid.

## `shot` — a screenshot taken outside the repo

`{"shot": {"at", "path", "url", "width", "label"}}`, appended by whatever took
the screenshot — the session scratchpad, never the repo (RULE#12), so `path`
(absolute) is the only way back to it. `ext/AITask`'s `shot_wall()` reads
`shots[]` and asks the dev-only `Server/plugins/Screenshots.js` route for each
one by that path; see [readme.md](../readme.md#shot--a-screenshot-taken-outside-the-repo)
for the full shape and why it stays a plain dict rather than growing named
score fields.

## `note` — a message from the orchestrator to a task's own board

`{"note": {"id", "at", "msg", "links": [{"url", "label"}]}}` — one short line
the mastermind (or another orchestrator) wants whoever is reading this task's
board to see, shown at the top. Merges by `id`, the same as `ask` and `agent`:
a later line carrying the same id corrects the note in place rather than
leaving two disagreeing copies. First read by `/framework/ai/v/2/page.js`,
which used to declare this same verb as its own one-off subclass — it is a
verb every `TaskJSONL` reader gets now, so any other board can render notes
without redeclaring them, and no reader warns `unknown verb "note"` on a file
another reader is writing.

## Progress is two assigned fields, never a verb

`steps` (the outline, declared once at launch) and `step` (the 1-based index
underway) arrive as ordinary `assign` fields, read by
[`stats.js`'s `progress()`](/framework/ext/AITask/). A `step` verb was the
obvious alternative and is worse: two sources would exist for one number, and
an append-only file can never retract a miscount. With a single index,
`1..step-1` are done by definition — nothing else needs to say so.

## ⚠ A subclass that adds a verb must add it to `static verbs`, too

`apply()` only dispatches a key that's in `this.constructor.verbs` — a
handler method alone isn't enough. `TaskJSONL.verbs` restates the base list
plus its own six names; forgetting the override compiles clean and fails
silently, with `apply()` routing every `agent`/`ask`/`chat`/`shot` line straight
to `skip()` and a console warning easy to miss in a wall of task output.

The array a new verb appends to needs the same second thought in
[`reset()`](/framework/ext/JSONL/api/reset/) — `TaskJSONL` clears `agents`,
`asks`, `chats`, `shots`, `decisions`, `verdicts` and `notes` there before calling `super`. Miss it and only one
scenario breaks: a streamed log that gets rewritten replays its rows on top
of the old ones.

A verb that's genuinely still unknown (a typo, an old verb a subclass dropped,
a malformed line carrying a stray top-level key) warns through `console.warn`
**once per verb per file**, not once per line — `JSONL.skip()` tracks which
verbs it has already warned about on `this.warned`, a `Set` cleared by
`reset()`. Every dropped line still counts in `.skipped`, so nothing is lost;
only the console noise is capped, so one bad habit repeated forty times in a
file is one line in the console, not forty.

## Who reads it

`ext/AITask`, `ext/Timeline` and `dev/DevBar` all load a `TaskJSONL` and read
`.agents`/`.chats` (and, through plain `assign`, every legacy `session.json`
field); `ext/AITask` alone also reads `.shots`, into `shot_wall()` — see
[readme.md](../readme.md#who-uses-it) for what each does with it.
