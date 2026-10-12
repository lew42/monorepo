# assistant-stream — the assistant's reply types itself out on the owner's screen, chunk by chunk, as the model generates it

Load the `minion` skill first. Then this brief. Model: Sonnet.

**Three laws.** Less is more (extend the bridge that exists; one new rpc, one new client module). Clear beats brief by far. Prioritize (first chunk on screen fast; everything else after).

## The owner's words (2026-09-19, through the assistant)

> the speed of the response depends on the streaming generation, right? AI generates things one token at a time, and if you want to see the beginning of the response immediately as it's being created, we need the socket to beam each new word — maybe it's an append-only action, and the value is the next chunk. Then we can get this whole log process to do the screen-write animation: the socket sends one word at a time, the UI appends it one word at a time.

And earlier: the assistant "needs to be snappy … it's kind of like voice mode"; "every owner prompt shows word for word in the log the instant it is submitted, before any answer".

## Why this shape

A reply generated inside a VS Code tab cannot stream to the page — the tab keeps the tokens until the message is complete. But the dev server already runs Claude turns itself: `Server/plugins/Ask.js` spawns `claude -p --output-format stream-json --verbose --model <m>` per browser message, with `--resume` for continuity (`ext/Ask/Ask.js` is the client; `ext/Ask/chat.js` the panel; read all three and `ext/Ask/doc/decisions.md` first). With `--include-partial-messages` that same stream carries text deltas as they are generated. So the fast assistant runs THERE, and the socket forwards each delta.

## Build

1. **Server — deltas over the socket.** In `Server/plugins/Ask.js` (or a small sibling plugin if that keeps `Ask.js` readable — say which and why): a turn may ask for streaming; the spawn adds `--include-partial-messages`; each text delta from the stream is sent to the asking socket at once as an append-only rpc — `ask_chunk {turn, seq, text}` — then `ask_done {turn, text (the whole reply), session_id, ms_to_first_chunk, ms_total}`; tool-use events become one short status chunk ("reading the state…"), never raw JSON. Confirm the partial-message event shape against the installed CLI (`claude --help`, a ten-second scratch run) — do not browse the web. Turns stay bound to their socket/tab as today; a dropped socket kills the child.
2. **The assistant as a headless turn.** A preset the client can name — `assistant`: model Sonnet (`--model sonnet`), the lowest effort setting the CLI offers (find the flag or setting; if there is none, say so), the `assistant` skill's text supplied up front (`--append-system-prompt` with the skill's body, or the first prompt `/assistant` — measure which gives the faster first chunk), `--resume` of the assistant's own headless session between messages so it keeps its small context (store the session id server-side per browser tab, the way Ask does). In this mode the assistant does NOT run `say.mjs heard/say` — the page shows the owner's words and the streamed reply itself; the SERVER does the record-keeping at `ask_done`: appends the owner's words (`author: "owner"`) and the finished reply (`author: "assistant"`) as `card` lines to `public/framework/ai/v/3/board.jsonl`, and relays the owner's words to the mastermind's inbox (reuse `.claude/skills/assistant/say.mjs`'s `run()`/relay logic — import it or spawn it; say which). Write that difference into `.claude/skills/assistant/SKILL.md` as a short "When you are running headless from the dev bar" section — ⚠ a sibling (`prompt-relay`) is editing that file's relay paragraph today: re-read immediately before your edit and keep theirs. The doorbell: test whether a headless turn can `SendMessage` the session named by `say.mjs state`'s `MASTERMIND SESSION`; if it cannot, the inbox line is the only route — say so plainly in the landing, because then the mastermind only sees it at its next cycle.
3. **Client — `ext/Ask/stream.js`**, one small module: `stream({ preset: "assistant", prompt, on_chunk, on_done, on_error })` over the existing dev socket; plus a tiny view helper that appends chunks to an element as they arrive (append-only text nodes — never re-render the element; a caret while streaming; respects reduced motion by simply appending). No dev bar wiring: `dev/DevBar/**` and `public/framework/ai/v/3/**` belong to a sibling (`devbar-chat`) who is building the message box and the joint timeline right now. Instead ship a **demo page** in your task dir (`page.js`): a box, a send button, the `ux/Dictate` mic (`new Dictate({ $input })`), the owner's words appearing at once, the reply typing itself out, and the two numbers under it: milliseconds to first chunk, milliseconds total. Put the three lines the sibling needs to wire it into the dev bar's composer in your landing.
4. **Numbers the owner cares about:** time from send to first visible chunk, over ten runs, for: Sonnet vs Haiku (`claude-haiku-4-5-20251001`), skill as system prompt vs as first message, resumed vs fresh session. One small table on the demo page. Recommend the default by the numbers.

⚠ The owner's live server on port 80 runs pre-supervisor code and has NOT been restarted; nothing in `Server/` reaches it until they do. Build and prove on your own supervised private server. The mastermind's server on 8123 will restart its child whenever you save a `Server/` file — every save must parse and boot.

## Prove

`PORT=8142 node server.js` (background; kill supervisor and child by real Windows PIDs at landing). Headless Playwright with a REAL socket on your demo page: send "what is running right now?" → the first chunk is in the DOM before the turn ends (assert `first_chunk_at < done_at` and that the text grew across at least three observations), the owner/assistant card lines land in a SCRATCH board file and the relay in a SCRATCH ledger (env overrides — never the real `board.jsonl` or the run's `task.jsonl`), a second message resumes the same session, a closed tab kills the child (count `claude` processes before and after). Each headless turn costs real tokens: keep test prompts tiny and the run count to what the table needs.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/assistant-stream/`); `code`, `documentation`, `ui-test`; `finish-task`; `skill-improvement` if a skill misled you.
- **Fence:** `Server/plugins/Ask.js` (or one new sibling plugin + its one registration line in `Server/run.js` — re-read `run.js` first, a sibling added a line today), `public/framework/ext/Ask/stream.js` (new), `public/framework/ext/Ask/doc/**`, `.claude/skills/assistant/SKILL.md` (one new section), `Server/README.md` (one line), your task dir. Not `dev/DevBar/**`, not `public/framework/ai/v/**`, not `dev/Socket/**` (a sibling holds it — if you need a client-side rpc handler registered, find how `ext/Ask/Ask.js` registers its own without editing Socket.js), not `.claude/hooks/**`, not `.claude/settings.json`.
- A hook checks every `.js` write parses and stops you if it does not. **Never kill or restart the owner's dev server (port 80, PID 31028) or the mastermind's (8123), never stop whisper-server (PID 35172), never drive the owner's tabs.** Never `git stash`, never `find /`, never commit. Write files with the Write or Edit tool, never a bash heredoc. Do not write the owner's name anywhere.
- Landing `outcome`: one screen — the first-chunk numbers, the recommended default, whether the headless assistant can ring the mastermind, the three wiring lines for the dev bar, what needs the owner's one restart, what was left and why.

## Addition from the coordinator (mid-task, 2026-09-19)

The owner wants ONE log that "the assistant, the mastermind and any minion can write to …
create or stream a new log item … full stream control" — the stream visible everywhere, not
only in the asking tab. The shared log is `public/framework/ai/v/3/board.jsonl`; the mastermind
already extended `.claude/skills/assistant/say.mjs` with `chunk`, `--as`, `--id`, `--status`
(confirmed on disk before building against it). Format, besides the existing
`{"card": {at, id, author, title, text, status}}`: an append-only streaming line,
`{"chunk": {"at", "id", "text"}}` — text appended to the card with that id.

So in the `assistant` preset the SERVER, besides sending `ask_chunk` rpcs to the asking socket,
writes to the board: at send time one `card` for the owner's words (`author: "owner"`, id
`o-<HHMMSS>`) and one empty `card` for the reply (`author: "assistant"`, id `a-<HHMMSS>`,
status `"working"`); then `chunk` lines for that id, BATCHED (flush every ~150ms or 40
characters, whichever comes first — never one line per token, since the file is tailed to every
open tab); at the end one `card` line for the same id with the full text and status `"done"`.
With that, the dev bar's timeline (a sibling is building it to this exact format) shows the
reply typing itself out with no wiring between this module and theirs — the file is the
interface.

Keep the direct `ask_chunk` rpc for the demo page's lowest-latency path, and measure both:
first chunk via the rpc vs. first chunk via the tailed file.
