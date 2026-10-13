# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | [sessions/2026/10/09/core-session/requirements.md] | ask #12 |
| S2 | Budget: $6. | ask #12 |
| S3 | core/Session: extract the generic session class out of AISession. | ask #13 |
| S4 | Decided by the owner (19:05, via the page mastermind): [core/Page/doc/architecture.md, "Session"](/framework/core/Page/doc/architecture.md). | ask #12 |
| S5 | One core class for time-based pages: `Session` (record, dated folder, locate/scan/day/dir_url, its `page.jsonl`). | ask #13 |
| S6 | `AISession` extends it; `RefineSession` (task-mastermind-refine-v3) will later too. | ask #14 |
| S7 | Asked by `mastermind-page-system`, owned by `mastermind-ai-system`. | ask #14 |
| S8 | Do. | ask #13 |
| S9 | Create `public/framework/core/Session/Session.js` (`export default class Session`), plus a short `readme.md` (what it is, who extends it, link to the architecture section and to `ai/sessions/doc/data/layout.md`). | ask #13 |
| S10 | Link it from `core/readme.md`. | ask #13 |
| S11 | Move the **generic** statics out of `public/framework/ai/AISession/AISession.js` into it, unchanged in behaviour: `day`, `root_url`, `dir_url`, `scan`, `locate`, and the maps `days`, `slugs` (plus the `scanned` flag). | ask #15 |
| S12 | Root folder is a static hook, `static root_url()`, that the subclass overrides (AISession's is `../sessions/` with the `SESSIONS_ROOT` env override). | ask #15 |
| S13 | **Statics are per class**: JavaScript inherits statics by reference, so each subclass must declare its OWN `days`, `slugs` and `scanned` (`static days = new Map()` in `AISession`), and the Session methods must use `this.days` / `this.slugs` / `this.root_url()`, never the literal `AISession.` or `Session.`. | ask #16 |
| S14 | This is the one way the extraction silently breaks (two subclasses sharing one map). | ask #16 |
| S15 | `AISession extends Session`, keeps everything else (cache, costs, transcript, live index, record log, close, rollup, `LINE_TYPES`). | ask #17 |
| S16 | `scan` already reads the first line `{"session": "<uuid>"}` of a `page.jsonl` the page tool made; keep that. | ask #17 |
| S17 | Prove (tick only with proof). | ask #18 |
| S18 | `node --check` on every file touched; `node -e "import('./public/framework/ai/AISession/AISession.js')"` loads in node. | ask #18 |
| S19 | Behaviour is the same: run `node Server/session-index.mjs` or the closest existing script that calls `AISession.scan/locate` (find callers with Grep: `AISession.locate`, `AISession.scan`, `AISession.dir_url`) before and after, and show equal output for 3 known ids. | ask #18 |
| S20 | Then open `/framework/ai/sessions/` headless (`mcp__site__shot` at 1920) and confirm the grid and one detail page still render. | ask #18 |
| S21 | A tiny test: a throwaway subclass `class T extends Session` with its own maps does not change `AISession.days`. | ask #18 |
| S22 | Rules. | ask #19 |
| S23 | Do not change any caller's API: every `AISession.x` that works today still works (inherited statics are fine). | ask #19 |
| S24 | Commit by exact path, one commit for the new class, one for the AISession change. | ask #19 |
| S25 | Do not touch uncommitted files you did not edit. | ask #19 |
| S26 | Do not restart Servex; say in your report that Servex needs one. | ask #19 |
| S27 | Update `ai/sessions/doc/ui/classes.md` with the new parent in one line. | ask #19 |
| S28 | Report: one screen, links, what you proved, what you did not. | ask #19 |
| S29 | [sessions/2026/10/09/feedback-council/requirements.md] | ask #20 |
| S30 | Feedback council: brief for each of the five checkers. | ask #20 |
| S31 | Card dir (read the raw words there): `public/framework/ai/council/` (and the current run directory). | ask #21 |
| S32 | Words: `words.jsonl` in the active run directory. | ask #21 |
| S33 | Asks to check: new asks extracted from `words.jsonl` plus every open ask in `public/framework/ai/council/asks.jsonl` whose latest verdict isn't `done`. | ask #21 |
| S34 | Your job. | ask #22 |
| S35 | For EVERY ask, LOOK at the real result and give one verdict: `done` / `partly` / `not done` / `done-but-wrong`, one line of evidence (URL, screenshot path, file:line), and for anything not `done` the smallest fix. | ask #22 |
| S36 | Prove before you call something missing. | ask #23 |
| S37 | A false "not done" is the common failure: search the repo (`git log`, grep, the skills in `.claude/skills/`, CLAUDE.md) before writing it. | ask #23 |
| S38 | The live site: http://monorepo.localhost (never http://localhost/). | ask #24 |
| S39 | Visual asks: headless Playwright at 1920 and 3440 (Playwright, never the owner's tabs, no `mcp__site__eval` on tabs the owner has open). | ask #24 |
| S40 | Time the Live card load. | ask #24 |
| S41 | Check scroll on the named URLs with real overflow measures. | ask #24 |
| S42 | No window may pop up: `windowsHide: true`, `-WindowStyle Hidden`. | ask #24 |
| S43 | Do NOT edit any repo file. | ask #25 |
| S44 | Scratch goes in your scratchpad; screenshots to `<run-dir>/shots/<your-name>-<ask>.png` only for the ones that are evidence (keep <=12). | ask #25 |
| S45 | Also scan `words.jsonl` and add up to 8 **extra asks** the owner made there that current asks miss, with the same verdict. | ask #26 |
| S46 | Return. | ask #27 (thin) |
| S47 | Write ONE json file `<run-dir>/votes/<your-name>.json`: `{"name":"...","votes":{"A1":{"v":"done\|partly\|not done\|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...},"extra":[{"ask":"...","v":"...","e":"...","f":"..."}]}` | ask #27 |
| S48 | Then reply "done" in one line. | ask #27 |
| S49 | Never write the owner's name anywhere. | ask #27 |
| S50 | Budget about $2 each: be quick, do not over-explore. | ask #27 |
| S51 | Load the `minion` skill first only if it does not conflict: you edit nothing but your votes file and shots. | ask #25 |
| S52 | [sessions/2026/10/09/notifications-lab/notifications-lab/requirements.md] | ask #45 |
| S53 | Notifications Lab. | ask #45 |
| S54 | Goal. | ask #45 |
| S55 | Get web notifications working on my Android phone against the local dev server, from a normal browser tab (no PWA install), and build a demo page to explore what notifications can do. | ask #45 |
| S56 | Write a short report of findings when done. | ask #55 |
| S57 | Constraints. | ask #46 |
| S58 | Vanilla JS, native ESM, no TypeScript, no build step. | ask #46 |
| S59 | Use our existing View class and page system; read existing code first and follow its patterns. | ask #46 |
| S60 | Each class has a static View, rendered via `this.constructor.View`. | ask #46 |
| S61 | Parents render children through the children's views. | ask #46 |
| S62 | Views should show internal state live (permission, worker state, visible notifications, event log). | ask #46 |
| S63 | New classes go in lab/ClassName/ClassName.js (capitalized, file name matches class name). | ask #47 |
| S64 | Helper classes that only serve a parent are nested in the parent's folder. | ask #47 |
| S65 | Don't reuse native API names (Notification, ServiceWorker, etc.). | ask #47 |
| S66 | Keep wrappers thin and close to the native API shape. | ask #48 |
| S67 | No offline caching / fetch interception. | ask #48 |
| S68 | Local testing. | ask #52 (thin) |
| S69 | I test on my phone via the desktop's LAN IP. | ask #52 |
| S70 | Setup: Android Chrome → chrome://flags → "Insecure origins treated as secure" → add http://<LAN-IP>:<port> → relaunch. | ask #52 |
| S71 | Show window.isSecureContext on the page. | ask #52 |
| S72 | If the flag doesn't make service workers + notifications work, tell me and propose the simplest fallback (e.g. mkcert). | ask #52 |
| S73 | Classes. | ask #48 (thin) |
| S74 | lab/WorkerHost/WorkerHost.js | ask #48 |
| S75 | Registers the service worker (sw.js at site root, type: 'module'), exposes registration + state, relays messages from the worker. | ask #48 |
| S76 | Keep sw.js thin. | ask #48 |
| S77 | lab/NotificationManager/NotificationManager.js | ask #49 |
| S78 | One instance at the app level. | ask #49 |
| S79 | Wraps permission, maxActions, registration.showNotification and getNotifications. | ask #49 |
| S80 | NOTE: `new Notification()` throws on Android Chrome, so everything goes through showNotification(). | ask #49 |
| S81 | Verify this. | ask #49 |
| S82 | show(opts) → NotificationHandle | ask #49 |
| S83 | Relays click / action / close events from sw.js to the page. | ask #49 |
| S84 | lab/NotificationManager/NotificationHandle.js | ask #50 |
| S85 | One notification slot keyed by tag. | ask #50 |
| S86 | Native notifications are immutable, so set(props) re-shows under the same tag to act like an update. | ask #50 |
| S87 | close(), and click / action / close events. | ask #50 |
| S88 | Demo page. | ask #51 |
| S89 | Stacked demo cards, each with buttons plus a live view, and a shared event log. | ask #51 |
| S90 | Cover: | ask #51 |
| S91 | All showNotification options: body, icon, badge, image, tag, renotify, silent, vibrate patterns, requireInteraction, actions, data. | ask #51 |
| S92 | maxActions, and what happens with more actions than allowed. | ask #51 |
| S93 | Long multi-paragraph body: truncation and expanded view. | ask #51 |
| S94 | Multiple notifications at once vs same-tag replacement. | ask #51 |
| S95 | Progress bar via repeated set() (text bar like ▓▓▓░░ 3/5). | ask #51 |
| S96 | Question chain: 2-button choices, answer → next question on same tag. | ask #51 |
| S97 | Click behavior with the tab focused, backgrounded and closed (focus the existing tab vs open a new one). | ask #51 |
| S98 | What sound/vibrate/silent the page controls vs Android's per-site settings. | ask #51 |
| S99 | Stretch, only once the above works: push notifications (subscription + a dev-server route that sends a test push after a delay, so I can switch apps or close the tab first). | ask #54 |
| S100 | Report. | ask #55 |
| S101 | Short markdown: what works without installing a PWA, setup steps that worked, results of each demo, limits found (e.g. buttons only, no checkboxes or inputs), and anything that surprised you. | ask #55 |
| S102 | Next step (don't build yet). | ask #55 |
| S103 | Page lifecycle testing: visibilitychange, pagehide, freeze, unload, sendBeacon. | ask #55 |
| S104 | Note anything you learn about it in the report. | ask #55 |
| S105 | Notes from the dispatcher. | ask #47 (thin) |
| S106 | "lab/" means a lab directory under the public tree; choose the right location by the readme chain (is there an existing lab area? if not, pick `public/framework/lab/` or similar and record the alternative), and make sure the lab and its demo are linked from the site. | ask #47 |
| S107 | You can test notification logic headless where possible; the real Android test is the owner's, so give them a one-screen phone checklist page (the URL to open, the flag steps, the buttons to press) and put the same steps in the report. | ask #53 |
| S108 | No new npm dependency. | ask #46 |
| S109 | The push stretch needs a dev-server route (`Server/`); that is the one place to be careful: small, loopback-safe, reviewed. | ask #54 |
| S110 | [sessions/2026/10/09/refine-demo/refine-demo/requirements.md] | ask #35 |
| S111 | Refine demo: a Prompt class you can talk to, with a live debug view. | ask #35 |
| S112 | Owner (2026-10-08). | ask #35 |
| S113 | Goal: a page where you speak one prompt and watch it become raw, clean and structured text, beside a live view of the `Prompt` object doing it. | ask #35 |
| S114 | How to work. | ask #43 (thin) |
| S115 | Who: you are a Sonnet 5.5 mastermind owning this task end to end; build it yourself. | ask #43 |
| S116 | Spawn a Haiku 5.5 minion (parent = you, under 60k tokens) only for cheap reading. | ask #43 |
| S117 | Git: work in a worktree, smoke-test, commit after each working step, read the diff, merge. | ask #44 |
| S118 | Budget: run `node Server/usage-now.mjs` before any spawn. | ask #43 |
| S119 | No OpenRouter (paused, its accounting is untrusted): use Claude Haiku 5.5, the local model, or plain code. | ask #43 |
| S120 | Resume: keep `STATE.md` in the task dir current after every step so a fresh session can continue. | ask #44 |
| S121 | Always: link everything you create from the site; destroy nothing; reply in chat with one sentence. | ask #44 |
| S122 | Read first. | ask #36 |
| S123 | `public/framework/ext/Refine/doc/vision-2026-10-08.md` (the owner's whole design, both addenda: pipeline, per-sentence clarity and weight, flags, alternates, names, the `Prompt` class), `ext/Refine/readme.md` and its `doc/`, `Server/refine.mjs`, `ext/Refine/engine.js` + `structure.js`, `ux/Dictate`, and CLAUDE.md ("Write classes", "Show the class", "Name things", "Link every mention"). | ask #36 |
| S124 | Build (small, working, visible). | ask #37 |
| S125 | A `Prompt` class (`ext/Refine/Prompt.js`, class name = file name; follow the house pattern: `Prompt.View = ...` attached after the class, `render()` does `new this.constructor.View(...)`): holds `raw`, `clean` (numbered sentences), `refined` (cards with sub-cards), and per sentence `clarity`, `weight`, `flags`, `alternates`. | ask #37 |
| S126 | Reuse `engine.js`/`structure.js` for the actual cleaning and structuring; don't write a second pipeline. | ask #38 |
| S127 | Scores may be simple first (a rule/heuristic or a Haiku call per prompt, not per sentence loops); record what you chose. | ask #38 |
| S128 | The `ext/Refine` page becomes a working demo: a dictation widget (reuse `ux/Dictate`; must work on the phone page described in `framework/dev/mobile`) that refines one prompt at a time: speak, then see raw, clean, structured, with a yellow flag on low-clarity sentences (never nag) and click-through from a refined card to its source sentence. | ask #39 |
| S129 | A button records the next prompt. | ask #39 |
| S130 | If dictation is unavailable, a text box does the same. | ask #39 |
| S131 | The live debug view next to it (CLAUDE.md "Show the class"): a tree/card of the live `Prompt` instance, rendering each property by type (string, boolean, number, nested array/object; functions optional), updating as you use the demo; the class card (icon, name, core API, who calls it). | ask #40 |
| S132 | Reuse the existing class-card / Doc code from `ext/Doc` and `framework/ai/system` if it fits; extend, don't duplicate. | ask #40 |
| S133 | Try your best; the owner will look. | ask #42 |
| S134 | Docs: `ext/Refine` readme (short index) + one doc on the `Prompt` class; link the demo from the AI system page / the Refine entry on the site. | ask #41 |
| S135 | Out of scope now. | ask #42 |
| S136 | No refined-prompt hand-off to agents, no inbox filing, no multi-agent ranking of alternates, no hooks into VS Code. | ask #42 |
| S137 | Note them as next steps. | ask #42 |
| S138 | Land with `finish-task`; commit with attribution; no loose files. | ask #44 |
| S139 | [sessions/2026/10/09/session-060cdfff/page-mastermind/doc-audit/requirements.md] | ask #6 |
| S140 | core/Page doc audit: one recommendation per doc file. | ask #6 |
| S141 | Budget: $1 per minion. | ask #7 |
| S142 | Model: Haiku. | ask #7 |
| S143 | Read only, except your own `recs.md`. | ask #7 |
| S144 | Stay under 60k tokens: read each file once, and grep (do not read whole) to find related docs. | ask #7 |
| S145 | The owner (2026-10-09, 19:05) wants the page system's docs cleaned up: merged, condensed or moved where they overlap, and superseded files archived with a note. | ask #6 |
| S146 | You recommend; the mastermind (`mastermind-page-system`) decides and does the moves with a script. | ask #11 |
| S147 | Change no file except your own `recs.md`, written in this folder (`doc-audit/`). | ask #7 |
| S148 | What to read. | ask #8 |
| S149 | `public/framework/core/Page/readme.md` (the module's index) and `public/framework/core/Page/doc/architecture.md` (the current class architecture and decisions; treat it as the truth). | ask #8 |
| S150 | Your files, named in your prompt, all in `public/framework/core/Page/doc/`. | ask #8 |
| S151 | For each file, grep `public/framework/core/Page/` and `public/framework/ext/` for docs on the same topic (its key words, and links to it), and skim only the matching parts. | ask #8 |
| S152 | What to decide, per file. | ask #9 |
| S153 | One verdict: | ask #9 |
| S154 | keep: current, unique, and in the right place. | ask #9 |
| S155 | condense: right place, but long or repetitive; say what to cut. | ask #9 |
| S156 | merge: overlaps another doc; name the doc it should merge into and which one survives. | ask #9 |
| S157 | move: belongs beside another module; name the folder. | ask #9 |
| S158 | archive: superseded or describes a system that no longer exists; name what replaced it. | ask #9 |
| S159 | Also note: is it linked from `readme.md` or another doc (`grep -rl "<name>.md" public/framework/core/Page`)? | ask #8 |
| S160 | Any claim you can see is stale (a file, class or method that no longer exists: check with a quick grep)? | ask #8 |
| S161 | What to write. | ask #10 |
| S162 | `recs.md` in your own task folder, one block per file: | ask #10 |
| S163 | ## <file>.md: <verdict> | ask #10 |
| S164 | - why: one or two plain sentences | ask #10 |
| S165 | - into / folder / replaced by: <path, if any> | ask #10 |
| S166 | - linked from: <files, or "nowhere"> | ask #10 |
| S167 | - stale: <claims checked and found wrong, or "none found"> | ask #10 |
| S168 | Then "keep" with "none found" is a fine answer. | ask #10 |
| S169 | Then stop. | ask #10 |
| S170 | [sessions/2026/10/09/session-060cdfff/page-mastermind/requirements.md] | ask #28 |
| S171 | Page mastermind: study the page system, then agents change pages by path + delta. | ask #28 |
| S172 | The owner, 2026-10-09 ~18:05 (VS Code tab 7efd07d5). | ask #28 |
| S173 | Your primer is `public/framework/core/Page/readme.md`; your goal is `core/Page/doc/page-tool-2026-10-09.md` (read both first). | ask #28 |
| S174 | 1. Study, with a readme sanity check (cheap). | ask #29 |
| S175 | Read the readme chain root → `core/Page/` and the child readmes it names. | ask #29 |
| S176 | On ingest, check each: up to date? stale? unclear? a major subsystem missing? Fix only **major** errors and omissions (a big subsystem not indexed, a wrong fact), in a line each; do not polish, do not go into skill refinement. | ask #29 |
| S177 | List what you fixed in your task log. | ask #29 |
| S178 | 2. Build: the page tool works for real. | ask #31 |
| S179 | Close the four gaps in `page-tool-2026-10-09.md`. | ask #31 |
| S180 | (1) A delta can add a tab, change layout, change navigation (smallest change to `Page.class.js`). | ask #31 |
| S181 | (2) Every session folder gets a `page.jsonl` beside its `session.jsonl`, rendered on top of the default session template, live. | ask #31 |
| S182 | (3) An agent knows its own page's path (Servex injects it; a VS Code tab via a hook); the agent writes only path + raw JSON delta, and the tool stamps ts/ids/by. | ask #31 |
| S183 | (4) The demo: in a session, "add a tab here" makes a tab appear with no reload. | ask #31 |
| S184 | Sessions get a name (slug) where they lack one; VS Code tabs too. | ask #32 |
| S185 | Write the class architecture first (a short page: classes, what extends/composes what) per CLAUDE.md, then the smallest slice. | ask #30 |
| S186 | Fences and neighbours. | ask #33 |
| S187 | You own `core/Page/`, `Servex/agents/page_tools.js`. | ask #33 |
| S188 | `minion-session-detail-live` is editing `ai/AISession/AISessionDetail.js` right now (its step 5 = AI-posted cards on the session page). | ask #33 |
| S189 | Message it (`send_to_agent`) before touching the session template; better, let it land first and build on it. | ask #33 |
| S190 | The AI mastermind (`mastermind-ai-system`) studies the AI system in parallel; ask it, don't duplicate its reading. | ask #33 |
| S191 | Rules. | ask #34 |
| S192 | Opus, by the owner's choice ("we want this to work properly"); spawn Sonnet or Haiku helpers only for bounded pieces. | ask #34 |
| S193 | Worktree; commit after each working step; `Server/merge.mjs`; check pages at 400/1200/1920/3440. | ask #34 |
| S194 | Land with finish-task and a `Note:` card with the demo screenshot. | ask #34 |
| S195 | [sessions/2026/10/09/session-060cdfff/page-mastermind/streaming-doc/requirements.md] | ask #1 |
| S196 | Budget: $3 | ask #1 |
| S197 | core/Page: one clear overview of page storage and streaming. | ask #1 |
| S198 | The owner (2026-10-09 18:15 and 18:25, relayed by vscode-mastermind-7efd07d5) said: "Document the page streaming system in core/Page very clearly: page.jsonl append → live() tail → render; what lives where, cross references, which tools write it (page_tools.js, Servex append_log), coordination; one overview a reader can follow." | ask #1 |
| S199 | Document clearly page.js vs page.jsonl vs files.jsonl (the per-folder index; directory.json is now off, see Server/doc/directory-off.md), and the other path-based per-directory systems; the page system is our storage + streaming container. | ask #2 |
| S200 | Do. | ask #2 |
| S201 | Write ONE file: `C:\Code\lew42\worktrees\page-mm\public\framework\core\Page\doc\streaming.md` (worktree `page-mm`, branch worktree/page-mm). | ask #2 |
| S202 | Under ~120 lines. | ask #2 |
| S203 | Plain sentences for a new coder (CLAUDE.md law 2), a diagram in a code block, then short sections: | ask #2 |
| S204 | The files in a folder: page.js, page.jsonl, files.jsonl, settings.jsonl, readme.md, doc/, directory.json (off) — one line each: what it is, who writes it, who reads it. | ask #3 |
| S205 | One line's journey: a writer appends → the dev server's watcher → `Server/plugins/SocketServer/Tail.js` → the socket → `ext/JSONL/live.js` → `Page.Reader` (core/Page/Page.class.js, extends `Item.Store` in core/Item/Store.js) → `page.set()` → the page redraws (`log_redraw`, `nav_redraw`, and the new `rerender()`). | ask #3 |
| S206 | Name each file with its path. | ask #3 |
| S207 | Say what a browser tab writes back (`Item.Store` → `Server/plugins/SocketServer/Append.js`). | ask #3 |
| S208 | Who writes: `Servex/agents/page_tools.js` (page_set is the page tool: path + delta, see doc/page-tool-architecture.md), Servex `append_log`, `.claude/hooks/append.mjs`, and hand edits are blocked by `.claude/hooks/jsonl-guard.mjs`. | ask #3 |
| S209 | One line each. | ask #3 |
| S210 | Rules that keep it safe: append only (never rewrite), one writer per line, validation (`.claude/hooks/jsonl-schema.mjs`), localhost-only streaming (production loads once). | ask #3 |
| S211 | Path-based per-directory systems: md/ and fs/ routes, the page inbox (core/Page/ext/Inbox), files.jsonl listing — one line each with a link (core/Page/ext/doc/path-extensions.md has the census). | ask #3 |
| S212 | Read the real code to verify every claim (Tail.js, live.js, Store.js, Append.js, Server/plugins/PageFiles.js, Page.class.js `Page.Reader`, doc/jsonl.md, doc/loading.md, Server/doc/directory-off.md). | ask #4 |
| S213 | Link existing docs instead of repeating them. | ask #4 |
| S214 | Write links as plain relative file paths (`jsonl.md`, `../../Item/Store.js`). | ask #4 |
| S215 | Fence. | ask #5 |
| S216 | Only that one file. | ask #5 |
| S217 | Do not edit readmes or code (the mastermind links it). | ask #5 |
| S218 | Commit it in the worktree: `git -C C:/Code/lew42/worktrees/page-mm add public/framework/core/Page/doc/streaming.md`, then commit with a clear message ending with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. | ask #5 |
| S219 | Never `git add -A` (the worktree has generated noise). | ask #5 |
| S220 | Then stop and reply in two sentences. | ask #5 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #1 | new words | "s195", "s196", "s197", "s198" — not in the transcript at all |
| #2 | strength word | uses "only", not found in the cited sentence(s) |
| #2 | new words | "form", "s199", "s200", "s201", "s202", "s203" — not in the transcript at all |
| #3 | new words | "order", "s204", "s205", "s206", "s207", "s208", "s209", "s210", "s211" — not in the transcript at all |
| #4 | new words | "verification", "s212", "s213", "s214" — not in the transcript at all |
| #5 | new words | "because", "s215", "s216", "s217", "s218", "s219", "s220" — not in the transcript at all |
| #6 | new words | "s139", "s140", "s145" — not in the transcript at all |
| #7 | new words | "s141", "s142", "s143", "s144", "s147" — not in the transcript at all |
| #8 | new words | "whether", "s148", "s149", "s150", "s151", "s159", "s160" — not in the transcript at all |
| #9 | new words | "s152", "s153", "s154", "s155", "s156", "s157", "s158" — not in the transcript at all |
| #10 | new words | "s161", "s162", "s163", "s164", "s165", "s166", "s167", "s168", "s169" — not in the transcript at all |
| #11 | strength word | uses "only", not found in the cited sentence(s) |
| #11 | new words | "s146" — not in the transcript at all |
| #18 | new words | "leaves" — not in the transcript at all |
| #19 | new words | "included", "says", "saying" — not in the transcript at all |
| #25 | new words | "most" — not in the transcript at all |
| #27 | thin citation | cites S46 but shares no wording with it — the citation may not reflect what S46 actually says |
| #28 | new words | "s170", "s171", "s172", "s173" — not in the transcript at all |
| #29 | new words | "s174", "s175", "s176", "s177" — not in the transcript at all |
| #30 | new words | "s185" — not in the transcript at all |
| #31 | new words | "s178", "s179", "s180", "s181", "s182", "s183" — not in the transcript at all |
| #32 | new words | "s184" — not in the transcript at all |
| #33 | new words | "s186", "s187", "s188", "s189", "s190" — not in the transcript at all |
| #34 | new words | "s191", "s192", "s193", "s194" — not in the transcript at all |
| #35 | new words | "s110", "s111", "s112", "s113" — not in the transcript at all |
| #36 | new words | "s122", "s123" — not in the transcript at all |
| #37 | new words | "s124", "s125" — not in the transcript at all |
| #38 | new words | "start", "s126", "s127" — not in the transcript at all |
| #39 | new words | "s128", "s129", "s130" — not in the transcript at all |
| #40 | new words | "s131", "s132" — not in the transcript at all |
| #41 | new words | "s134" — not in the transcript at all |
| #42 | new words | "says", "since", "s133", "s135", "s136", "s137" — not in the transcript at all |
| #43 | thin citation | cites S114 but shares no wording with it — the citation may not reflect what S114 actually says |
| #43 | new words | "spend", "s114", "s115", "s116", "s118", "s119" — not in the transcript at all |
| #44 | new words | "leave", "s117", "s120", "s121", "s138" — not in the transcript at all |
| #46 | new words | "s108" — not in the transcript at all |
| #47 | thin citation | cites S105 but shares no wording with it — the citation may not reflect what S105 actually says |
| #47 | new words | "such", "s105", "s106" — not in the transcript at all |
| #48 | thin citation | cites S73 but shares no wording with it — the citation may not reflect what S73 actually says |
| #49 | new words | "manager" — not in the transcript at all |
| #52 | thin citation | cites S68 but shares no wording with it — the citation may not reflect what S68 actually says |
| #53 | new words | "s107" — not in the transcript at all |
| #54 | new words | "s109" — not in the transcript at all |
| #55 | new words | "built", "s100", "s101", "s102", "s103", "s104" — not in the transcript at all |
