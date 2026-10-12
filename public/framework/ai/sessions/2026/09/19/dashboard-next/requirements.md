# dashboard-next — the Now view, the heard-card that becomes the answer, streaming in the message box, and the Chat tab becoming Sessions

Load the `minion` skill first. Then this brief. Model: Sonnet. **You are the ONE minion on the AI dashboard (`ai/v/3/`) and the dev bar until you land.** The mastermind watches your pages headlessly and relays defects; the owner watches them live.

**Three laws.** Less is more. Clear beats brief by far. Prioritize (in the numbered order below — land after 4 if time runs long; 5–7 are the first things to cut).

## Read first (ten minutes)

`public/framework/dev/DevBar/doc/chat/` — the whole record of the task that built what you inherit (`ai/2026-09-19/devbar-chat/`): every owner pass verbatim, every decision, six bugs. The shared model is `public/framework/ai/v/3/timeline.js`; the log's file is `ai/v/3/board.jsonl` (`card` lines merged by `id` — fields `author` owner|assistant|mastermind|<minion slug>, `title`, `text`, `status`, `icon`, `re`, `parent`, `focus`, `links`, `demo`, `code` — and append-only `chunk {id, text}` lines); the tool that writes it is `.claude/skills/assistant/say.mjs` (read its header). Shots of where things stand: `ai/2026-09-19/devbar-chat/shots/`.

## The owner's words (2026-09-19, through the assistant) — each numbered item below quotes its own

## Build, in this order

1. **The Now view.** "A persistent 'current' view on the AI dashboard (maybe a tab at the top): the thing happening now, in full detail, usable when the dev bar is closed. My exact words appear the second I send, as a transcription-style card (designed a bit differently), then get refined into a summary as it is processed. The main view stays refined, not a full persisting log." → a `now` option, FIRST in V3's view switch and the default: the newest owner card in full (their verbatim words, styled as theirs — a transcription look: mono or a quote rule, the mic icon), and directly under it what answers it — every card whose `re` is that owner card's id, plus any card updated since it arrived — each streaming its text live if `chunk` lines are arriving. When a newer owner card lands, the view moves on by itself (unless the owner is interacting with it — then a "new ↓" chip). Nothing here is truncated.
2. **Heard → answer, in place.** "While I am transcribing, a card appears as a transcription card so I know it arrived, then morphs into a summary card as it is processed and refined." In the inbox (timeline view): an owner card that has an answering card (`re:` its id) is shown as ONE item — the answer card's face, with the owner's words one click down in the detail ("you said: …") — instead of two adjacent items; an unanswered owner card shows as the transcription card. ⚠ Owner cards today repeat themselves: `title` is the first 90 characters of `text`, and the preview prints both — print the text once.
3. **Streaming in the dev bar's message box.** `ai/2026-09-19/assistant-stream/` landed `ext/Ask/stream.js`: `stream({ preset: "assistant", prompt, on_chunk, on_done })` + `typewriter(el)`; the SERVER writes the owner card, the reply card and batched `chunk` lines to `board.jsonl` and relays to the mastermind's inbox. Wire the dev bar's composer (`dev/DevBar/chat.js` / wherever the composer now lives) to it — the three lines are in that task's landing (`task.jsonl` outcome). With this the owner can talk to the assistant from the page (the `ux/Dictate` mic is already on the composer) and watch the reply type itself out in the log and in the Now view. Put the composer at the bottom of the Now view too. Prove: send "what is running?" from the composer on your private server against SCRATCH board and ledger files (env overrides exist: `LEDGER_ROOT`; read `Server/plugins/Assistant.js` for the board override) — first visible chunk time logged.
4. **The Chat tab becomes Sessions, and is not the default.** The owner: "Why are there both a Chat tab and a Page log tab, when they look like the same thing? … The dropdown lists many sessions all dated September 19th; it gives no useful information. … One session's text is 'Reply with just the word one'." Decision (the mastermind's, recorded): the mastermind log is the dev bar's default; the `chat` tab is renamed `sessions` and is for HISTORY only — past sessions labelled by their first real words and start time (not a date alone), headless/test sessions hidden by default (a session whose first prompt is under ~40 characters or that has a single prompt and no tool use — find a better signal in the index if there is one; a "show test runs" toggle), a session's minions under it (what each was told, what it reported). The live conversation view inside it goes — the log is the live view.
5. **The health readout in the dev bar head** — `public/framework/ai/health/devbar.js` is built and unwired (its wiring line is in `public/framework/ai/health/doc/decisions.md`); wire it beside the reload-hold readout. And give `/framework/ai/health/` a way in (a link from the dev bar readout is enough).
6. **Grid view polish** (only if 1–5 are proven): the card carrying the newest `focus: true` is the biggest for ~10 minutes; an icon on a big card is much bigger, a plain info-type icon stays small; cards in one row share a height; no random widths (the owner saw some).
7. **`.card`** — a sibling task (`ai/2026-09-19/card-word/`) is adding a `.card` word to framework.css (padded by definition). If it has landed when you reach this, move V3's cards and the log's cards onto it and delete their hand-written ground/border/padding; if not, leave the `var(--gap)` stopgap and say so.

## Prove

Private supervised server `PORT=8146 node server.js` (kill supervisor and child by real Windows PIDs at landing). Headless, REAL socket, at 400 / 1920 / 3440: the Now view follows a newly appended owner card and its answer (append to a SCRATCH copy of the board — never the real `board.jsonl`); the heard→answer merge; a streamed reply growing in both views; the sessions list with test runs hidden; zero page errors on `/framework/ai/v/3/`, `/framework/ai/v/3/<id>/`, and any page with the dev bar open. Take the reload hold around every batch (`node Server/hold.mjs on "dashboard-next — <what>"` … `off`) and load the page headless BEFORE releasing. Then look at your shots as a stranger and fix what looks off.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/dashboard-next/`); `code`, `css`, `layout` (suggestions; the shot is the verdict), `ui-test`, `documentation`; `finish-task`; `skill-improvement` if a skill misled you.
- **Fence:** `public/framework/ai/v/3/**` (not `board.jsonl` itself), `public/framework/dev/DevBar/**`, `public/framework/ext/Ask/doc/**` + `readme.md` (mention `stream.js`), `public/framework/styles/css-scopes.txt` (re-read before the edit), `Server/plugins/AILogs.js` only if the sessions index needs a field, your task dir. Not `framework.css` (card-word holds it), not `Server/plugins/Ask.js` / `Assistant.js` unless a real bug blocks item 3 (say so), not `core/**`, not `.claude/**`.
- Every `.js` write is syntax-checked by a hook, and the page-health hook tells you at your next write if you broke a page — fix at once. Never put a backtick inside a comment inside a `css()` template. In a scrolling flex column every child needs `flex: 0 0 auto` (it has bitten this surface three times today).
- **Never kill or restart the owner's dev server (port 80), the mastermind's (8123) or the running health watcher, never stop whisper-server, never drive the owner's tabs.** Never `git stash`, never `find /`, never commit. Write files with the Write or Edit tool, never a bash heredoc. Do not write the owner's name anywhere.
- Post to the owner's log — SHORT (about five words, then two sentences) — when you start, whenever something they can go and see now exists, and when you land: `node .claude/skills/assistant/say.mjs say "<title>" "<two sentences>" --as dashboard-next --id dashboard-next --status working --icon dashboard --parent v3-notes`.
- Landing `outcome`: one screen — what the owner can now do, in the numbered order; first-chunk time from the composer; what was cut and why.

## For the next V3 task (relayed mid-task, 2026-09-19 — not this task's, unless one falls out for free)

The owner, watching V3 live: "write no CSS unless needed" — applied at once (deleted
`.v3-detail > p { margin: 0; line-height: 1.55; }` from `v3.css`, an unused rule nobody had
proven a shot needed). The same standard held for everything added after this note: no rule
without a screenshot showing the gap it closes. Four features named for whoever picks up V3
next, not built here:

- **The spatial timeline stays put as things arrive.** A new item lands at the TOP without
  moving the owner's scroll or selection (the inbox already does this — keep it true in the
  Now view too); a "New item" button appears when it's not followed; SPACEBAR jumps to the
  newest item and selects it (StarCraft-style "jump to last alert").
- **Yes/no prompts on a card.** A card line carrying `ask: ["yes", "no"]` renders buttons;
  pressing one appends `{"card": {"id": <same id>, "answer": "yes", "author": "owner"}}`
  through the dev socket's append RPC, so the dashboard can prompt the owner directly.
- **A toolbar per column**, to configure that column's own view.
- **Resurfacing.** A card referenced again rises back up; a card can embed a small preview
  of another card via `see: "<card-id>"`.
- **The dev bar's own log cards (`dev/DevBar/devbar.css`'s `.dev-says-card`) still hand-roll
  their own ground/padding/border-radius** — not a clean swap to `card size-small`: they paint
  `var(--wash)` (not `.card`'s `var(--surface)`), carry no border on purpose (a compact, dense
  log row, not a roomy card), use `--pad` not `--pad-card`, and every author gets its OWN
  background tint (`--card-edge`'s reserved 3px doesn't fit that shape). Left alone this task —
  `devbar.css` loads on every page site-wide, and a bad swap there is the exact class of mistake
  this task already made once today (see the task log, `ai/2026-09-19/dashboard-next/`).
