# The Logger API

One topic: how `Logger.js` and `LogView.js` fit together, field by field.

## The entry shape

Everything a `Logger` records is one of two shapes, both carrying `t` (a timestamp,
`Date.now()`) and `depth` (how many groups it sits inside):

- A **log line**: `{ kind: "log", t, depth, args, tag }` — `args` is the exact array you
  passed to `this.log(...)`, never stringified up front (so a live console output can
  still print a real object, not its JSON text). `tag` is `null` for a plain `log()`
  call, or the word `logger.note(tag, …)` set — `LogView` reads `"muted"` (dim) and
  `"highlight"` (a coloured chip) and renders the line differently; any other value is
  just ignored, so a new tag is free to invent.
- A **group**: `{ kind: "group", t, depth, label, entries, duration, id }` — `entries`
  is its own array of the same two shapes, nested to any depth. `duration` (ms) is set
  by `end()` once the group closes — missing while it's still open. `id`, when a caller
  sets it (inside the `group(label, fn)` callback — `fn` receives the entry as its
  argument), becomes the real DOM `id` of that group's `<details>`, so a plain
  `<a href="#that-id">` scrolls straight to it (`whisper/Transcript.js`'s seams do
  exactly this). `logger.entries` is the root of the tree; that whole tree is what
  `LogView` walks to draw nested cards.

## `Logger`

- `new Logger(opts)` — `opts.cap` (default 2000) bounds how many top-level entries
  `logger.entries` keeps; `opts.outputs` are extra outputs (besides the always-on
  `Logger.Memory`) to push onto `logger.outputs` right away.
- `logger.log(...args)` — records a log line in whatever group is currently open (the
  root, if none is). `tag` is `null`.
- `logger.note(tag, ...args)` — the same, with one word attached (`entry.tag`) for
  `LogView` to render differently — `"muted"` or `"highlight"` are the two it knows;
  `Logger.attach()`'s mixin exposes this too, as `obj.log.note(tag, ...)`.
- `logger.group(label, fn)` — opens a group, runs `fn`, and closes the group once `fn`
  returns or its promise settles — so it closes correctly whether `fn` is sync or
  `async`, and even if `fn` throws (the group still closes; the error still propagates).
  Called with no `fn`, it just opens the group and returns its entry — pair it with
  `logger.end()` to close it yourself.
- `logger.end()` — closes the innermost open group. A no-op if nothing is open.
- `logger.entries` — a getter for `logger.memory.entries`, the live nested tree.

## `Logger.attach(obj, opts)`

The mixin. Gives `obj` a `log` function (`obj.log(...args)`) with `.group(label, fn)`
and `.end()` hung off it, plus `obj.logger`, the `Logger` instance underneath — so
`obj.log("x")` and `obj.logger.log("x")` are the exact same call, written two ways.
`opts` are the same as `new Logger(opts)`.

## `Logger.wrap(obj, ["method", ...])`

For each named method, replaces `obj.method` (as an own property on `obj`, so every
OTHER instance of the same class is untouched) with a wrapper that opens a group
labelled `method(short args…)`, calls the real method inside it, and closes the group
when the call finishes — synchronously for a sync method, after the promise settles
for an `async` one. Calls `Logger.attach(obj)` first if `obj` has no logger yet.
`Logger.short(value)` is the small, safe stringifier the group's own label uses for
each argument (strings pass through, everything else is a short `JSON.stringify`,
and neither ever throws on a value that can't stringify).

## The three outputs

Push any of these onto `logger.outputs` (`Logger.Memory` is already there — it IS
`logger.entries`, not really opt-in, because `LogView` has to have a tree to render).
Every output can implement `write(entry, logger)` (a log line), `open(entry, logger)`
(a group opened) and `close(entry, logger)` (a group closed) — all optional, called
only if present.

- **`Logger.Memory`** — the live tree, capped. Attached automatically; you never need
  to add one yourself.
- **`Logger.Console`** — real `console.group`/`console.groupEnd`/`console.log`, so a
  logged object's calls nest in the browser's own devtools console too.
- **`Logger.JSONL`** — collects one JSON line per event (`{kind:"log"|"open"|"close",
  t, depth, ...}`) into `output.lines`; `output.text()` joins them with `\n`.
  **Writing that text to a file is the caller's job** — this class never touches the
  filesystem, on purpose (`core/Page/card/log/` runs in the browser, where there is no
  filesystem to touch; a server-side caller writes `output.text()` out itself).

`Logger.from_jsonl(text)` is the read-back half: given a JSONL string in exactly the
shape `Logger.JSONL` produces, it rebuilds the same nested `entries` tree `logger.entries`
would have held live — `new LogView({ entries: Logger.from_jsonl(text) })` renders it
exactly like a live logger would.

## `LogView`

`new LogView({ logger })` for a live view (it pushes its own output onto
`logger.outputs` and redraws on every event); `new LogView({ entries })` for a static
one (a `Logger.from_jsonl(text)` result, or any hand-built array in the same shape).

Levels 1 through `BOXED_LEVELS` (3, from `../depth.js`) render as `.card` — framework.css's
own padded, rounded box, so they never need their own CSS for that part. Level 4 and deeper
give up the box: no padding, no border, just the group's label rendered bigger and bolder
than plain text, at the SAME indentation as its own content — the owner's own example, "a H2
doesn't need an extra indentation for its content, it just uses a big heading." The level
keeps scaling up to a `log-level-5` class and then stops, so a genuinely deep object graph
doesn't shrink its labels past readable. `card/nesting/page.js` draws a plain card tree to
this exact same rule, from the same constant, so the two can't disagree again.

Every group is a native `<details open>`, so a reader can collapse the ones they don't
want to read — no script beyond the browser's own disclosure widget. The toggle itself
is a plain heading, not framework.css's button-shaped `<summary>` — a rotating ▸ caret
(the same mechanism `ui/item.js`'s own caret uses), the label, and a muted
`"N lines · X ms"` (`LogView.count_lines()` walks every nested log line, so a group of
groups still says how much work happened inside it; the `ms` is the group's own
`duration`, missing while it's still running).

Two log LINES next to each other sit tight (0.2em of margin); a GROUP next to anything
— another group, or a line — keeps the full page `--gap`, so a group still reads as its
own thing even beside plain lines.
