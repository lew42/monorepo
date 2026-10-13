# 🧩 Session class, feedback council, Notifications Lab, Refine demo and Page docs

## 🧱 Session class
- ⬜ Budget $6; brief at `sessions/2026/10/09/core-session/requirements.md` [S1, S2]
- ✅ Decided by the owner via the page mastermind and recorded in `core/Page/doc/architecture.md` (Session section) [S4]
- ⬜ Extract one core `Session` class for time-based pages: record, dated folder, `locate` / `scan` / `day` / `dir_url`, and its `page.jsonl` [S3, S5]
- ⬜ Do: create `core/Session/Session.js` (`export default class Session`) with a short `readme.md` (what it is, who extends it, links to the architecture section and `ai/sessions/doc/data/layout.md`), then link it from `core/readme.md` [S8, S9, S10]
- ⬜ `AISession extends Session`; `RefineSession` (`task-mastermind-refine-v3`) will too, later. Asked by `mastermind-page-system`, owned by `mastermind-ai-system` [S6, S7]
- ⬜ Move the generic statics out of `AISession`, unchanged in behaviour: `day`, `root_url`, `dir_url`, `scan`, `locate`, the maps `days` and `slugs`, and the `scanned` flag [S11]
- ⬜ Root folder is a static hook, `static root_url()`, that each subclass overrides; `AISession` keeps `../sessions/` with the `SESSIONS_ROOT` env override [S12]
- ⬜ Statics are per class: each subclass declares its own `days`, `slugs`, `scanned` (`static days = new Map()` in `AISession`), and Session methods use `this.`, never a literal class name [S13]
  - Two subclasses sharing one map is the one way this breaks silently [S14]
- ⬜ `AISession` keeps everything else: cache, costs, transcript, live index, record log, close, rollup, `LINE_TYPES` [S15]
- ⬜ `scan` keeps reading the first line `{"session": "<uuid>"}` of a `page.jsonl` the page tool made [S16]
- ⬜ Proof, and tick only with proof [S17]
  - `node --check` on every touched file; `AISession.js` loads in node [S18]
  - Same output before and after for 3 known ids, from `Server/session-index.mjs` or the closest caller of `AISession.scan` / `locate` (find callers with Grep) [S19]
  - `/framework/ai/sessions/` at 1920 via `mcp__site__shot`: grid and one detail page render [S20]
  - A throwaway `class T extends Session` with its own maps leaves `AISession.days` unchanged [S21]
- ⬜ Rules: no caller API changes; every `AISession.x` that works today still works, inherited statics included [S22, S23]
- ⬜ Commit by exact path: one commit for the new class, one for the `AISession` change; touch no uncommitted file you did not edit [S24, S25]
- ⬜ Do not restart Servex; the report says Servex needs one [S26]
- ⬜ Add the new parent to `ai/sessions/doc/ui/classes.md` in one line [S27]
- ⬜ Report: one screen, links, what was proved and what was not [S28]

---

## 🗳️ Feedback council
- ⬜ Write a brief for each of the five checkers; brief at `sessions/2026/10/09/feedback-council/requirements.md` [S29, S30]
- ⬜ Read the raw words in `public/framework/ai/council/` and the current run directory, in its `words.jsonl` [S31, S32]
- ⬜ Asks to check: new asks from `words.jsonl`, plus every open ask in `public/framework/ai/council/asks.jsonl` whose latest verdict is not `done` [S33]
- ⬜ Your job: for EVERY ask, look at the real result and give one verdict (`done`, `partly`, `not done`, `done-but-wrong`), with one line of evidence (URL, screenshot path, file:line) and, for anything not `done`, the smallest fix [S34, S35]
- ⬜ Prove before calling anything missing; a false "not done" is the common failure, so search the repo first (`git log`, grep, `.claude/skills/`, CLAUDE.md) [S36, S37]
- ⬜ The live site is `http://monorepo.localhost`, never `http://localhost/` [S38]
- ⬜ Visual asks: headless Playwright at 1920 and 3440; never the owner's tabs, and no `mcp__site__eval` on tabs the owner has open [S39]
- ⬜ Time the Live card load; check scroll on the named URLs with real overflow measures [S40, S41]
- ⬜ No window may pop up: `windowsHide: true`, `-WindowStyle Hidden` [S42]
- ⬜ Edit no repo file [S43]
- ⬜ Scratch goes in your scratchpad; screenshots only as evidence, at most 12, in `<run-dir>/shots/<your-name>-<ask>.png` [S44]
- ⬜ Extras: scan `words.jsonl` and add up to 8 asks the owner made that the current asks miss, with the same verdict [S45]
- ⬜ Output: write ONE JSON file `<run-dir>/votes/<your-name>.json` (votes per ask, plus `extra`), then reply `done` in one line [S46, S47, S48]
- ⬜ Never write the owner's name anywhere [S49]
- ⬜ Budget about $2 each; be quick, do not over-explore [S50]
- ⬜ Load the `minion` skill first only if it does not conflict; you edit nothing but your votes file and shots [S51]

---

## 🔔 Notifications Lab
- ⬜ Goal: get web notifications working on the owner's Android phone against the local dev server, from a normal browser tab with no PWA install, and build a demo page to explore them. Brief at `sessions/2026/10/09/notifications-lab/notifications-lab/requirements.md` [S52, S53, S54, S55]
- ⬜ Constraints: vanilla JS, native ESM, no TypeScript, no build step, no new npm dependency [S57, S58, S108]
- ⬜ Use the existing `View` class and page system; read existing code first and follow its patterns [S59]
- ⬜ Each class has a static `View`, rendered via `this.constructor.View`; parents render children through the children's views [S60, S61]
- ⬜ Views show internal state live: permission, worker state, visible notifications, event log [S62]
- ⬜ New classes go in `lab/ClassName/ClassName.js`; helper classes that only serve a parent nest in the parent's folder [S63, S64]
- ⬜ Don't reuse native API names such as `Notification` or `ServiceWorker` [S65]
- ⬜ Keep wrappers thin and close to the native API shape; no offline caching, no fetch interception [S66, S67]
- ⬜ Lab location: `lab/` means a lab directory under the public tree. Pick it by the readme chain; if none exists, use `public/framework/lab/` or similar, record the alternative, and link the lab and demo from the site [S105, S106]

## 🧩 Classes
- ⬜ `WorkerHost` in `lab/WorkerHost/WorkerHost.js`: registers the service worker (`sw.js` at site root, `type: 'module'`), exposes registration and state, relays messages from the worker. Keep `sw.js` thin [S73, S74, S75, S76]
- ⬜ `NotificationManager` in `lab/NotificationManager/NotificationManager.js`: one instance at app level; wraps permission, `maxActions`, `registration.showNotification` and `getNotifications` [S77, S78, S79]
- ⬜ `NotificationManager.show(opts)` returns a `NotificationHandle` [S82]
- ⬜ `NotificationManager` relays click, action and close events from `sw.js` to the page [S83]
- ⬜ `new Notification()` throws on Android Chrome, so everything goes through `showNotification()`; verify this [S80, S81]
- ⬜ `NotificationHandle` in `lab/NotificationManager/NotificationHandle.js`: one notification slot keyed by `tag` [S84, S85]
- ⬜ Native notifications are immutable, so `set(props)` re-shows under the same tag to act like an update [S86]
- ⬜ `NotificationHandle` has `close()` and click / action / close events [S87]

## 🧪 Demo page
- ⬜ Stacked demo cards, each with buttons plus a live view, and one shared event log [S88, S89]
- ⬜ Cover these: [S90]
  - All `showNotification` options: body, icon, badge, image, tag, renotify, silent, vibrate patterns, requireInteraction, actions, data [S91]
  - `maxActions`, and what happens with more actions than allowed [S92]
  - Long multi-paragraph body: truncation and expanded view [S93]
  - Multiple notifications at once vs same-tag replacement [S94]
  - Progress bar via repeated `set()`, a text bar like ▓▓▓░░ 3/5 [S95]
  - Question chain: 2-button choices, answer → next question on the same tag [S96]
  - Click behaviour with the tab focused, backgrounded and closed: focus the existing tab or open a new one [S97]
  - What sound, vibrate and silent the page controls vs Android's per-site settings [S98]
- ⬜ Stretch, only once the above works: push notifications (subscription, plus a dev-server route that sends a test push after a delay, so you can switch apps or close the tab first) [S99]
  - The push route lives in `Server/`, the one place to be careful: small, loopback-safe, reviewed [S109]

## 📱 Phone test
- ⬜ Local testing: the owner tests on the phone via the desktop's LAN IP [S68, S69]
- ⬜ Setup: Android Chrome → `chrome://flags` → "Insecure origins treated as secure" → add `http://<LAN-IP>:<port>` → relaunch [S70]
- ⬜ Show `window.isSecureContext` on the page [S71]
- ⬜ If the flag doesn't make service workers and notifications work, say so and propose the simplest fallback, e.g. mkcert [S72]
- ⬜ Give the owner a one-screen phone checklist page (URL, flag steps, buttons to press), with the same steps in the report; test notification logic headless where possible [S107]

## 🧾 Report and next step
- ⬜ Short markdown report: what works without installing a PWA, setup steps that worked, results of each demo, limits found (e.g. buttons only, no checkboxes or inputs), and anything surprising [S56, S100, S101]
- ⬜ Next step, not built yet: page lifecycle testing (`visibilitychange`, `pagehide`, `freeze`, `unload`, `sendBeacon`); note what you learn in the report [S102, S103, S104]

---

## 💬 Refine demo
- ⬜ Goal: a page where you speak one prompt and watch it become raw, clean and structured text, beside a live view of the `Prompt` object doing it. Brief at `sessions/2026/10/09/refine-demo/refine-demo/requirements.md`, owner's words from 2026-10-08 [S110, S111, S112, S113]
- ⬜ Demo on the `ext/Refine` page: a dictation widget (reuse `ux/Dictate`; must work on the phone page in `framework/dev/mobile`) refines one prompt at a time, with a yellow flag on low-clarity sentences (never nag) and click-through from a refined card to its source sentence [S128]
- ⬜ A button records the next prompt; if dictation is unavailable, a text box does the same [S129, S130]
- ⬜ Live debug view beside it: a tree/card of the live `Prompt` instance, rendering each property by type (string, boolean, number, nested array/object; functions optional), updating as you use the demo; plus the class card (icon, name, core API, who calls it) [S131]
- ⬜ Reuse, don't duplicate: the class card and Doc code from `ext/Doc` and `framework/ai/system`, if it fits [S132]
- ⬜ Try your best; the owner will look [S133]
- Out of scope, to note as next steps: no refined-prompt hand-off to agents, no inbox filing, no multi-agent ranking of alternates, no hooks into VS Code [S135, S136, S137]

## 🧩 Prompt class
- ⬜ Build small, working, visible [S124]
- ⬜ `Prompt` in `ext/Refine/Prompt.js` (class name = file name; house pattern: `Prompt.View` attached after the class, `render()` does `new this.constructor.View(...)`). It holds `raw`, `clean` (numbered sentences), `refined` (cards with sub-cards), and per sentence `clarity`, `weight`, `flags`, `alternates` [S125]
- ⬜ Reuse `engine.js` and `structure.js` for the cleaning and structuring; no second pipeline [S126]
- ⬜ Scores may start simple: a rule, a heuristic, or one Haiku call per prompt (not per-sentence loops); record the choice [S127]
- ⬜ Docs: a short `ext/Refine` readme index plus one doc on the `Prompt` class; link the demo from the AI system page or the Refine entry on the site [S134]

## 🧭 Refine working rules
- ⬜ Read first: `ext/Refine/doc/vision-2026-10-08.md` (the whole design, both addenda), `ext/Refine/readme.md` and its `doc/`, `Server/refine.mjs`, `ext/Refine/engine.js` and `structure.js`, `ux/Dictate`, and CLAUDE.md ("Write classes", "Show the class", "Name things", "Link every mention") [S122, S123]
- ⬜ Who: you are a Sonnet 5.5 mastermind owning this end to end, building it yourself [S114, S115]
- ⬜ Spawn a Haiku 5.5 minion (under 60k tokens) only for cheap reading; run `node Server/usage-now.mjs` before any spawn [S116, S118]
- ⬜ No OpenRouter (paused, accounting untrusted): use Claude Haiku 5.5, the local model, or plain code [S119]
- ⬜ Git: work in a worktree, smoke-test, commit after each working step, read the diff, merge [S117]
- ⬜ Resume: keep `STATE.md` in the task dir current after every step, so a fresh session can continue [S120]
- ⬜ Always: link everything you create from the site; destroy nothing; reply in chat with one sentence [S121]
- ⬜ Land with `finish-task`; commit with attribution; no loose files [S138]

---

## 📖 Page doc audit
- ⬜ Audit the `core/Page` docs, one recommendation per doc file. The owner wants overlapping docs merged, condensed or moved, and superseded files archived with a note. Brief at `sessions/2026/10/09/session-060cdfff/page-mastermind/doc-audit/requirements.md` [S139, S140, S145]
- ⬜ Budget $1 per minion; model Haiku; stay under 60k tokens: read each file once, grep (do not read whole) for related docs [S141, S142, S144]
- ⬜ Read only, except your own `recs.md` in `doc-audit/` [S143, S147]
- ⬜ You recommend; the mastermind `mastermind-page-system` decides and does the moves with a script [S146]
- ⬜ Read first: `core/Page/readme.md` and `core/Page/doc/architecture.md` (the truth); then grep `core/Page/` and `ext/` for each file's key words and links [S148, S149, S150, S151]
- ⬜ One verdict per file [S152, S153]
  - `keep`: current, unique, and in the right place [S154]
  - `condense`: right place, but long or repetitive; say what to cut [S155]
  - `merge`: overlaps another doc; name the doc it merges into and which one survives [S156]
  - `move`: belongs beside another module; name the folder [S157]
  - `archive`: superseded, or describes a system that no longer exists; name its replacement [S158]
- ⬜ Also check whether it is linked from `readme.md` or another doc (`grep -rl "<name>.md" public/framework/core/Page`), and whether any claim is stale (a file, class or method that no longer exists) [S159, S160]
- ⬜ Write `recs.md` in your task folder: one block per file, `## <file>.md: <verdict>`, with why, into / folder / replaced by, linked from, and stale [S161, S162, S163]
  - why: one or two plain sentences [S164]
  - into / folder / replaced by: path, if any [S165]
  - linked from: files, or "nowhere" [S166]
  - stale: claims found wrong, or "none found" [S167]
- ⬜ `keep` with "none found" is a fine answer; then stop [S168, S169]

## 🧭 Page mastermind
- ⬜ Goal: study the page system, so agents change pages by path + delta. Brief at `sessions/2026/10/09/session-060cdfff/page-mastermind/requirements.md`; asked by the owner 2026-10-09 ~18:05 from VS Code tab `7efd07d5` [S170, S171, S172]
- ⬜ Read first: the primer `core/Page/readme.md` and the goal `core/Page/doc/page-tool-2026-10-09.md` [S173]
- ⬜ 1. Study, with a cheap readme sanity check: read the chain from root to `core/Page/` and the child readmes it names [S174, S175]
- ⬜ On ingest, check each readme for stale, unclear or missing major subsystems. Fix only major errors and omissions, one line each; no polish, no skill refinement. List the fixes in your task log [S176, S177]
- ⬜ 2. Build: the page tool works for real; close the four gaps in `page-tool-2026-10-09.md` [S178, S179]
  - (1) A delta can add a tab, change layout, change navigation (smallest change to `Page.class.js`) [S180]
  - (2) Every session folder gets a `page.jsonl` beside its `session.jsonl`, rendered live on top of the default session template [S181]
  - (3) The agent knows its own page path (Servex injects it; a VS Code tab via a hook). It writes only path + raw JSON delta, and the tool stamps ts, ids and by [S182]
  - (4) Demo: in a session, "add a tab here" makes a tab appear with no reload [S183]
- ⬜ Sessions and VS Code tabs get a slug where they lack one [S184]
- ⬜ Design the class architecture first: a short page of classes and what extends or composes what; then the smallest slice [S185]
- ⬜ Fences: you own `core/Page/` and `Servex/agents/page_tools.js` [S186, S187]
  - `minion-session-detail-live` is editing `ai/AISession/AISessionDetail.js` now (its step 5 = AI-posted cards on the session page) [S188]
  - Message it (`send_to_agent`) before touching the session template, or let it land first and build on it [S189]
- ⬜ Ask `mastermind-ai-system` about the AI system; it studies it in parallel, so don't duplicate its reading [S190]
- ⬜ Rules: Opus, the owner's choice ("we want this to work properly"); spawn Sonnet or Haiku helpers only for bounded pieces [S191, S192]
- ⬜ Worktree; commit after each working step; `Server/merge.mjs`; check pages at 400, 1200, 1920 and 3440 [S193]
- ⬜ Land with `finish-task` and a `Note:` card with the demo screenshot [S194]

## 🌊 Page streaming doc
- ⬜ Budget $3; brief at `sessions/2026/10/09/session-060cdfff/page-mastermind/streaming-doc/requirements.md` [S195, S196]
- ⬜ Goal: one clear overview of page storage and streaming in `core/Page`: `page.jsonl` append → `live()` tail → render, what lives where, cross references, and which tools write it [S197, S198]
- ⬜ Cover `page.js` vs `page.jsonl` vs `files.jsonl` (the per-folder index). `directory.json` is off (see `Server/doc/directory-off.md`). The page system is the storage and streaming container [S199]
- ⬜ Do: write ONE file, `public/framework/core/Page/doc/streaming.md`, in the `page-mm` worktree (branch `worktree/page-mm`), under about 120 lines [S200, S201, S202]
- ⬜ Form: plain sentences for a new coder, a diagram in a code block, then short sections [S203]
- ⬜ Sections, in order:
  - Files in a folder: `page.js`, `page.jsonl`, `files.jsonl`, `settings.jsonl`, `readme.md`, `doc/`, `directory.json` (off). One line each: what it is, who writes it, who reads it [S204]
  - One line's journey: writer appends → dev-server watcher → `Tail.js` → socket → `live.js` → `Page.Reader` → `page.set()` → redraw (`log_redraw`, `nav_redraw`, new `rerender()`). Every file named with its path [S205, S206]
  - What a browser tab writes back: `Item.Store` → `Append.js` [S207]
  - Who writes, one line each: `page_tools.js` (`page_set`, see `doc/page-tool-architecture.md`), Servex `append_log`, `.claude/hooks/append.mjs`. Hand edits are blocked by `.claude/hooks/jsonl-guard.mjs` [S208, S209]
  - Rules: append only, never rewrite; one writer per line; validation via `.claude/hooks/jsonl-schema.mjs`; localhost-only streaming (production loads once) [S210]
  - Path-based per-directory systems, one line each with a link: md/ and fs/ routes, the page inbox (`core/Page/ext/Inbox`), the `files.jsonl` listing. Census at `core/Page/ext/doc/path-extensions.md` [S211]
- ⬜ Verify every claim against the real code (`Tail.js`, `live.js`, `Store.js`, `Append.js`, `Server/plugins/PageFiles.js`, `Page.class.js` `Page.Reader`, `doc/jsonl.md`, `doc/loading.md`, `Server/doc/directory-off.md`). Link existing docs instead of repeating them; write links as plain relative file paths [S212, S213, S214]
- ⬜ Fence: only that one file; no readme or code edits; the mastermind does the linking [S215, S216, S217]
- ⬜ Commit by exact path in the worktree, never `git add -A`, with a message ending in Co-Authored-By; then stop and reply in two sentences [S218, S219, S220]
