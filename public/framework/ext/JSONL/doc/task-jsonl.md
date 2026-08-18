# `TaskJSONL` — the task manifest as a log

`session.json` used to be written once and re-saved whole. `TaskJSONL` is the
same fields — `title`, `now`, `requested_at`, `landed_at`, `tokens`, `agents`,
`chats` — arriving as an append-only stream of `assign` lines instead, plus
four verbs `JSONL` doesn't have.

```js
export class TaskJSONL extends JSONL {
	static verbs = [...JSONL.verbs, "agent", "chat", "shot"];

	agents = [];
	chats = [];
	shots = [];

	agent(value){
		const known = this.agents.find(a => a.task === value.task);
		known ? Object.assign(known, value) : this.agents.push(value);
	}

	chat(value){ this.chats.push(value); }
	shot(value){ this.shots.push(value); }
}
```

## `agent` — dispatched once, landed later, one row

An orchestrator appends `{"agent": {"kind", "task", "model"}}` when it hands a
task to a worker, then appends `{"agent": {"task", "outcome", "tokens"}}`
again when that worker lands. `agent()` finds the existing row by `task` and
`Object.assign`s onto it rather than pushing a second one — an append-only
file expressing a value that mutates, the same move `assign` makes for the
whole object, done here for one array entry.

## `chat` — the browser's turn, in the same log

`{"chat": {"at", "role", "text", "cost_usd"}}`, appended by
`Server/plugins/Ask.js` when someone talks to a task from its own page, and
replayed into `chats[]`. A new verb rather than a second file: the task log
already *is* the record for that task, and two stores would need joining. See
[`ext/Ask`](/framework/ext/Ask/).

## `shot` — a screenshot taken outside the repo

`{"shot": {"at", "path", "url", "width", "label"}}`, appended by whatever took
the screenshot — the session scratchpad, never the repo (RULE#12), so `path`
(absolute) is the only way back to it. `ext/AITask`'s `shot_wall()` reads
`shots[]` and asks the dev-only `Server/plugins/Screenshots.js` route for each
one by that path; see [readme.md](../readme.md#shot--a-screenshot-taken-outside-the-repo)
for the full shape and why it stays a plain dict rather than growing named
score fields.

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
plus its own three names; forgetting the override compiles clean and fails
silently, with `apply()` routing every `agent`/`chat`/`shot` line straight to
`skip()` and a console warning easy to miss in a wall of task output.

The array a new verb appends to needs the same second thought in
[`reset()`](/framework/ext/JSONL/api/reset/) — `TaskJSONL` clears `agents`,
`chats` and `shots` there before calling `super`. Miss it and only one
scenario breaks: a streamed log that gets rewritten replays its rows on top
of the old ones.

## Who reads it

`ext/AITask`, `ext/Timeline` and `dev/DevBar` all load a `TaskJSONL` and read
`.agents`/`.chats` (and, through plain `assign`, every legacy `session.json`
field); `ext/AITask` alone also reads `.shots`, into `shot_wall()` — see
[readme.md](../readme.md#who-uses-it) for what each does with it.
