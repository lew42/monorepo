# The readme chain

**A fresh agent Servex spawns FOR a directory or a page opens already having
read the readme.md chain from the repo root down to it, in order** — the
owner's own ask, 2026-09-29 — so it knows "where it is" before it does
anything. Built in `Servex/agents/readme-chain.js`; wired in by
`Agents.js` and `Layers.js`.

## What it does

- `readme_chain(dir)` — the raw list: `[{path, text, truncated}]`, root to
  leaf, one entry per directory level under `dir` that has a `readme.md`
  (levels with none are skipped). Each entry is cut to its first screen (its
  own `## More` heading, or 40 lines — whichever comes first); the root
  `CLAUDE.md` is never read here, since every agent already gets it a
  different way.
- `first_prompt(dir, extras = [])` — the seam other code should call: formats
  the chain as one `Where you are: …` block, caps it at ~3,000 tokens
  (dropping whole readmes from the top — the most general one first — never
  the leaf), then appends each of `extras` (`{label, text}`) as its own
  `## <label>` section. A caller like `task-placement`'s "Recent sessions"
  block never has to touch the chain's own formatting or its cap.

Both are plain functions, never throw: an unreadable readme is just skipped.

## Where it's wired in

- **`Agents.spawn(spec)`** — a fresh spawn (never `resume`, never one
  bringing its own `spec.system`) gets `first_prompt(dir)` prepended, where
  `dir` is `spec.task.dir` (`spawn_agent`'s `task: {dir}` option) or
  `spec.page` (a URL path like `/framework/ux/Dictate/`, mapped onto its
  matching repo dir). Neither present — `directory_of()` returns `null` and
  nothing is added.
- **`Layers.js`'s card assistant and manager** — their fresh-spawn prompt
  closures (only ever called when there is no session to resume) open with
  `first_prompt(\`public/framework/ai/${card}\`)` — a card's id IS its
  directory — before their existing text.
- **Not yet wired: `Dispatcher.js`'s own (non-carded) task-mastermind
  spawns.** They have no directory at spawn time — the task mastermind opens
  its own with `new-task` on its first turn — so nothing is passed today.
  (A prior version of this file wrongly said this path already worked via
  `spec.page`; it was a fixed stub, `"/framework/ai2/"`, that `directory_of()`
  started misreading as a real directory — found by review, 2026-09-29, and
  removed from `Dispatcher.js`'s spawn call rather than special-cased here.)
  When `task-placement` gives these spawns a real directory, they pick up the
  chain automatically — no further wiring needed.

## Left out, on purpose

- **A plain minion** (no `task.dir`, no `page`) already carries its directory
  in its own brief text, so `directory_of()` returns `null` and nothing is
  added.
- **Mastermind / master-assistant revival spawns** (`Global.js`) are "on
  duty, answer nothing now" sessions bound to no one place.
- **The ☰ drawer's page AI** posts to `POST /api/page-ai`, which does not
  exist anywhere in `Servex/` yet — its fetch fails and falls back to
  `ext/Ask`'s separate dev-server bridge. Nothing to wire until that route is
  built; it should then open with `first_prompt(page)`.

## The proof

A private Servex, a test agent spawned with `page: "/framework/ux/Dictate/"`
(page-bound, so nothing writes into the live module): its first message opens
with the root readme, then `public/framework/readme.md`,
`public/framework/ux/readme.md`, `public/framework/ux/Dictate/readme.md`, in
that order (`public/` itself has no readme, so it's skipped).
`public/framework/ai/2026-09-29/readme-chain/proof/`.

## Tests

`node Servex/agents/readme-chain.test.mjs` — plain node, matching
`groups.test.mjs`'s house pattern.
