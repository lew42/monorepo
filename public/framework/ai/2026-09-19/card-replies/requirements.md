# card-replies — a card asks the owner a question with buttons, and the answer reaches the right Claude session in seconds

Load the `minion` skill first. Then this brief. Model: Sonnet. Small: one flag, one server function, one demo page. **Not the V3 page** — a sibling is the one minion there; you prove the pipe on a demo page of your own, and the V3 wiring is already specified in the next V3 brief.

**Three laws.** Less is more. Clear beats brief by far. Prioritize (the answer ARRIVING in a session is the whole task).

## The owner's words (2026-09-19, through the assistant)

> Do we have a way for the dashboard UI to talk back to a session? If a card asks me a question and shows two buttons, or two option cards with short descriptions, and I pick one, does the choice reach the right session? I imagine the browser sends it over the socket, and the server pushes it to the session (maybe through an MCP). Is that set up and working?

## What exists (verify each in ten minutes; say if any is wrong)

- **Browser → file:** the dev socket has an append RPC (`Server/plugins/SocketServer/Append.js`; the dev bar's composer uses it — `public/framework/dev/DevBar/` and `public/framework/ai/v/3/compose.js`) that appends one JSON line to a `.jsonl` under `public/`. The dashboard's file is `public/framework/ai/v/3/board.jsonl` (`card` lines merged by `id`); the mastermind's inbox is `chat` lines (`from: "owner"`) in the newest unlanded `ai/<date>/mastermind-*/task.jsonl` (`.claude/skills/every-prompt/say.mjs` has `run()` to find it; `state` prints `MASTERMIND SESSION <name>`, the name other sessions `SendMessage`).
- **A file line wakes nobody.** A Claude session only sees the inbox when something else wakes it.
- **Server → session is proven possible:** `ai/2026-09-19/assistant-stream/` proved that a headless `claude -p` turn spawned by the server and given only the `SendMessage` tool can message the real mastermind session by name (read its `task.jsonl` for the exact flags; `Server/plugins/Assistant.js` and `Ask.js` show how turns are spawned, `--strict-mcp-config` and all).

## Build

1. **`say.mjs --ask "yes,no"`** (`.claude/skills/every-prompt/say.mjs`, a flag beside `--focus`): the card line gains `ask: ["yes", "no"]`. Also `--ask-to <session name>` (default: the ledger's `mastermind_session`) stored on the card as `ask_to`, so the answer knows where to go. Options with descriptions: `--ask "Rewrite small|one script, no PM2;Move Servex in|keeps its UI"` → `ask: [{label, note}]`.
2. **The server doorbell** — in `Server/plugins/Assistant.js` (or a small sibling; say which and why): a socket rpc `card_answer {id, answer}` that (a) appends `{"card": {"id", "answer", "answered_at", "author": "owner", "status": "done"}}` to the board, (b) appends `{"chat": {at, from: "owner", via: "card", card: id, msg: "<card title> → <answer>"}}` to the mastermind's inbox, and (c) RINGS: spawns one tiny headless turn (Haiku if it can `SendMessage`, else Sonnet; lowest effort; only the `SendMessage` tool; hard timeout 60 s; never more than one ring in flight — queue the rest into a single message) that sends `ask_to` one line: "From the owner, via a card: <title> → <answer> (card <id>)". Loopback only, like its neighbours. A failed ring is logged and never blocks (a) and (b).
3. **The demo page** — `page.js` in your task dir: two live cards drawn from a SCRATCH board file — one with two buttons, one with two option cards carrying a sentence each — using the smallest render that the V3 minion can lift later (`ask.js` beside your page: `ask_controls(card, on_answer)`; after an answer the buttons give way to "you answered: yes · 5:21 PM"). Reuse the framework's `button` and the new `.card` word (`/framework/styles/system/`); write no CSS unless the shot needs it.
4. **Prove it end to end, for real, ONCE:** on your private supervised server (`PORT=8148 node server.js`), headless with a REAL socket, press a button on the demo page with `ask_to` set to the mastermind's real session name from `say.mjs state` — the mastermind will see "From the owner, via a card: card-replies TEST → yes" arrive; say TEST in it. Log the milliseconds from click to the rpc's ack, and to the ring's exit. Everything else (the board append, the inbox line) goes to SCRATCH files via the env overrides that exist (`LEDGER_ROOT`; read `Assistant.js` for the board's) — except that one real ring.
5. Post the result on the owner's log as the answer to their question: `node .claude/skills/every-prompt/say.mjs say "<about five words>" "<two sentences: it works, how long it takes>" --as card-replies --id card-replies --status done --icon smart_button`.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/card-replies/`); `code`, `documentation`, `ui-test`; `finish-task`; `skill-improvement` if a skill misled you.
- **Fence:** `.claude/skills/every-prompt/say.mjs` (the two flags) + one line in `.claude/skills/every-prompt/cards.md`, `Server/plugins/Assistant.js` (or one new sibling plugin + its one registration line in `Server/run.js`), `Server/README.md` (one line), your task dir. Not `public/framework/ai/v/3/**`, not `dev/DevBar/**`, not `.claude/hooks/**`, not `.claude/settings.json`.
- Every `Server/` save hot-swaps every supervised server after a boot test on a spare port (`Server/doc/watch.md`) — still, boot your change on your private port and curl it BEFORE saving into the shared tree: develop in a scratch copy, copy over in one write. The hooks check every `.js` write.
- **Never kill or restart the owner's dev server (port 80), the mastermind's (8123) or the running health watcher, never stop whisper-server, never drive the owner's tabs.** Kill only what you started, by real Windows PID (a supervised server has TWO: the supervisor and its child). Never `git stash`, never `find /`, never commit. Write files with the Write or Edit tool, never a bash heredoc. Do not write the owner's name anywhere.
- Landing `outcome`: one screen — what exists, what you built, the two timings, the three lines the V3 minion needs to draw `ask` controls, what was left and why.
