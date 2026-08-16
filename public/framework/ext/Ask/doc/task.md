# `task` is a path, and the path is the fence

Every RPC in this module — `ask()`, `thread()`, `start()` — that touches a
task takes the same one shape: a path **under `public/`**, like
`framework/styles/layouts/ai/rhythm` beside the page it's about, or the legacy
`framework/ai/2026-08-14/browser-cli-bridge`. It was `<date>/<slug>` relative
to `public/framework/ai/` until 2026-08-15, when threads moved to live next to
the pages they're about (`dev/DevBar/ask.js`) — both shapes are still valid,
because both carry the one thing the fence actually checks for.

## The fence, exactly

Browser input reaches a file write here, so `thread_dir()` in
`Server/plugins/Ask.js` requires the path to:

- resolve under `public/` once joined (`path.resolve(PUBLIC, task).startsWith(PUBLIC + path.sep)`)
- have every segment match `[\w.-]+` — no `..`, no slashes-within-a-segment, nothing shell-shaped
- **contain an `ai` segment somewhere** — which both the beside-a-page shape and the legacy dated shape satisfy, and nothing else in the repo does by accident

That last rule is doing real work: it's not just "under public/", which would
let a chat thread scribble into `framework/core/View/`. The `ai` segment is
the one invariant every legitimate thread and task shares.

## Three functions, three relationships to the path

- **`thread(task)`** creates it — `mkdirSync` plus one `assign` line — and is
  the *only* one of the three that does. Opening an existing thread is a
  no-op (`{existed: true}`), never an error.
- **`ask(prompt, { task })`** requires the file to already exist; if
  `thread_dir()` returns null or `task.jsonl` isn't there yet, `record()`
  silently skips the append (`Server/plugins/Ask.js`'s `record()`: `if (!dir)
  … if (!fs.existsSync(file)) return;`). A chat with no thread opened first
  simply isn't recorded — not an error, just silence.
- **`start(prompt, opts)`** doesn't take a `task` at all; it makes its own,
  always under `framework/ai/<date>/`, and hands the caller back the path it
  chose (`{task, slug, ...}`) so a later `ask()`/`chat()` against that same
  task uses the identical shape.

## Improvements

1. **A chat sent before `thread()` is called fails silently, not loudly.**
   `record()` returning early on a missing `task.jsonl` means a caller bug —
   forgetting to open the thread first — reads as "the chat worked but nothing
   was saved," discoverable only by later noticing the log never grew. A
   surfaced warning (client-side: the `reply` could carry `recorded: false`)
   would make this loud instead of quiet. *(medium, important — this is the
   one place in the module where the "traps that never throw" pattern from
   `CLAUDE.md` is genuinely present and not yet written down as a trap.)*
2. **The `ai` segment requirement is enforced by regex on the whole path, not
   by structure** — `path.split("/").includes("ai")` accepts `ai` as *any*
   segment, including the last one (`some/ai`) or the first
   (`ai/whatever/../`, if `..` weren't separately blocked). It happens to be
   safe today because the `..` check is independent, but the invariant being
   "there's an `ai` segment somewhere" rather than "there's an `ai` directory
   containing this file" is looser than the prose describes it. *(simple,
   speculative — no known exploit, just a looser check than the mental model.)*
