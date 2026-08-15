# ext/Ask

Talk to a Claude Code session from the browser. A text input or a button sends a
prompt over the dev socket; the dev server runs one headless turn of the `claude`
CLI and streams the reply back.

```js
const { text } = await ask("Name the three widest elements on this page.");
```

`chat({ task, from, resume, history })` is the same thing as a panel, and
`AITask.chat()` mounts it on every task detail page — so
[`/framework/ai/<date>/<slug>/`](/framework/ai/) is a chat window onto that
task's session, and the exchange lands back in its own `task.jsonl`. The dev rail
mounts the same panel on **every** page, over threads stored beside that page
(`dev/DevBar/ask.js`).

| piece | where |
|---|---|
| `ask()` / `available()` | `Ask.js` — one RPC over `dev/Socket` |
| `thread()` | `Ask.js` — open a thread dir; no process. See below |
| `start()` | `Ask.js` — a NEW task, not a turn; see below |
| `chat()` | `chat.js` — the panel: history, input, streaming bubbles |
| the spawn | `Server/plugins/Ask.js` — `rpc:ask` → `claude -p` |
| the picture | `Server/plugins/Shot.js` — one element, as a png the turn reads |
| the record | a `chat` verb on `TaskJSONL` (`ext/JSONL`) |

## `task` is a path under `public/`

Every RPC here takes the same one: `framework/styles/layouts/ai/rhythm` beside a
page, or the legacy `framework/ai/2026-08-14/browser-cli-bridge`. It was
`<date>/<slug>` relative to `public/framework/ai/` until 2026-08-15, when threads
moved next to the pages they are about (`dev/DevBar/ask.js`).

**The fence is that path.** Browser input reaches a file write here, so
`thread_dir()` in `Server/plugins/Ask.js` requires it to resolve under `public/`,
name no `..`, match `[\w.-]+` per segment, and carry an **`ai` segment** — which
both shapes do, and nothing else in the repo does. `record()` additionally
requires `task.jsonl` to already exist; `thread()` is the only thing that creates
one, and creating an existing thread replies `{existed: true}` rather than
failing.

`thread()` writes one `assign` line and spawns **nothing** — a chat is a task
whose log happens to be mostly `chat` lines, so `TaskJSONL` needed no new verb and
there is no second store to join. `start()` is the other door: a task that wants a
whole session working it.

## A turn is a process, not a pipe

The obvious reading of "inject into a live session" is a wrapped terminal — a
pty, a named pipe onto an interactive `claude`'s stdin. **We do not do that.**
`claude -p --resume <id>` starts a fresh process, replays the session from its
transcript on disk, takes one turn, and exits (measured: 2.5s for a trivial
haiku turn). Continuity is the *file*, so there is no long-lived child to
supervise, nothing to reconnect to after a server restart, and no orphan to pin
a core on Windows.

The cost is that a turn is not free-form interactive: no permission prompts, no
mid-turn steering. In `-p` a prompt that would block is answered by the
permission mode, not by a human.

## The first message forks

A headless turn must never share a transcript a human still has open in a
terminal — both processes append to the same `.jsonl` and the interactive one
knows nothing of the browser's turn. So the first browser message on a task
sends `from: <the task's session_id>`, which becomes `--resume … --fork-session`:
the chat inherits the task's entire context and gets **its own** session id. That
id lands in `task.jsonl` as `chat_session_id`, and every later message sends it
as `resume`. One fork per task, forever.

## `shot` — let it look at the element

```js
await ask("What is wrong with this card's layout?", { shot: ".preview-card" });
```

A turn has the full tool set, so the only missing half was the browser *making*
a picture. `Shot.js` drives **globally installed** playwright — a browser driver
is tooling for the person at the keyboard, never a repo dependency — screenshots
the element to a temp png, and the prompt becomes "read the screenshot at …,
then: …". A string is a selector on the current page; `{url, selector, width,
height}` reaches any other. No playwright, no shot: the turn is refused with
`npm i -g playwright` rather than going quietly blind.

Measured: `.chat-form` on this page, haiku, 7s, $0.034 — and it correctly named
the send button's baseline against the taller textarea.

## The exchange is a verb, not a second store

`{"chat": {"at", "role", "text", "cost_usd"}}` appended to the task's own
`task.jsonl`, replayed by `TaskJSONL` into `chats[]`. No parallel file, no
database — the log the task already had, one verb wider.

## Traps

- **⚠ Appending to `task.jsonl` live-reloads every open tab**, including the one
  that is chatting. `LiveReload.mute(file, socket)` now skips the socket that
  caused a write for 5s; without it, every reply reloaded the page that asked
  for it. Other tabs still reload, which is the behaviour you want.
- **⚠ `Socket.prototype.ask_event` is called BY the server** through
  `Socket.message()`'s method lookup — a grep for callers in `public/` finds
  none. Same live path as `Socket.reload()`.
- **⚠ Off localhost `ask()` rejects.** `Socket.singleton().disabled` is the
  gate, and it is a hard constraint. `available()` is the guard; `chat()` renders
  the recorded history read-only. Nothing on the site may *depend* on a reply.
- **⚠ The prompt is browser input reaching a process spawn.** `spawn` runs with
  no shell and the prompt goes in on **stdin**, never argv — keep it that way.
  The `task` path is fenced by `thread_dir()`; see above.
- **⚠ One turn at a time per session.** A second `ask()` against a session
  mid-turn is refused with "That session is mid-turn" rather than queued —
  two processes resuming one transcript is the corruption case above.
- **A turn costs money.** ~$0.02 on haiku, ~$0.09 on sonnet for a trivial
  exchange, because every turn re-reads the session. `model` and `tools` are
  per-call; `tools: ""` is a pure-text turn.

## Phase 2

- **Streaming input mode** (`--input-format stream-json`, one long-lived child)
  — faster and cheaper per turn, at the price of process supervision. Worth it
  only once turn latency is the complaint.
- **Interrupt** — no way to stop a turn once spawned; the child isn't kept.
- **Shots are temp files** and never cleaned up; a launch is ~1.5s of the 7.
- **`shot` can't capture live client state** — it reloads the URL in a fresh
  browser, so a panel you dragged open is not what it photographs.
- **Permission prompts in the browser** — `-p` answers them from the permission
  mode. Surfacing a real prompt needs `--input-format stream-json`.
- **A task's live interactive session** still can't be *steered* from the
  browser; the fork is a sibling, not a remote control. Open question for Mike.
