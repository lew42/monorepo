# Voice sessions: the file, the routes, the two assistants

## The file

One session is one append-only file, `public<home>ai/<session>.jsonl`. The browser reads it at the same path on the site (`<home>ai/<session>.jsonl`). The session id is `v-` plus a short base36 id.

```json
{"session": {"id": "v-1xrmuro", "home": "/framework/", "at": "…", "project": "monorepo", "host": "…",
             "fast": "session-fast-v-1xrmuro", "smart": "session-smart-v-1xrmuro",
             "backing": {"fast": "<claude session uuid>", "smart": "<claude session uuid>"}}}
{"chat": {"at": "…", "session": "v-1xrmuro", "path": "/framework/", "from": {"kind": "owner"}, "via": "voice", "text": "can you hear me?"}}
{"chat": {"at": "…", "session": "v-1xrmuro", "path": "/framework/", "from": {"kind": "assistant", "id": "fast", "agent": "session-fast-v-1xrmuro"}, "via": "text", "text": "…", "re": "<the owner line's at>"}}
{"chat": {"at": "…", …, "from": {"kind": "assistant", "id": "smart", …}, "text": "<the owner's words, cleaned>", "re": "<the owner line's at>", "level": "clean"}}
{"nav": {"at": "…", "from": "/framework/", "to": "/framework/ext/"}}
{"backing": {"at": "…", "fast": "<uuid>", "smart": "<uuid>", "how": {"fast": "resume", "smart": "fresh"}}}
```

`at` carries milliseconds, so two lines said in the same second never share one, and `re` always names exactly one owner line. `backing` maps the session to the Claude sessions behind it: `claude --resume <uuid>` reopens either one. When the assistants are respawned, a new `backing` line is written, and the latest one wins.

**Beside it:** `<session>.summary.json` = `{id, home, title, summary, at, visited}`, written by the smart assistant's `session_summary` tool. The title is at most 6 words; the summary is one line.

## The folder index: `<dir>/ai/log.jsonl`

Any folder may have an `ai/log.jsonl`: a minimal index of the AI work in that folder. It records presence only, one line per event, each pointing at its detail file, and never step-by-step progress. Exactly three shapes, checked by `check_dir_line()` in `Servex/agents/Sessions.js`:

```json
{"session": {"id": "v-1xrmuro", "event": "started", "title": "Voice session plumbing", "file": "/framework/ai/v-1xrmuro.jsonl", "at": "…"}}
{"task": {"dir": "public/framework/ai/2026-09-29/voice-sessions", "event": "opened", "title": "Voice sessions", "at": "…"}}
{"decision": {"text": "One file per session", "file": "/framework/ai/v-1xrmuro.jsonl", "at": "…"}}
```

- **Servex writes the session lines.** A session writes `started` in its home folder when it is made, and in each new folder it reaches. It writes `ended`, with the latest title, in EVERY folder it reached whenever the pair stops (idle, making room for another pair, a failed revive), and `started` again in its home when it wakes. On install, Servex backfills one `started` line for any session in `sessions.json` whose folders have none (sessions made before this index), and logs how many it wrote. When `session_summary` changes the title, a fresh `started` line with the new title goes to the home. For one id, the latest line wins. A page with no folder of its own uses its nearest parent folder.
- **The smart assistant writes the rest** with the `dir_log` tool, the moment something matters: a decision, or a task it started or routed to. It writes into the folder the work is about: a site path (`/framework/ext/Chat/`) or any repo folder (`Servex/agents` → `Servex/agents/ai/log.jsonl`).
- **Append-only.** The session file and every `ai/log.jsonl` are only ever appended to, never rewritten, because a `follow` reader of a file replaced by a rename can be sent lines again (`Servex/doc/follow.md`).
- `page.jsonl` no longer gets session pointers (slice 1 wrote them there).

## Refined lines: the three levels

A line from the smart assistant with `re` alone is a reply. With `re` AND `level`, it is a refined version of the owner's words, drawn under the raw line. `Session.js` exports the list as `LEVELS`:

| `level` | What it is |
|---|---|
| `clean` | the owner's words with the fillers and slips removed, nothing else changed |
| `edit` | rewritten clearly, every ask kept |
| `summary` | the gist, in a line or two |

`level` is required on every refinement: without it, ext/Chat draws the line as an ordinary reply. The smart assistant writes these with the `session_line` tool. It hears every owner line as `[on /page/ at <at>]`, so it knows the `re` to give; a refinement with no `re` is refused, never guessed.

## The Servex tools

| Tool | Who calls it | What it writes |
|---|---|---|
| `session_summary({session, title, summary})` | the smart assistant, in its first turn and when the topic shifts | `<session>.summary.json`, and a `started` line in the home's `ai/log.jsonl` when the title changed |
| `session_line({session, text, re, level})` | the smart assistant | a `chat` line; with `level`, a refined line |
| `dir_log({dir, line})` | any agent; the smart assistant as it goes | one validated line in `<dir>/ai/log.jsonl` |

## The routes (Servex, port 8090, CORS open)

| Route | Body | Answer |
|---|---|---|
| `POST /api/session/new` | `{path, host?}` | `{ok, session, home, file, resumed, previous}` (see below) |
| `POST /api/session/resume` | `{session}` | `{ok, session, home, file, resumed: true, title, summary, at, last_at}` |
| `POST /api/session/say` | `{session, path, text, via, floor?, cues?}` | `{ok, at, answered_by: [{kind, id: "fast", agent}, {kind, id: "smart", agent}]}` at once |
| `POST /api/session/nav` | `{session, from, to}` | `{ok}` |
| `POST /api/session/floor` | `{session, floor}` | `{ok, floor, released}`: `"done"` writes a held fast reply |
| `GET /api/sessions?page=/x/&limit=10&host=` | | `{ok, sessions: [{session, home, title, summary, at, last_at}]}`, newest first: the sessions named in that folder's `ai/log.jsonl`, or whose `home`/`visited` in `sessions.json` names it |
| `GET /api/session/<id>` | | the session's record |

**`/new` continues a recent session.** If a session from the same project started on this page, or passed through it, and its last line is less than an hour old (`SERVEX_SESSION_RESUME_MS`), `/new` returns that session with `resumed: true`. Otherwise it makes a new one, and `previous` is the page's most recent older session, `{session, title, summary, at}`, or `null`.

**Project, not host.** A session stores the browser's host (`x-forwarded-host` from the dev server's `/servex/` proxy, `Server/plugins/ServexProxy.js`; else the `host` in the body; else the request's `Host`) as information, and the **project** it resolves to, which is what `/new` and `/api/sessions` filter by (`project_of()` in `Sessions.js`): a `<name>.localhost` host is that name; an `ip:port` is the Servex project serving that port (its port registry); anything else is the project this repo is. So the phone on `10.0.0.135:8481` and the PC on `monorepo.localhost` see the same sessions ("any new session knows everything"), and two different sites never mix.

A `say` from a different page than the last one also writes a `nav` line first.

## The two assistants

- **fast** (`session-fast-<id>`): Sonnet, effort low, no tools, no settings, no Servex door: a 1,400-token prompt, no CLAUDE.md, no skills. It hears every line at once, prefixed `[on /page/]`, and answers with one short line. It only does speed and writes nothing. Its brief: `Servex/agents/session-fast.md`.
- **smart** (`session-smart-<id>`): the model `Usage.pick("smart")` gives, effort medium, the full Claude Code preset in the repo with Servex's tools. It hears lines gathered over a 1.5 s quiet gap (`SERVEX_SESSION_QUIET_MS`), each prefixed `[on /page/ at <at>]`, plus `(now on /x/)` when the owner moved. It knows what is in flight and routes to it, sends masterminds a polished brief (never the raw words), names the session, posts refined lines, and writes decisions to the folder index as it goes. Its brief: `Servex/agents/session-smart.md`.

A reply is the agent's final text for its turn, read from the host's event stream and written as a `chat` line.

## The floor: don't reply while the owner is talking

The composer stamps each post with `floor` (`"speaking"` or `"done"`) and `cues` ([`ext/Chat/doc/floor.md`](/framework/ext/Chat/doc/floor.md)); `say` stores both on the owner's line. While the session's latest floor is `"speaking"`, the **fast** reply is held in memory, and only the newest held one is written when the floor turns `"done"` (a `done` say, or `POST /api/session/floor`). While the owner keeps talking, each new fast reply simply replaces the one already held — an earlier held reply is dropped on purpose, never written and never logged, because it was answering words the owner has since added to. A say with no floor counts as `"done"`. The **smart** one is not held, but its 1.5 s quiet gap keeps restarting while the floor is `"speaking"`. As in the page assistant (`Assistant.heard()`, `floor_wait_ms`), 8 s of `"speaking"` with nothing new counts as `"done"` (`SERVEX_SESSION_FLOOR_WAIT_MS`), so a dropped mic never swallows a reply.

## Others who hear the session: `follow`

The pair hears each line by a direct send from `Sessions.js` (decision `d-hear`: `follow` gathers bursts, and the fast reply must come in about a second). Anyone else, such as a mastermind the smart assistant handed work to, or a reused directory mastermind, `follow`s the session file (`public<home>ai/<session>.jsonl`) and hears the owner at the same moment: `Servex/doc/follow.md` (20 lines in 1 s arrive as 1 message, in order).

## Sleep and wake

Memory comes first: an idle `claude` process costs about 250 MB.

- **`/new` and `resume` start no agents.** The first `say` starts the fast agent and sends it the line at once, alone. The smart one starts on the next tick and loads its big context while the fast one answers. Measured: a cold first reply takes 3.6 s from the fast one and 7.9 s from the smart one; once they are running, 1.7 s and 3.3 s.
- **After 5 minutes without a line** (`SERVEX_SESSION_IDLE_MS`), both agents are stopped, unless one of them is mid-turn: a smart turn that reads, refines and spawns can outlast 5 minutes. Their Claude sessions stay on disk.
- **A Servex restart** drops the in-memory quiet-gap batch and any turn in progress. On install, a session whose last chat line is the owner's gets one line from Servex: "Servex restarted; this line wasn't answered. Say it again."
- **At most 2 pairs run at once**, machine-wide (`SERVEX_SESSION_MAX_PAIRS`). Waking a third first stops the pair that has been quiet longest; if every pair is mid-turn, it goes over rather than cut one off.
- **The next `say`** respawns whichever agent is stopped or gone (a Servex restart leaves them gone): it resumes the agent's Claude session, with the same id, cwd and spec. If that session file cannot be found, the agent starts fresh and is given the session file's last 40 lines. Either way a `backing` line is written.

## Past problems

- **The transcripts are committed, on purpose.** A session file is the record ("the full chat log could be logged somewhere… searched or read"), so `<home>ai/v-*.jsonl` is committed like any other page log and is not gitignored (fresh review item 10, declined).

- Before slice 2, every ✦ press leaked two agents forever: `session-` is in Global.js's `LONG` list (never reaped), and a stopped session agent was not revivable. On 2026-09-29 twelve idle ones held the machine at 1.7 GB of free memory. Starting on the first line, the 5-minute sleep and the 2-pair cap are the fix.
- A session record lives in `sessions.json` in Servex's home (`SERVEX_SESSIONS_FILE` moves it), so a restart still finds a session's file.
