# Handover — for a fresh mastermind (written 2026-09-19 ~17:00)

**Then read `asks.md` beside this file — everything the owner asked for in this run, with status (done / in flight / open), newest day first. The OPEN and IN FLIGHT items of 2026-09-19 are what they are waiting on.** It is generated from the ledger by `asks-md.py` (beside it): regenerate, never edit.

Read this, then `.claude/skills/mastermind/SKILL.md`. Do NOT read the run's `task.jsonl` end to end (650+ long lines): run `node .claude/skills/every-prompt/say.mjs state` for the live state, and grep the ledger by `"id": "<ask-id>"` when you need one item's history.

## How the owner works now

They dictate by voice to an **assistant** tab (skill `every-prompt`, formerly `assistant`; Sonnet), and watch two live surfaces on the site: the **dev bar's mastermind log** and the **AI dashboard `/framework/ai/v/3/`**. Both read ONE append-only file, `public/framework/ai/v/3/board.jsonl`, written with `node .claude/skills/every-prompt/say.mjs` (`say`, `heard`, `chunk`; flags `--as --id --status --icon --re --parent --focus`). The assistant echoes their words, drafts the dashboard card, and rings the mastermind by `SendMessage` (at most every three minutes unless urgent); their verbatim words are `chat` lines (`from: "owner"`) in this run's `task.jsonl` — the inbox. **Answer on the board, in cards: an icon, about five words, two or three short sentences.** Write your session name into the ledger so the assistant can ring you: `{"assign": {"mastermind_session": "<name from ListAgents>"}}`.

## Rules adopted today (all in the mastermind skill)

Post first, work second · cards, not paragraphs · keep the log fresh (a state card on every change) · the mastermind writes no code and never edits the screen the owner is reading — a one-line change is done at once by the page's minion, and ANNOUNCED · one page, one minion, in sequence; watch its page for it (headless shot + `ai/health/<date>.jsonl`) · nothing waits on the owner unless dangerous, destructive, credentials, or their own config asked for through a relay · wake a landed agent (`SendMessage`) instead of respawning inside the cache hour · audit a mistake when it reaches the owner (skill `auditor`; grade each audit in `auditor/improvements.md`) · budget: used% ≤ elapsed%, aim well under; today the WEEK hit the line (40/40 at 16:35) — small Sonnet tasks, one at a time.

## Safety nets built today (trust them; brief to them)

`.claude/hooks/syntax-guard.mjs` (a `.js` write that does not parse stops the agent) · `.claude/hooks/health-guard.mjs` + `Server/health.mjs` (a hidden browser checks changed pages; the agent that broke one is told at its next write; run it: `HEALTH_BASE=http://localhost:8123 node Server/health.mjs`) · `server.js` supervisor with a boot test on a spare port (a bad `Server/` edit cannot take a live server down; `.server-boot-failed.json` says why) · the reload hold `node Server/hold.mjs on|off` (in CLAUDE.md) · the mastermind's own server: `PORT=8123 node server.js`. The owner's server is port 80 — never touch it.

## In flight at handover (17:20) — the owner said: spawn NO more until the new mastermind is running

1. (landed 17:27) `ai/2026-09-19/dashboard-next/` — V3's Now view, heard→answer as one row, the streaming composer on the page and in the dev bar, chat tab → sessions, V3 on `.card`. Read its landing line and the "For the next V3 task" list in its requirements.md. **V3 + the dev bar are FREE: your first dispatch is `v3-timeline` (brief ready).** Cut and waiting: the health readout wiring (two lines, in `ai/health/devbar.js`'s doc comment), grid polish, the dev bar log's cards onto `.card`.
2. (landed 17:35) `ai/2026-09-19/card-replies/` — cards with buttons WORK end to end: `say.mjs --ask "yes,no"` (or `"Label|note;Label|note"`), `--ask-to <session>` defaulting to the ledger's `mastermind_session`; `Server/plugins/CardAnswer.js` records the answer, writes the inbox line and rings the session (about 10 s). `ask_controls()` in its `ask.js` is three lines to lift into V3 — item 4 of the `v3-timeline` brief. USE IT: ask the owner yes/no questions as cards.

**Nothing is in flight.** Their completion notices go to the OLD session (the harness notifies the session that spawned them). New mastermind: read each task's `task.jsonl` for `landed_at` and its `outcome` instead — `node .claude/skills/every-prompt/say.mjs state` lists WORKING and LANDED.

Also seen at 17:27: the fast assistant spawned a "master assistant" agent of its own on Fable. Decide whether that is wanted (the decision recorded was Opus for the master tier) and make sure assistants never spawn builders.

## Your first five minutes (the assistant's relay follows you automatically)

1. `ListAgents` → your own session name is on the first line.
2. Append to this run's ledger (`public/framework/ai/2026-09-17/mastermind-layout-browser/task.jsonl`): `{"assign": {"mastermind_session": "<your name>", "topics": ["everything"]}}` — the assistant reads that name from `say.mjs state` before every ring, so from that line on its doorbell and the card-answer rings reach YOU. Nothing else has to be switched.
3. Post a card so the owner sees the hand-over happened: `node .claude/skills/every-prompt/say.mjs say "New mastermind: here" "<two sentences>" --as mastermind --id process-redesign --status done --icon restart_alt --focus`.
4. Keep using THIS run ledger (do not open a new run task): it is the inbox the assistant writes to.
5. Start your own server and watcher if they are not answering: `PORT=8123 node server.js` and `HEALTH_BASE=http://localhost:8123 node Server/health.mjs` (background). They belonged to the old session and die with it.

## Queue, in order (briefs marked ✔ are written)

1. ✔ `ai/2026-09-19/v3-timeline/requirements.md` — V3 full bleed, even columns, the spatial timeline with hour and minute lines, times outside the cards, Spacebar jump, yes/no prompt cards (`say.mjs --ask`), the usage footer. Dispatch the moment `dashboard-next` lands (one page, one minion). A candidate for the first three-version compare-and-pick.
2. `servers-registry` — decided by the Servex study (`ai/2026-09-19/servex-study/`): each `server.js` writes `{name, port, pid, started_at}` to a git-ignored file when it listens and removes it on exit; `node Server/servers.mjs` lists, `stop <port>` stops; a dev bar panel later. Build it in a worktree (it touches `Server/`).
2a. `health-alarm` — the page-health watcher logged today's second site-wide blank 84 times and nobody was listening: when a CANARY page fails, it must reach someone out of band (the assistant tab / a cross-session message / a terminal bell — not a card on a page that is blank). Small.
2aa. `timing-audit` — stamp every hop (prompt arrival, echo, card, relay, mastermind pickup, screen) and draw it as lanes on the V3 timeline; the owner asked for it on 2026-09-19 17:06.
2b. `blunder-fixes` — the critic's six findings: `/framework/ai/2026-09-19/blunder-critic/`.
3. `change-shots` — the owner's proposal, posted as card `change-shots`: the health watcher saves a picture per change and the hook hands it to the editing agent; a change record per landed task with before/after and undo; a `land` command shared with worktree landings. Two small tasks.
4. `icon-frame-sitewide` (decided: own task with a before/after sweep) · `sidebar-designs` · `fps-meter` + a real column-drag trace · move V3 and log cards onto `.card` when it lands · finish-task skill: a landing carries one picture of the WHOLE thing and names the skills loaded (audit proposals 1 and 4).

5. After `.card` landed (`ai/2026-09-19/card-word/`): `ui/card/page.js` and `styles/readme.md` still teach "there is no card word"; `core/Page`'s own tree rows measure 49–69 px (the lint found it — the sidebar's blunder again); migrate hand-rolled cards to `.card` a surface at a time (180 exist).

5b. `framework.css`'s `.card.selected` is an inset dark ring; the owner rejected it on V3 ("no black border; less white fill that lightens on select") — make selection a ground change (unselected a step off white, selected white) in the word itself. And the direction `dashboard-first` (asks.md): the owner wants to LIVE in the dashboard — answers, designs and questions as interactive, revisable cards, not chat text; they read none of the chat.
6. Small defects found late: `.claude/hooks/health-guard.mjs` reports STALE findings (it told the mastermind "you broke a page 825 s ago" about the already-fixed 17:01 blank, once per old error line) — it should skip an error that has a later `ok` for the same url or is older than ~5 minutes. Card text is split into paragraphs only: lines starting `1. ` should render as a real ordered list in `ai/v/3/timeline.js` (the owner asked; they also want nicer ordered-list styles later) — and ordered steps in any doc or card are written as ordered lists.

## Waiting on the owner (the only real ones)

Tell the assistant directly to switch on the prompt hook (`.claude/hooks/readme.md`; the mastermind will not do it on a relayed message) · one hand restart of `node server.js` to pick up the boot-testing supervisor (safe: the mastermind's own server runs it) · Cloudflare login + `wrangler d1 create` · GitHub and Google OAuth apps · commit `michael/dev` now and then (it makes worktrees simple) — the mastermind never commits.

## Where things are

Today's tasks: `public/framework/ai/2026-09-19/*/` (each has `requirements.md`, `task.jsonl`, most a one-screen `page.js`). Reports worth a look: `mistake-audit/`, `incident-site-down/`, `padding-audit/`, `worktree-study/`, `blunder-critic/`, `sidebar-repair/`. Memory: `reload-on-read-and-ai-v2-2026-09-19.md`.
