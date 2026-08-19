# Decisions — the record

Revisable, all of them; the first run (`/framework/research/livereload/`, 2026-08-18) is the evidence. Write `never`/`always` only for what actually broke.

## Verdicts

- **One append-only file per topic, `research/<slug>/research.jsonl`.** Parallel minions cannot overwrite each other; every disagreement is a line that stays. Not a `.md` (merges collide, history vanishes), not a database (nothing to serve statically). The `ai/` task logs proved the shape; `ext/JSONL` replays it; `Tail` streams it — nothing new on the wire.
- **The writer validates, the AI does not.** Every line comes through `verbs.js` (`validate()`), whether the CLI or an MCP tool called it. Unknown kind, 241 chars, a `dissent` without `--why`, a parent that does not exist — refused with a reason, exit 1, nothing written. The owner's console had `JSONL: unknown verb "status"` from a hand-written log the same afternoon; a schema in code is the fix, a schema in a prompt is not.
- **The tree is the iceberg.** Every node has a parent; depth is unbounded; the page opens one level at a time with native `details`. Master → detail → detail is a `--parent` chain, not a second file.
- **`text` ≤ 240, `why` ≤ 1000, `summary` ≤ 7 lines.** Walls of text are refused, not discouraged. Detail goes behind `--refs` (`file:line`, a url).
- **Importance is a vote, verdicts are the orchestrator's.** Anyone rates 1–5; the score is the mean; only `by: orchestrator` writes `verdict` and `summary`. Nothing is deleted — a low score sinks, `parked` says when it would rise.
- **`outline`, not the file.** Minions read the compact tree (a few hundred tokens), fenced to a subtree by the brief. That is the context-pollution control; reading everything each round is what the owner did not want.
- **Sockets already existed.** `Tail` streams appended lines to subscribed tabs; the page uses `.live()`. No new channel — the "MCP → JS → file → socket → browser" path is MCP tools writing a file `Tail` already watches.
- **Two writers, one core.** `research.mjs` (CLI, works today) and `Server/plugins/Research.js` (MCP tools, need a server restart to appear) call `store.mjs`; agents that see the MCP tools get schema'd arguments and no shell quoting; agents that don't still have the CLI.
- **Random ids, kind-lettered** (`c7k2q`, `d…`, `e…`, `s…`): parallel writers must not coordinate; the letter makes an outline scannable.
- **Data ≠ code.** `ext/Research/` is the module (renderer, verbs, writers); `research/` holds topics — the same split as `ext/AITask` ↔ `ai/`. Topics need no `page.js`; `research/page.js` routes the slug.
- **Not the Doc system.** Docs explain a module; research argues a question. The Doc page of `ext/Research` is ordinary; a topic can cite any `doc/*.md` in a `--refs`, which is all the integration needed until a topic wants to *dig into a module's docs* — then the brief fences a scout to that `doc/` dir (no code change).

## Open

- **Owner direction from the page** — a box that appends `{"log": {"msg": "owner: …"}}`; the orchestrator's next round reads it. Parked until a write RPC is the obvious one to reuse.
- **A programmatic orchestrator** — the rounds are a script's shape (open → scouts → skeptic/builder → verdicts); the Workflow tool is the natural host. Not built: the first run was hand-orchestrated to learn what the rounds are.
- **Images** — `icon` (a Material Symbol, big on root cards) and `img` (a url, e.g. a `shot`) exist; nothing generates them yet.
- **`agent` is orchestrator-only in the schema but minions update their own chip** — that is the live "what is each one on"; the `who` column is advisory, the tool does not enforce it. Enforce only if it bites.
