# The exchange is a verb, not a second store

A chat message doesn't get its own file or database row — it's appended to
the task's own `task.jsonl` as one more verb, the same file `ext/JSONL`
already reads for `assign`, `log` and `action` lines.

## The shape

```json
{"chat": {"at": "…", "role": "user", "text": "…"}}
{"chat": {"at": "…", "role": "assistant", "text": "…", "cost_usd": 0.02}}
```

Two lines per exchange, written in one `appendFileSync` call
(`Server/plugins/Ask.js`'s `record()`). The first message on a task also
prepends `{"assign": {"chat_session_id": …}}` — see [fork](fork/) for why.

## Replayed, not queried

`TaskJSONL` (in `ext/JSONL/JSONL.js`) declares `chat` as one of its verbs and
pushes each one onto a `chats[]` array as the log replays top to bottom — the
same fold every other verb goes through. `AITask.chat()` hands that array
straight to `chat({ history: m.chats, … })` as the panel's starting
history, so a reload doesn't lose the conversation; it re-renders it from the
log.

## Why not a second file

One store means one thing to keep consistent, one thing `TaskJSONL` has to
know how to read, and a task's chat history shows up wherever its log already
shows up — the Files tab, a manifest fetch, a future export — with no second
code path to keep in sync.
