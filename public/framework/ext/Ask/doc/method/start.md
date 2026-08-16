Starts a **new task**, not a turn: the server scaffolds
`framework/ai/<date>/<slug>/` (a `requirements.md` and an opened `task.jsonl`
— exactly what the `new-task` skill writes by hand) and spawns a whole `claude
-p` session to work it, unsupervised. Resolves `{task, slug, session_id, url}`
the instant the directory exists and the process is away — **not** when the
work is done. There is nothing else to await: the task's own log is the
progress channel, and the board (`/framework/ai/`) follows it by live reload.

## It is the only one of the four that writes code

`ask()` and `chat()` are a conversation; `thread()` opens a log with no
process at all. `start()` is the one export that hands a prompt typed into a
web page to a session running with `--permission-mode acceptEdits`
(`Server/plugins/Start.js`) — file writes allowed, no shell. That permission
mode is a deliberate floor, not the default: see the readme's Open section for
whether `ask()`/`chat()` should carry the same one.

## `group` and `model`, not `tools`

Unlike `ask()`, `start()` takes no `tools` — the spawned session gets whatever
tools its permission mode allows, full stop. `group` tags the task for the
board's grouping (`efforts`, see `ext/AITask/compose.js`); `model` is one of
`sonnet` / `opus` / `haiku`, mapped to a real model id server-side
(`Server/plugins/Start.js`'s `MODELS`).

## Improvements

1. **No `tools` parameter, unlike every other RPC in this module.** A caller
   who wants a start that can't touch the shell has no lever — the only floor
   is the fixed `acceptEdits` mode. Given `start()` is the one door that writes
   code, this is arguably correct as a hard limit rather than an oversight, but
   it's undocumented as a deliberate choice anywhere except a code comment.
   *(simple, useful — mostly a one-line note, unless the answer turns out to be
   "yes, let it vary.")*
2. **The reply's `session_id` is the spawned session's, not a live handle** —
   there is no way to attach to it, stream its output, or know it's still
   running short of watching `task.jsonl` for `landed_at`. That's the intended
   design (log as progress channel), but it means a caller who wants "is it
   done yet" has to poll or re-fetch, which nothing in this module wraps.
   *(medium, speculative — `ext/AITask`'s dashboard may already solve this by
   live-reload; worth confirming there before building anything here.)*
