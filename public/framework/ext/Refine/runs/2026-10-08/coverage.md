# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | [sessions/2026/10/08/3f5a5fec-dbf0-4a4b-8573-560f281a0be3/session-class/requirements.md] | ask #15 |
| S2 | Session class: exact cost per session, cached. | ask #15 |
| S3 | Owner (2026-10-08, dictated). | ask #15 (thin) |
| S4 | Build on `public/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/` (`findings.md`, `plan.md` items 4–7 and 13, `sessions/doc/live/realtime.md`). | ask #15 |
| S5 | Do not redo its investigation. | ask #15 |
| S6 | Budget **$6**, Sonnet 5.5, medium effort. | ask #16 |
| S7 | Batch reads; scripts read raw data; chat = one sentence. | ask #1 |
| S8 | What the owner wants. | ask #17 (thin) |
| S9 | Account for every message and every tool call that accrues token cost, in every session (Claude and OpenRouter, kept separate — different data, accounting and rendering; Claude = "Claude $total", OpenRouter = "$total"). | ask #17 |
| S10 | First check whether the Claude Agent SDK already does its own real-time accounting (result messages, per-message usage events). | ask #14 |
| S11 | If it does, lean on it; otherwise, use our own script. | ask #14 |
| S12 | A `Session` class, usable on the server AND the client (one class, native ESM, no build). | ask #18 |
| S13 | Instantiate it with a session id/file and it loads the whole raw session file in code, never into an LLM, computes costs, and a breakdown (tools used, time running, cache read/write, per-model), plus subagent rollups into the parent. | ask #19 |
| S14 | It renders a preview row for the data grid and a detailed view (click-through) on the AI Sessions page (`public/framework/ai/sessions/`), as the two display modes of the same class. | ask #24 |
| S15 | Never reprocess a huge raw file on load. | ask #21 |
| S16 | Process it once and cache the result in a per-session `session.jsonl`. | ask #21 |
| S17 | After that, read only new lines, skipping any message id already counted. | ask #22 |
| S18 | The page loads the small cached data, never the raw file. | ask #21 |
| S19 | The site is already slow on mobile, so measure the bytes and requests the Sessions page loads before and after, and report both. | ask #25 |
| S20 | Per-session folder `public/framework/ai/sessions/<slug>/`: `session.jsonl` (usage, costs) sits beside `page.jsonl` (page data). | ask #26 |
| S21 | Agents never hand-write JSONL; a Servex tool writes each line and stamps time and author. | ask #42 |
| S22 | Streaming is owned by task `2026-10-08/live-not-polling`. | ask #23 |
| S23 | Use its stream (read its `findings.md`); don't build another. | ask #23 |
| S24 | Deliverables (numbered). | ask #27 (thin) |
| S25 | `findings.md`: does the SDK account in real time (evidence), and which source is the truth per provider. | ask #27 |
| S26 | `Session.js` (class file named and capitalised to match, per the CLAUDE.md traps) goes in the right module folder per the readme chain, for server and client use, with a node test that loads a real session file and checks its total against `Server/session-cost.mjs` / the reconcile result (gap reported, target 0). | ask #28 |
| S27 | The Sessions page's preview row and detail view are backed by it; check at the four widths; go through the merge gate. | ask #60 |
| S28 | A node script `Server/session-summary.mjs <session-id\|file>` prints the same summary (so agents ask a script, not read a file). | ask #29 |
| S29 | Docs: a `sessions/doc/` note (shape of `session.jsonl`, loading, saving, timing), linked from the readme. | ask #30 |
| S30 | Rules. | ask #2 |
| S31 | Worktree and merge gate for site files; commit with attribution; no loose files; land with `finish-task`. | ask #2 |
| S32 | Anything needing the owner goes on a `Note:` card on the AI board, plus one line in findings.md. | ask #5 |
| S33 | Addendum (owner, 2026-10-08, later) — tags and alerts on sessions. | ask #41 |
| S34 | Sessions can carry **tags** (icon-item references to a class, page, system or file) and **alerts** (needs attention, with priority). | ask #41 |
| S35 | Both are appended as lines to `session.jsonl` by a **log tool** that any minion can call for any session (stamped time and author, outside the session's own prompt). | ask #42 |
| S36 | The Sessions table filters and sorts by tag and has a "needs attention" filter, prioritized. | ask #44 |
| S37 | The task-audit mastermind (`2026-10-08/task-audit`) will be the first writer: agree the line shapes with its `requirements.md` addendum; you own the tool and the table. | ask #43 |
| S38 | Never trigger an SDK resume to read cost; files only. | ask #20 |
| S39 | Addendum 8 (owner, 2026-10-08, after using the Sessions tab) — one store, real names, compact grid. | ask #37 |
| S40 | Storage and links (answer in findings.md first, then fix). | ask #32 |
| S41 | Session cards link to two different places: `framework/ai/2026/10/07/session-<short-uuid>/` (date tree, opens in the Inbox view, little info, badly laid out) and `framework/ai/sessions/mastermind-servex-10` (opens as a right sidebar column, which is nice). | ask #32 |
| S42 | There are three stores: UUID folders (the cache), named folders under `ai/sessions/`, and date-tree `session-<id>` folders (VS Code tabs live here). | ask #32 |
| S43 | Pick ONE store (the date tree, `ai/YYYY/MM/DD/`, is the owner's preference) and write a non-destructive conversion script (move/rename, no rewrite; old links resolve via a resolver). | ask #33 |
| S44 | Name the alternative. | ask #34 |
| S45 | "4,000 sessions": how is that computed? | ask #8 |
| S46 | If the client loads all of them to count, that is wrong: serve counts and filters from the session index. | ask #8 |
| S47 | State flashes "running" on some cards when it isn't. | ask #9 |
| S48 | Find out why, and make state true (derived from the registry/ledger by code). | ask #9 |
| S49 | Names: many cards are named "monorepo" (the repo name, not a session name), so the owner cannot match a card to what they know. | ask #38 |
| S50 | Derive a useful name (task/card title, the first real prompt, or the agent id), never the repo name. | ask #38 |
| S51 | Going forward, every session and task gets a proper name. | ask #39 |
| S52 | Child sessions nest by path: `parent/child`, sub-sub-sessions `parent/child/grandchild`, literally subdirectories of the parent's directory (not a `--` suffix). | ask #40 |
| S53 | The grid shows nested rows under their parent, collapsed by default, with the rolled-up cost. | ask #50 |
| S54 | Grid and layout. | ask #45 |
| S55 | Replace the big status tiles (5-hour and weekly numbers) with the progress bars with the pace marker that the Dashboard already has (reuse that component; one of everything). | ask #45 |
| S56 | Cut the wasted space above the grid. | ask #46 |
| S57 | The list of sessions should be as compact as possible. | ask #46 |
| S58 | Add a quick "in flight / now / active" filter next to the existing checkboxes. | ask #47 |
| S59 | Add sort toggles (recency, cost, model, ...) to flip between chronological and cost views. | ask #48 |
| S60 | Move the state icon to the first column (as important as the name). | ask #49 |
| S61 | Don't over-build yet. | ask #53 |
| S62 | Clicking through should open the same detail view whichever way you arrive (one route per session). | ask #56 |
| S63 | Sub-pages inside the Sessions tab: the grid fills the tab, so find a way to host sub-pages (a readme, a decisions/notes page) within the tab. | ask #51 |
| S64 | Create a readme and a decisions doc for the Sessions system showing the owner's asks and architectural decisions, priority-ordered with the top priorities first so they are always followed, and make them reachable from the tab (a visible link). | ask #52 |
| S65 | Everything you create must be linked from the site (see CLAUDE.md "Everything is linked"). | ask #6 |
| S66 | Addendum 9 (owner, 2026-10-08, evening) — one open mode, one location, a master-detail layout. | ask #54 |
| S67 | After the IN FLIGHT strip, which stays top priority. | ask #54 |
| S68 | Every session card opens in the right-hand column (the way `mastermind-servex-10` does, from `ai/sessions/mastermind-servex-10`), and never jumps to the Inbox view (the `ai/2026/10/07/session-<id>` links do that: stop it). | ask #55 |
| S69 | One open mode, one route per session, whatever its storage. | ask #56 |
| S70 | Location: many sessions are stored directly in `framework/ai/` (46 hyphen-dated dirs like `2026-10-08/`, plus `ai/2026/MM/DD/`). | ask #35 |
| S71 | Move the session raw data under `ai/sessions/YYYY/MM/DD/` (so `ai/sessions/2026/...`; the new day-partitioned folders you made are the right shape), named, with child sessions saved inside the parent session's directory (`parent/child/...`): hierarchical. | ask #35 |
| S72 | First, find and document every pattern where sessions live today, and where (a table in `sessions/doc/`: pattern, example path, count, how it is read). | ask #31 |
| S73 | Then merge them into the one system with a script (dry-run, `git mv`, manifest of old to new, old paths resolve; no AI rewriting), and make every one of them render the same detail view. | ask #36 |
| S74 | Master-detail, like the Inbox: the grid is the responsive navigator for the detail pane. | ask #57 |
| S75 | On wide screens, use a default 50/50 split (resizable; the detail must FILL its side, with no fixed width: right now it stops short after resizing). | ask #58 |
| S76 | Make the grid responsive so that when narrowed it changes from the 7-column table into compact inbox-style cards (fields wrapped, not tall), and clicking another session swaps the detail. | ask #59 |
| S77 | Reuse the existing master-detail/columns page mechanism and the Inbox's list; one of everything. | ask #57 |
| S78 | Say which template renders a page: show somewhere unobtrusive (a small label or the page header) which template or layout a page uses and where it lives, so the owner knows what they are looking at; keep a short list of templates and their locations in the docs. | ask #7 |
| S79 | Commit after every working step (not just at the end): small commits give a versioned log and no lost progress. | ask #3 |
| S80 | Run the full cycle (worktree, diff review, merge) often. | ask #4 |
| S81 | [sessions/2026/10/08/ai-system-docs-fa3e829d/ai-system-docs/requirements.md] | ask #66 |
| S82 | AI system documentation — show the structure as classes. | ask #66 |
| S83 | Owner (2026-10-08, after browsing `/framework/ai/` and `/framework/ai/system/`). | ask #77 |
| S84 | You are a system mastermind: a fresh Sonnet 5.5 pointed at a directory, not a resumed session. | ask #63 |
| S85 | Read `CLAUDE.md`, then the readme chain down to `public/framework/ai/` and `Servex/`. | ask #63 |
| S86 | Budget $5 total; run `node Server/usage-now.mjs` before each spawn; minions are Haiku 5.5 (Sonnet only for UI and OO code). | ask #64 |
| S87 | Docs-first: additive edits and proposals; no API changes, no moves, nothing destructive. | ask #65 |
| S88 | One-sentence chat replies. | ask #1 |
| S89 | What the owner saw and wants. | ask #77 |
| S90 | The AI system page (`/framework/ai/system/`) is wide, and its words explain things the reader already knows (its first sentence adds nothing); it lists assistants, masterminds, minions, agents and roles without showing anything tangible. | ask #77 |
| S91 | Some linked pages (e.g. `AI/minions`) look stale. | ask #72 |
| S92 | The mastermind-vs-minion line is not important and must not be treated as a hard boundary (CLAUDE.md "No hard fences"). | ask #72 |
| S93 | Show structure, not prose. | ask #68 |
| S94 | The framework is object-oriented: where a thing is a class, show it as a class card (icon, class name, and the core API, with the most important properties and methods picked by judgement; no weighting system), and show live instances where they exist (a running Servex and the agents it holds; Servex's classes such as Pool, Usage, Agents, Dispatcher, Heartbeat). | ask #68 |
| S95 | Find the existing mechanism for class docs (the owner asked recently for a class-rendering template; search `ext/Doc` and the task and ask logs) and reuse or extend it; do not build a second. | ask #67 |
| S96 | Systems and where they live must be clear at a glance: Servex (the always-on process), the Agent SDK, OpenRouter and local models, sessions, models (`/framework/ai/models`), the dashboard, the inbox, and tasks. | ask #70 |
| S97 | Include a short **SDK** section or page: how Servex spawns agents through the Agent SDK `query()`, how tools reach it via in-process MCP, how session files are written, and `sdk-ts` vs `claude-vscode` entrypoints. | ask #71 |
| S98 | Every module readme is its memory: a short index (under 100 lines), its essence and guiding principles, links to `doc/`, and an `architecture.md`-style doc of decisions that links the original prompts and refined prompts and summarises the idea. | ask #92 |
| S99 | Create or refresh these for `ai/`, `ai/sessions/` (owned by minion-session-class: coordinate, don't fight), and the Servex docs. | ask #93 |
| S100 | Deliverables (numbered). | ask #78 (thin) |
| S101 | A restructured `/framework/ai/system/` page that is mostly cards of classes and live instances with minimal words; four-width check; merge gate (worktree, commit, diff review by you, smoke test, merge). | ask #78 |
| S102 | Readmes and `architecture.md` for `ai/` (and `Servex/` if its docs lack it), each linking the others; stale pages listed in `findings.md` and fixed where obviously safe. | ask #74 |
| S103 | `findings.md`: what you changed, what is stale or missing, which AI-system pieces are NOT yet classes and should be (a short list, no refactor now), and any `Note:` for the owner. | ask #76 |
| S104 | Reuse the other agents' outputs (read their reports, don't redo them): `2026-10-07/docs-vs-code-audit/report.md`, `2026-10-08/task-audit/`, `2026-10-07/token-accounting/`. | ask #74 |
| S105 | Commit with attribution; no loose files; land with `finish-task`. | ask #3 |
| S106 | Addendum (owner, 2026-10-08, later) — you are the SYSTEM ARCHITECTURE mastermind. | ask #95 |
| S107 | Your mandate is wider than the AI system page. | ask #95 |
| S108 | You keep an eye on all the systems and keep them tuned. | ask #95 |
| S109 | Sonnet 5.5 and Haiku 5.5 minions, fanned out in small inlined batches; token cost stays low. | ask #98 |
| S110 | Locate the major systems (first deliverable, `systems-map.md`, one short table linked from `ai/readme.md`): the AI system (Servex, SDK, sessions, models, dashboard, inbox, log, now card), the page system (`core/Page`, JSONL streaming and tail, routing), transcription (Whisper, Dictate, Chat, Refine), the skill system, `CLAUDE.md` and the system prompts agents receive (Servex `opening` and preamble), and the Servex agent system itself: where each lives, who owns its docs, and how fresh they are. | ask #100 |
| S111 | Study and tune the skill system and the system prompts: size (tokens per agent preamble), duplicates, contradictions, stale rules, and skills that cost context for little value. | ask #104 |
| S112 | Report findings and propose changes; make only obviously-correct, additive fixes. | ask #105 |
| S113 | Major architecture changes, or anything that could break things, need a clear reason and approval from you after reading the diff; fix what is clearly broken. | ask #106 |
| S114 | Coordinate the running masterminds and tasks (`mastermind-task-audit`, `minion-session-class`, `minion-live-not-polling`, `minion-cache-ttl-and-plan`): you may message them (`send_to_agent`) to share findings, avoid overlap and unblock them; they may message you. | ask #107 |
| S115 | If one is blocked, find a way around it. | ask #107 |
| S116 | Readmes up to date and clear first across these systems (short indexes), then the pages that show structure. | ask #101 |
| S117 | Better pages that show structure and accounting come after the readmes, and only as pace allows. | ask #101 |
| S118 | Queued, do NOT start yet (pace; the owner wants to avoid rushing): an overview of the AI dashboard pages: the Now card (messages have no timestamps; is it stale?), the Log page (should be a real-time stream of every event in the system as it happens), and the Inbox and Dashboard pages. | ask #108 |
| S119 | Write what you already know about them into `findings.md` and the proposed order; start when `node Server/usage-now.mjs` shows we are comfortably under pace and the in-flight tasks have landed. | ask #97 |
| S120 | Addendum 2 (owner, 2026-10-08, later) — the iceberg index, accounting first. | ask #87 |
| S121 | Make the root `readme.md` and `public/framework/ai/readme.md` a really solid index of every system: Servex, the dev server, the MCP servers (servex, site, figma...), models (`/framework/ai/models`, Anthropic, OpenRouter, local), the VS Code sidebar tabs, the browser voice agents, sessions, token and cost accounting (list it first; accounting before the rest), transcription (Whisper, Dictate, Chat, Refine), the page system, skills, and the dashboard, log and inbox. | ask #87 |
| S122 | One line each (what it is, when to load it) plus a link; no explanations. | ask #87 |
| S123 | Details go in each system's own readme, which indexes ITS children the same way, recursively (the iceberg rule is now in CLAUDE.md). | ask #88 |
| S124 | Keep each readme under about 100 lines; verify claims against code with a cheap check. | ask #89 |
| S125 | Addendum 3 (owner, 2026-10-08, later). | ask #90 (thin) |
| S126 | Name things that deserve a name; each gets a page that documents what it is and what it means (its readme links to it, and the page loads the readme by default; markdown renders at `<dir>/md/<file>/`, see `core/Page/doc/markdown.md`; readmes keep plain `*.md` file links, and `Page.class.js` rewrites them for the browser, now in CLAUDE.md). | ask #90 |
| S127 | The `framework/ai` System tab is a class architecture view: which classes exist and how they fit. | ask #73 |
| S128 | Make a Servex class card focused on the AI system (tools/MCP, agents, sessions, spawning, pool, usage, dispatcher), not its self-monitoring, restart or server-list side. | ask #69 |
| S129 | `ai/readme.md` must reference everything that influences the AI systems. | ask #91 |
| S130 | Add a short evolution log (`ai/doc/meta/history.md`): main events only (context-window limits, the OpenRouter trial, voice dictation, the usage wall, the Sonnet/Haiku switch, token-accounting work), each a line with the problem, the solution and a deep link to the session or task; do not copy content. | ask #75 |
| S131 | Inbox: document it properly (where cards are saved, how they are created (MCP tool or manual), and how the dashboard, sessions tab and log read them). | ask #61 |
| S132 | The inbox should work like the session system: wrap inbox cards in a session context card (session icon and name) so the owner learns which top-level sessions are running, can drill into them, and see cost. | ask #62 |
| S133 | Addendum (owner, 2026-10-08, latest) — turn findings into a prioritized plan of action. | ask #99 |
| S134 | Audits are not the end: produce a prioritized plan of action (`plan.md` in your task dir, one screen, linked from your card). | ask #99 |
| S135 | Group loose ends by core system (streaming/JSONL, core page system, sessions, transcription/refinement, AI system/Servex), and where one system has many loose ends, say how to tune that whole system up. | ask #102 |
| S136 | Order by value over cost, quick and easy first. | ask #103 |
| S137 | Haiku minions never do major coding, and you (a mastermind managing Haiku) must not be tied up by code. | ask #109 |
| S138 | For bite-sized, clearly-scoped code tasks that do not step on any running agent's files, spawn a Sonnet 5.5 coder (`spawn_agent`, role minion, model claude-sonnet-5-5, `parent` = you, a task dir with a short brief, in a worktree whenever possible, merging only after you read the diff). | ask #111 |
| S139 | A Sonnet coder may itself act as a mastermind and spawn Haiku minions for cheap searching (finding references, scanning files) with simple, verifiable outcomes. | ask #112 |
| S140 | Before spawning code work, check who owns those files now (`mastermind-ai-system-docs`, `minion-session-class`). | ask #110 |
| S141 | Avoid overlap; message the owner agent instead. | ask #110 |
| S142 | Run `node Server/usage-now.mjs` first; over pace means queue, not spawn. | ask #96 |
| S143 | Keep a short list of what you spawned and why in `spawns.jsonl` (model, scope, expected cost, outcome). | ask #113 |
| S144 | Addendum 4 (owner, 2026-10-08, latest) — the per-module `ai/` subdirectories, and the System page layout. | ask #11 |
| S145 | `<module>/ai/` folders (e.g. `ext/Session/ai`, `ux/Dictate/ai`, `ui/avatar/ai`) hold a log of events about that module (voice session started, task opened), per-page voice-session transcripts (`v-<id>` files plus `.summary.json`), and dated sub-folders. | ask #11 |
| S146 | The owner does not remember what the system automates here or where it is documented. | ask #12 |
| S147 | Document it in `framework/ai` (what writes them, when, why, how to read them, and whether they should be committed) and link it from the AI System page. | ask #13 |
| S148 | Report whether it is already documented anywhere (my quick grep found no doc in `Servex/doc`, the AI docs, or the Dictate or Session readmes). | ask #10 |
| S149 | `/framework/ai/system/` layout: the top must be jam-packed with the most important information above the fold; there is wasted space. | ask #79 |
| S150 | Prefer grids that fill the width. | ask #80 |
| S151 | Don't put a paragraph between a section heading and its cards. | ask #81 |
| S152 | Group sections visibly (a border or panel around each, so it is clear the Servex heading wraps its whole section). | ask #82 |
| S153 | Check why the section is titled "Servex" when its cards are classes (agents etc.): if the cards are classes within Servex, say so in one line; otherwise regroup. | ask #83 |
| S154 | Include a link to the `ai/` subdirectory system. | ask #84 |
| S155 | Addendum 5 (owner, 2026-10-08, latest) — the readme and documentation system status check. | ask #84 |
| S156 | Link the readme system (`/framework/ai/readmes/`) from `/framework/ai/system/`; the owner could not find it. | ask #85 |
| S157 | Weight the systems on that page: the readme and documentation system is one of the most important, so it sits high. | ask #85 |
| S158 | Concept cards: don't hide a large body of data inside an expandable area; show the important part openly. | ask #86 |
| S159 | Status check of the whole documentation system, as it has several overlapping locations: the `documentation` skill, `ai/readmes/`, Servex's `readme_chain` code (`Servex/agents/`; how does it work, does it work, what does it inject into an agent), and `CLAUDE.md`'s readme rules. | ask #94 |
| S160 | Report what is true vs what the pages claim; make the skill reference the readmes syst | ask #94 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #1 | new words | "standing" — not in the transcript at all |
| #2 | new words | "standing" — not in the transcript at all |
| #3 | new words | "standing", "leave", "s105" — not in the transcript at all |
| #4 | new words | "standing" — not in the transcript at all |
| #5 | new words | "standing", "goes" — not in the transcript at all |
| #6 | new words | "standing" — not in the transcript at all |
| #8 | strength word | uses "never", not found in the cited sentence(s) |
| #10 | new words | "s148" — not in the transcript at all |
| #11 | new words | "s144", "s145" — not in the transcript at all |
| #12 | new words | "nobody", "s146" — not in the transcript at all |
| #13 | new words | "s147" — not in the transcript at all |
| #15 | thin citation | cites S3 but shares no wording with it — the citation may not reflect what S3 actually says |
| #15 | new words | "gives" — not in the transcript at all |
| #17 | thin citation | cites S8 but shares no wording with it — the citation may not reflect what S8 actually says |
| #17 | new words | "apart" — not in the transcript at all |
| #18 | new words | "runs" — not in the transcript at all |
| #19 | new words | "input" — not in the transcript at all |
| #21 | strength word | uses "only", not found in the cited sentence(s) |
| #22 | new words | "incremental", "pass" — not in the transcript at all |
| #25 | new words | "speed", "because" — not in the transcript at all |
| #27 | thin citation | cites S24 but shares no wording with it — the citation may not reflect what S24 actually says |
| #27 | new words | "says" — not in the transcript at all |
| #29 | new words | "rather" — not in the transcript at all |
| #31 | new words | "inventory" — not in the transcript at all |
| #33 | new words | "convert" — not in the transcript at all |
| #35 | new words | "puts" — not in the transcript at all |
| #36 | new words | "still" — not in the transcript at all |
| #51 | new words | "since" — not in the transcript at all |
| #56 | new words | "however" — not in the transcript at all |
| #59 | new words | "becomes" — not in the transcript at all |
| #60 | new words | "pass" — not in the transcript at all |
| #61 | new words | "s131" — not in the transcript at all |
| #62 | new words | "sees", "s132" — not in the transcript at all |
| #65 | strength word | uses "only", not found in the cited sentence(s) |
| #69 | new words | "s128" — not in the transcript at all |
| #73 | new words | "becomes", "s127" — not in the transcript at all |
| #74 | new words | "rather", "s102", "s104" — not in the transcript at all |
| #75 | new words | "s130" — not in the transcript at all |
| #76 | new words | "also", "carries", "s103" — not in the transcript at all |
| #78 | thin citation | cites S100 but shares no wording with it — the citation may not reflect what S100 actually says |
| #78 | new words | "rebuild", "becomes", "s100", "s101" — not in the transcript at all |
| #79 | new words | "s149" — not in the transcript at all |
| #80 | new words | "s150" — not in the transcript at all |
| #81 | new words | "s151" — not in the transcript at all |
| #82 | new words | "s152" — not in the transcript at all |
| #83 | new words | "s153" — not in the transcript at all |
| #84 | new words | "s154", "s155" — not in the transcript at all |
| #85 | new words | "s156", "s157" — not in the transcript at all |
| #86 | new words | "hidden", "s158" — not in the transcript at all |
| #87 | new words | "become", "s120", "s121", "s122" — not in the transcript at all |
| #88 | new words | "s123" — not in the transcript at all |
| #89 | new words | "s124" — not in the transcript at all |
| #90 | thin citation | cites S125 but shares no wording with it — the citation may not reflect what S125 actually says |
| #90 | new words | "saying", "s125", "s126" — not in the transcript at all |
| #91 | new words | "coverage", "s129" — not in the transcript at all |
| #94 | new words | "versus", "s159", "s160" — not in the transcript at all |
| #95 | strength word | uses "only", not found in the cited sentence(s) |
| #95 | new words | "watches", "s106", "s107", "s108" — not in the transcript at all |
| #96 | new words | "s142" — not in the transcript at all |
| #97 | strength word | uses "only", not found in the cited sentence(s) |
| #97 | new words | "s119" — not in the transcript at all |
| #98 | new words | "s109" — not in the transcript at all |
| #99 | new words | "s133", "s134" — not in the transcript at all |
| #100 | new words | "s110" — not in the transcript at all |
| #101 | new words | "current", "s116", "s117" — not in the transcript at all |
| #102 | new words | "s135" — not in the transcript at all |
| #103 | new words | "s136" — not in the transcript at all |
| #104 | new words | "s111" — not in the transcript at all |
| #105 | new words | "s112" — not in the transcript at all |
| #106 | new words | "s113" — not in the transcript at all |
| #107 | new words | "coordination", "s114", "s115" — not in the transcript at all |
| #108 | new words | "s118" — not in the transcript at all |
| #109 | new words | "s137" — not in the transcript at all |
| #110 | new words | "s140", "s141" — not in the transcript at all |
| #111 | new words | "touch", "s138" — not in the transcript at all |
| #112 | new words | "s139" — not in the transcript at all |
| #113 | new words | "s143" — not in the transcript at all |
