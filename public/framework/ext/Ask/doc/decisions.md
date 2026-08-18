# Ask — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

`chat({ task, from, resume, history })` is the same thing as a panel, and
`AITask.chat()` mounts it on every task detail page — so
[`/framework/ai/<date>/<slug>/`](/framework/ai/) is a chat window onto that
task's session, and the exchange lands back in its own `task.jsonl`. The dev rail
mounts the same panel on **every** page, over threads stored beside that page
(`dev/DevBar/ask.js`).

| piece | where |
|---|---|
| `ask()` / `available()` | `Ask.js` — one RPC over `dev/Socket` |
| `thread()` | `Ask.js` — open a thread dir; no process. See [task](/framework/ext/Ask/doc/task/) |
| `start()` | `Ask.js` — a NEW task, not a turn; see [task](/framework/ext/Ask/doc/task/) |
| `chat()` | `chat.js` — the panel: history, input, streaming bubbles |
| the turn | `Server/plugins/Ask.js` — `rpc:ask` / `rpc:thread` → `claude -p` |
| the new-task spawn | `Server/plugins/Start.js` — `rpc:start`; scaffolds `ai/<date>/<slug>/` and spawns a whole session, not a turn |
| the picture | `Server/plugins/Shot.js` — one element, as a png the turn reads |
| the record | a `chat` verb on `TaskJSONL` (`ext/JSONL`) |

## Who uses it

Four real callers, one per shape of "browser talks to Claude":

| caller | uses it for | page |
|---|---|---|
| [`dev/DevBar/ask.js`](/framework/dev/DevBar/) | `thread()` + `chat()` — the dev rail's per-page thread panel, mounted on every page | every page |
| [`ext/AITask/AITask.js`](/framework/ext/AITask/) | `chat()` — "Chat with this session" on a task's own detail page | every task under [`/framework/ai/`](/framework/ai/) |
| [`ext/AITask/compose.js`](/framework/ext/AITask/) | `start()` — the board's "what should Claude work on" box | [`/framework/ai/`](/framework/ai/) |
| [`ext/DesignTool/vision.js`](/framework/ext/DesignTool/) | `ask()` with `shot`, locked to `Read,Glob,Grep` — a second opinion on a numeric layout report | [`/framework/ext/DesignTool/`](/framework/ext/DesignTool/), its [`audit`](/framework/ext/DesignTool/audit/) |

No dead exports: `ask`, `available`, `thread`, `start` and `chat` are each in
real use, none of them from more than one caller shape.

## `task` is a path under `public/`

Every RPC here takes the same one — `framework/styles/layouts/ai/rhythm` beside a
page, or the legacy `framework/ai/2026-08-14/browser-cli-bridge` — and it is also
the **fence**: browser input reaches a file write, so the path must resolve under
`public/`, name no `..`, and carry an `ai` segment. `thread()` is the only thing
that creates a thread dir; `start()` is the other door, for a task that wants a
whole session working it rather than a chat. Full shape, the fence's exact rules,
and why `thread()` no-ops on an existing dir: [task](/framework/ext/Ask/doc/task/).

## Decisions

**A turn is a process, not a pipe.** The obvious reading of "inject into a live
session" is a wrapped terminal — a pty onto an interactive `claude`'s stdin. We
don't do that: `claude -p --resume <id>` starts a fresh process, replays the
transcript from disk, takes one turn, and exits (measured ~2.5s for a trivial
haiku turn). Continuity is the *file*, so there's no child to supervise or
reconnect to — at the cost of no permission prompts and no mid-turn steering.
Long version, including what "Phase 2" would cost: [process](/framework/ext/Ask/doc/process/).

**The first message on a task forks, every later one resumes.** A headless turn
must never share a transcript a human still has open in a terminal, so the first
browser message sends `from: <the task's session_id>` — `--resume …
--fork-session`, a **new** session id that lands in `task.jsonl` as
`chat_session_id`. Every later message resumes that id instead. One fork per
task, forever: [fork](/framework/ext/Ask/doc/fork/).

## `shot` — let it look at the element

```js
await ask("What is wrong with this card's layout?", { shot: ".preview-card" });
```

A turn already has the full tool set; the missing half was the browser *making*
a picture. `Shot.js` drives globally-installed playwright — never a repo
dependency — and refuses loudly (`npm i -g playwright`) rather than going quietly
blind. Full mechanism and a measured cost: [shot](/framework/ext/Ask/doc/shot/).

## The exchange is a verb, not a second store

A chat message is `{"chat": {"at", "role", "text", "cost_usd"}}`, appended to the
task's own `task.jsonl` and replayed by `TaskJSONL` into `chats[]` — no parallel
file, no database. Detail: [record](/framework/ext/Ask/doc/record/).

## Traps

- **⚠ Appending to `task.jsonl` live-reloads every open tab**, including the one
  that is chatting. `LiveReload.mute(file, socket)` skips the socket that caused
  a write for 5s; without it, every reply reloaded the page that asked for it.
  Other tabs still reload, which is the behaviour you want.
- **⚠ `Socket.prototype.ask_event` is called BY the server** through
  `Socket.message()`'s method lookup — a grep for callers in `public/` finds
  none (`Ask.js:7`). Same live path as `Socket.reload()`.
- **⚠ Off localhost `ask()` rejects.** `Socket.singleton().disabled` is the
  gate, and it is a hard constraint. `available()` is the guard; `chat()` renders
  the recorded history read-only. Nothing on the site may *depend* on a reply.
- **⚠ The prompt is browser input reaching a process spawn.** `spawn` runs with
  no shell and the prompt goes in on **stdin**, never argv — keep it that way.
  The `task` path is fenced by `thread_dir()`; see [task](/framework/ext/Ask/doc/task/).
- **⚠ One turn at a time per session.** A second `ask()` against a session
  mid-turn is refused with "That session is mid-turn" rather than queued —
  two processes resuming one transcript is the corruption case above
  (`Server/plugins/Ask.js`'s `turns` map, keyed by `resume || task || id`).
- **A turn costs money.** ~$0.02 on haiku, ~$0.09 on sonnet for a trivial
  exchange, because every turn re-reads the session. `model` and `tools` are
  per-call; `tools: ""` is a pure-text turn.

## Open

- **Tool scoping is opt-in, not enforced.** `tools` is per-call — `vision.js`
  locks itself to `Read,Glob,Grep`, and both demo askers on this module's own
  page pass `tools: ""`. Neither production consumer does: `dev/DevBar/ask.js`'s
  thread panel and `AITask.chat()`'s task chat both call `chat()`/`ask()` with no
  `tools` at all, so a prompt typed into either gets `claude -p`'s own default
  permission mode — nothing here narrows it. `Start.js`'s spawn is the one place
  that opts into a floor (`--permission-mode acceptEdits`, deliberately not
  `bypassPermissions`). Whether the chat path needs the same floor is open —
  The owner's call.
- **Streaming input mode** (`--input-format stream-json`, one long-lived child)
  — faster and cheaper per turn, at the price of process supervision. Worth it
  only once turn latency is the complaint.
- **No way to interrupt a turn once spawned** — the child isn't kept.
- **Shots are temp files and never cleaned up**; a launch is ~1.5s of the ~7s
  `shot` costs end to end.
- **`shot` can't capture live client state** — it reloads the url in a fresh
  browser, so a panel you dragged open is not what it photographs.
- **A task's live interactive session still can't be steered from the browser**;
  the fork is a sibling, not a remote control.
