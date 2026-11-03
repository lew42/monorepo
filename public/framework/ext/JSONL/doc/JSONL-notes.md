# JSONL.js — Design and Schema Notes

## Core Purpose

An append-only .jsonl log, assembled back into object state.

One JSON object per line, one verb per key, the value self-contained:
- `{"assign": {"title": "jsonl", "now": "building"}}` — Object.assign onto instance
- `{"log": {"at": "2026-08-14T11:01-05:00", "msg": "started"}}` — append to logs array
- `{"action": {"at": "…", "did": "edit", "file": "…"}}` — append to actions array

`assign` replays onto the instance (same Object.assign the constructor runs), so the
assembled log quacks like the POJO it replaces. `log` and `action` append.
Reading is tolerant: a torn line or an unknown verb loses that line, never the log.

`load()` fetches it once; `live()` streams it from the dev socket instead (off localhost,
falls back to `load()`). See live.js.

## JSONL Class

### Field vs Method Collision

A field never replaces a method: `{"assign":{"agent": "…"}}` once overwrote the `agent()`
verb and every later `agent` line threw "this[verb] is not a function" (2026-09-28).
Such a field is kept in `this.fields` instead.

### parse() — error handling

⚠ A dropped line is silent otherwise: one illegal escape in a landing line read as
"still running" for a day. Counted here, warned once per file (see `unparsed` field).

### load() — SPA fallback detection

⚠ The SPA fallback answers a miss with index.html — content-type is the 404.
We detect 404 by checking content-type header, never just HTTP status.

### flat() — legacy verb-less format

A line with no verb of its own — `{"at", "task", "msg"}` in a day log, or the
`{"type": "launch", …}` / `{"type": "decision", …}` shape old task logs wrote before
every line had a verb. Still a real record, not noise: it carries something to read
(`msg`, `text` or `title`) alongside a `type` or `at` that marks it as genuine.

Returns a value shaped like a `log` line's own (`{..., msg}`), or `null` when there
is nothing to show as one line — `apply()` then tries treating the whole thing as
`assign` before it ever gives up and warns.

### apply() — verb/stray/legacy line handling

Every key splits into a known VERB (dispatches to its handler) or a STRAY (anything else).
Three old, still-live shapes get a real line instead of one `skip()` warning per stray key:

1. **NO verb at all** — `{"at", "task", "msg"}` in a day log, or the `{"type": "launch", …}`
   old task logs wrote before every line had a verb. `flat()` turns it into a `log` line when
   there's something to read (`msg`/`text`/`title`); failing that, a real `at` makes it a
   pre-wrapper `{"assign": {...}}` line — written the way `session.json` always was, a bare
   object of fields (`now`, `step`, `steps`, `worktree`, `branch`, …) — and it merges onto
   the instance exactly as `assign` would (the module's own history: `assign` lines replaced
   whole-object `session.json` writes verb-for-verb).

2. **EXACTLY ONE verb, plus keys that belong INSIDE its value** — `{"log": "built…", "at": "…"}`
   instead of `{"log": {"at": "…", "msg": "built…"}}` — fold straight into that verb's own
   value (the value's own fields win a clash) rather than dispatch and then warn on the rest.

3. **Two or more real verbs on one line, still carrying stray progress fields** —
   `{"log": "…", "decision": {...}, "step": 5, "now": "…"}`, live in several 2026-09-30
   task logs — every verb still dispatches, and a stray's `at` says "this is a real assign", not junk.

A stray with no `at` to vouch for it, on a line with no verb to fold into, is the one case
nothing here can make sense of — it still warns, same as always.

### dispatch() — field/method collision via static lines

A verb normally dispatches to `this[verb]()`, its own method of the same name. One verb can't:
`TaskJSONL`'s `shots` would call a method of that name, but a FIELD of that name already exists
on the instance (the plain `shot` verb's own array, read by `shot_wall()`) — a field always wins
over a method, so `this.shots` IS the array, not a function, and calling it throws.

`static lines`, set only where that collision is real, renders such a verb straight onto `logs`
by calling the function instead of `this[verb]()`. Every other verb dispatches exactly as it always has.

### skip() — one warning per verb

One bad habit (a stray key, an old verb a subclass dropped) is one line in the console per file,
not one per line of the log — `this.warned` tracks which verbs already spoke up for THIS instance.

## TaskJSONL Class

Extends JSONL to manage a task manifest as a log — the fields session.json held, arriving as
`assign` lines. Tracks agents, chats, shots, asks, decisions, verdicts, ranks, folds, and notes.

### agent — merge by task

Appends at dispatch and merges by `task` when the same agent lands with its outcome.

### ask — merge by id

One thing the owner asked for, in their own words: `{id, at, summary, quote, prompt, status, tasks, links}`.
`prompt` is the `uuid` of the message they typed it in, so the card can link back to the real sentence.
Merged by `id`, exactly as `agent` merges by `task`: the ask is appended once when it is heard
and again whenever its status moves.

### decision — merge by id; handle legacy string format

ONE CHOICE, WITH THE ALTERNATIVES IT WAS CHOSEN OVER — a claim tree:
`{id, at, about, options: [{id, say, why}], chose, because, rule, status, note}`.
`about` is the question in one line, `options` are the candidates that were really considered,
`chose` names the winner by its option id, `because` is one sentence, and `rule` is the skill
section that produced it (`layout#spacing`), so an Improve is traceable back to the rule.

Merged by `id`, the way `agent` merges by `task` — a decision is appended when it is made
and again whenever it is revised.

A hand-written `{"decision": "some text"}` line is a string, not an object: without an id
it "matched" the previous one and `Object.assign` onto a string threw, killing every AI 2
card page (page-audit, 2026-09-30). Keep it as text; merge only real ids.

### verdict — separate line; reconcile via judged()

⚠ The verdict is its OWN line, never an edit of the decision: the log is the record of what
was thought over time. `judged()` is what makes the decision object agree with it, so every
reader has one place to look.

THE OWNER'S ANSWER TO ONE DECISION: `{id, at, decision, say: "approve"|"improve", note, filed}`.
Written by a press on the Decisions tab (through the dev socket's `rpc:append`) and merged by `id`,
so the CLI can come back later and stamp `filed` onto the same row.

### judged() — reconcile verdict onto decision

The newest verdict on one decision, assigned onto that decision's `status` and `note`.
Called from BOTH verbs, because a replayed file can carry them in either order — a verdict
read before its decision line would otherwise land nowhere and the row would show as still open.

`say` is the BUTTON's word (approve / improve); `status` is the decision's state
(open / approved / improve). One letter apart, and the tab counted zero approvals until
they were reconciled here.

### rank() — replaces entire order; fold sets band collapse threshold

⚠ THE LAST LINE WINS OUTRIGHT — the whole order is replaced, never merged.
`ask` and `decision` merge by id because each line describes ONE thing that keeps changing;
a rank line describes the WHOLE list at one moment, and half of an order is not an order.
The history is still every line in the file, the way `verdict` keeps every press.

THE OWNER'S ORDER FOR ONE LIST: `{list, at, order: ["<id>", …]}`.
`list` names which list of this task's own log is being ordered — `asks`, `decisions` or `tasks` —
and `order` is every id in that list, best first. Written by the owner's drag on the Asks or
Decisions tab, through the dev socket's `rpc:append`, into this same file.

A rank line may also carry `fold`: how many items of the list a reader sees before the rest
tucks under an "N more" they open — the `asks` list's bands use it to keep a topic to one screen.
`list: "topics"` is the same verb, ordering the BANDS themselves rather than the cards inside one.

### chat — browser turn {at, role, text}

One browser turn: {at, role, text}. Written by Server/plugins/Ask.js.

### shot — screenshot metadata {at, path, url, width, label}

One screenshot taken outside the repo: {at, path, url, width, label}. See ext/JSONL/readme.md.

### note — message from orchestrator {id, at, msg, links}

A message FROM the orchestrator TO whoever reads this task's board:
`{id, at, msg, links: [{url, label}]}`. Merged by `id`, the way `ask` and `agent` are —
a note can be corrected by a later line carrying the same id rather than living on as
two disagreeing copies.

### experiment — one thing tried: {try, measure, result}

ONE THING TRIED, in three parts: `{"experiment": {"try", "measure", "result"}}` —
what was done, how it was checked, what came of it (some write `name` instead of `try`; both read).
No array of its own: it joins `logs`, the same plain line every other reader of this file already
draws, as `"<try> → <measure> → <result>"` with any missing part left out.

### review — review pass (summary or answer)

A REVIEW PASS, in one of two shapes the skills already write: the SUMMARY, once per pass —
`{"review": {"found", "real", "fixed"}}` — or one ANSWER to a single finding —
`{"review": {"answer": {"n", "reply"}}}`. Like `experiment`, it joins `logs` rather than
growing its own array: `"review: found N, real M, fixed K"` for the summary,
`"review: #N — <reply>"` for one answer.

### bands — audit round {round, read}

ONE AUDIT ROUND'S READING, written by `Server/review.mjs --bands`:
`{"bands": {"round", "read": [...]}}` — `round` is the pass number (the first line omits it,
meaning round 1), `read` is what that pass actually checked. Joins `logs`, same family as
`experiment`/`review`/`shots`: `"bands: round N, M read"`.

## ranked() function

Put a list in the order a `rank` line asked for.

Anything the order does not name keeps its place BEHIND everything it does — a new ask written
after the last drag appears at the end of its band rather than jumping to the top, and two
unranked items stay in the order the log wrote them. `id` says how to read an item's id;
the default reads `.id`, which is what `ask`, `decision` and `agent` all carry.

⚠ Unranked items are numbered `order.length + i`, never `Infinity`:
`Infinity - Infinity` is `NaN`, and a comparator that answers NaN leaves the array in whatever
order the engine's sort happened to reach.
