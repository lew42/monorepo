Opens `<task>/task.jsonl` — one `assign` line, no process — and resolves
`{task}`, or `{task, existed: true}` if the file was already there. It's the
`+` button in the dev rail's thread panel, and the only thing in this module
that creates the file `record()` (inside `Server/plugins/Ask.js`) later appends
to.

## Idempotent by design

Opening an existing thread is **not an error** — the server checks
`fs.existsSync` before writing and replies `existed: true` rather than
throwing. A caller doesn't need to check first; `thread(task)` is safe to call
on every "open this panel" regardless of whether the dir is new.

## The `request` field, and its one caller

`opts.request` becomes the `assign.request` line in the freshly-created
`task.jsonl` — the human-readable "why does this thread exist" that
`AITask`'s head() would print if the thread ever grew a `requirements.md`. No
current caller passes it (`dev/DevBar/ask.js`'s `add()` calls bare
`thread(task)`), so the field is live but unexercised.

## Improvements

1. **`opts.request` has no caller.** Either wire it from the dev rail's
   "name this thread" prompt (the prompt text *is* the request, and it's
   already being asked for), or drop the parameter until something needs it —
   an unused option is a silent trap for the next reader who assumes it does
   something because it's plumbed all the way to the server. *(simple,
   useful.)*
2. **No `available()`-style short-circuit before the socket write** — unlike
   `ask()` and `start()`, `thread()`'s own JSDoc says it rejects off localhost,
   and it does (same `socket.disabled` check), but the guard is copy-pasted
   into all three rather than shared. Not urgent; three lines, unlikely to
   drift, but worth naming if a fourth RPC ever joins them. *(simple,
   speculative.)*
