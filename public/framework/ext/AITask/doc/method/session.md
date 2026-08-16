`task.jsonl` first, `session.json` second. `TaskJSONL({ url }).live()` streams
and replays the log; `t.loaded` is false for a 404 (the SPA fallback answers a
miss with `index.html`, so this checks content and not just `res.ok`) or an empty
file, in which case `legacy()` is tried as the fallback.

The two formats converge on the same shape by design — `ext/JSONL`'s `assign`
verb runs the identical `Object.assign` the old `session.json` constructor ran —
so everything downstream (`report()` and its parts) reads one object and never
asks which format it came from.

## `live()`, not `load()`

The manifest of a *running* task changes while you are reading it. `live()`
resolves exactly as `load()` does — same `loaded` contract, same fallback to
`legacy()` — and then calls back on every appended batch, which
[`refresh()`](/framework/ext/AITask/api/refresh/) turns into a redraw of the
`$live` block. Off localhost there is no socket and this is a plain fetch, so a
statically hosted task page behaves exactly as it did before.

**⚠ The callback is guarded on `this.$live`.** It can fire before `report()` has
built the page — the promise resolves on the first batch, and a second can land
while `requirements()` is still in flight.

## The blind probe, and the one case that unsubscribes

Asking for `task.jsonl` before knowing there is one is deliberate: a task dir
speaks through its files and the page has no listing. A file that isn't there is
answered with an empty batch and a **standing subscription**, which is exactly
right for a task dir scaffolded a second ago — its log streams in with no reload.

It is exactly wrong for a legacy task, whose `task.jsonl` is never coming, so once
`legacy()` has answered with a `session.json` the probe calls
[`unsubscribe()`](/framework/ext/JSONL/api/unsubscribe/) and the dev server drops
it. **⚠ Only on that branch.** A probe that came back empty with no `session.json`
either keeps its stream — that is the just-scaffolded case, and dropping it is how
a brand-new task page would go dead until a reload.
