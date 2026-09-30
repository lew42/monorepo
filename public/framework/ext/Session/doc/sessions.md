# Voice sessions: the file, the routes, the two assistants

## The file

One session is one append-only file, `public<home>ai/<session>.jsonl`. The browser reads it at the same path on the site (`<home>ai/<session>.jsonl`). The session id is `v-` plus a short base36 id.

```json
{"session": {"id": "v-1xrmuro", "home": "/framework/", "at": "…", "host": "…",
             "fast": "session-fast-v-1xrmuro", "smart": "session-smart-v-1xrmuro",
             "backing": {"fast": "<claude session uuid>", "smart": "<claude session uuid>"}}}
{"chat": {"at": "…", "session": "v-1xrmuro", "path": "/framework/", "from": {"kind": "owner"}, "via": "voice", "text": "can you hear me?"}}
{"chat": {"at": "…", "session": "v-1xrmuro", "path": "/framework/", "from": {"kind": "assistant", "id": "fast", "agent": "session-fast-v-1xrmuro"}, "via": "text", "text": "…", "re": "<the owner line's at>"}}
{"nav": {"at": "…", "from": "/framework/", "to": "/framework/ext/"}}
```

`at` carries milliseconds, so two lines said in the same second never share one, and `re` always names exactly one owner line. `backing` maps the session to the Claude sessions behind it: `claude --resume <uuid>` reopens either one.

Every page the session touches (its home, then each new page it moves to) gets ONE line in its own `page.jsonl`: `{"session": {"id", "file", "at"}}`. A page with no folder of its own gives its nearest parent folder instead.

## The routes (Servex, port 8090, CORS open)

| Route | Body | Answer |
|---|---|---|
| `POST /api/session/new` | `{path, host?}` | `{ok, session, home, file}` |
| `POST /api/session/say` | `{session, path, text, via}` | `{ok, at, answered_by: [{kind, id: "fast", agent}, {kind, id: "smart", agent}]}` at once |
| `POST /api/session/nav` | `{session, from, to}` | `{ok}` |
| `GET /api/session/<id>` | | the session's record |

A `say` from a different page than the last one also writes a `nav` line first.

## The two assistants

- **fast** (`session-fast-<id>`): Sonnet, effort low, no tools, no settings, no Servex door. It hears every line at once, prefixed `[on /page/]`, and answers with one short line. Its brief: `Servex/agents/session-fast.md`.
- **smart** (`session-smart-<id>`): the model `Usage.pick("smart")` gives (Opus when the week is over 60% gone and weekly use is under that share, else Sonnet), effort medium, the full Claude Code preset in the repo with Servex's tools. It hears lines gathered over a 1.5 s quiet gap (`SERVEX_SESSION_QUIET_MS`), plus `(now on /x/)` when the owner moved. Its brief: `Servex/agents/session-smart.md`.

Both are spawned on `new`, held open with no prompt, and never reaped by the 3-minute worker reaper (Global.js's `LONG` includes `session-`). A reply is the agent's final text for its turn, read from the host's event stream and written as a `chat` line.

## Past problems

- A session record lives in `sessions.json` in Servex's home (`SERVEX_SESSIONS_FILE` moves it), so a restart still finds a session's file. The agents themselves are spawned with code-only fields (`system`, `sdk`), so a wake after a Servex restart reopens them without the fast one's lean tool list.
