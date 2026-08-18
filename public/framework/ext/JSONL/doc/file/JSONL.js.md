# `JSONL.js`

Two classes in one small file: `JSONL`, the append-only log reader (parse,
replay, tolerate), and `TaskJSONL extends JSONL`, the task manifest wearing
that shape — `agent`, `chat` and `shot` on top, a wider `static verbs`.
Nothing else in the module depends on internals here beyond the two exported
classes.

## Two doors to the same replay

`load()` fetches the file once; `live()` hands the instance to `live.js`'s
`stream()`, which subscribes to it on the dev server and feeds every appended
batch through the same `read()`. The import runs **this way** — `JSONL.js`
imports `live.js`, never the reverse — so a consumer changes nothing but the
method name, and `live.js` reaches the replay through the instance it was given
(`s.jsonl.parse(…)`) rather than importing the class back; that is also what makes
a streamed batch's bad lines count on the same
[`unparsed`](../property/unparsed.md) tally a fetched one does. `reset()` is
the streaming path's other requirement: the one way to un-replay a log, called
only when the server says the file was rewritten, and `unsubscribe()` the way out
of a stream that is never going to answer.

## The whole class is "one verb, one method, one array"

`assign`/`log`/`action` on the base map to `assign()` (the constructor's own
`Object.assign`, replayed), `logs.push()`, `actions.push()` — three lines of
real logic in a ~50-line file. The design weight is all in `apply()` and
`skip()`: routing a key through `this.constructor.verbs` rather than trusting
every key blindly is what keeps a typo'd verb from vanishing. See
[apply](../method/apply.md) and [skip](../method/skip.md).

## `parse()` twice — a pure static, and the instance door

The static splits and `JSON.parse`s; the instance method is the one every real read
goes through, and it is where a dropped line stops being invisible (counted on
`unparsed`, warned once per file). Keeping the static pure is what lets the demos
and `read()`'s callers parse text with no instance at all. See
[parse](../method/parse.md).

## `load()` is the one method that talks to the network

Everything else — `parse`, `read`, `apply` — works on text or entries already
in hand, which is why the demos and the tests can exercise the whole replay
logic with a template literal and never touch `fetch`. `load()` alone carries
the SPA-fallback guard; see [its page](../method/load.md) and the
[`loaded`](../property/loaded.md) contract it sets.

## `TaskJSONL` restates `verbs`, doesn't extend the array in place

`static verbs = [...JSONL.verbs, "agent", "chat", "shot"]` — a new array, spread from
the parent's, not `JSONL.verbs.push(...)`. Mutating the inherited array would
have widened what `JSONL` itself accepts too, since statics aren't
per-subclass copies until you make them one. Full record:
[task-jsonl](../task-jsonl.md).

## Improvements

1. **`load()`'s SPA-fallback guard duplicates a `const json = url => fetch(...)`
   helper that exists nearly verbatim in `dev/DevBar/ask.js`,
   `ext/Timeline/ai.js`, and `ext/AITask/dashboard.js`.** Four copies of the
   same five-line guard, one per caller plus this file's `load()`. Not this
   module's fix alone — `JSONL.load()` already centralizes it for anyone using
   the class, so the real fix is those three callers using `TaskJSONL.load()`
   patterns more, or a shared `fetch_json_guarded()` in `util/` the whole
   framework imports once. *(medium, useful — touches four files outside this
   module's fences.)*
2. **`skip()` never caps `.skipped`.** A log with a systematically wrong verb
   name (a renamed method, an old writer never updated) would grow this array
   without bound for the life of the instance — harmless at today's log sizes
   (tens of lines), worth a second look only if a log ever gets large enough
   to matter. *(simple, speculative.)*
3. **No `write()` / append-to-disk method on this class, by design** — noted
   here because it's the first question a reader has, not because it's
   missing. Every real writer on this site is Claude with file tools, or
   `Server/plugins/Ask.js` for `chat` lines; a browser-side append still
   routes through `ext/Saver`'s RPC rather than this class. See "Deferred" in
   [readme.md](../../readme.md). *(n/a — recorded decision, not a gap.)*
