# To do

Work that is waiting, in priority order. Agents put anything **you did not specifically ask for**
here instead of starting it. You pick what runs next. Each line links to its brief.

## 1. Asked for, not finished yet

- **Markdown Explorer, Command Characters & Class Card Views** (2026-10-06):
  1. *Markdown Explorer (`md/` path & tab)*: Upgrade `core/Page/Markdown.js` so `<module>/md/` renders the main `readme.md` in the center and all sibling/doc markdown files in a clean sidebar for quick reference. Add `md` tab on modules with markdown docs.
  2. *Command Characters (`ext/Mention`)*: `/` is strictly 1:1 with file system paths, `@` for actors, `#` for classes. Distinct framed icons, dark card surfaces, and color themes so classes stand out visually from plain links.
  3. *Class Card View*: The class is represented by an icon item card (icon + title); properties/methods are unboxed icon items inside it (no nested card clutter); subclass methods first, base class methods below; core API weighted at the top.
  [Brief](2026-10-06/markdown-explorer-and-class-cards/requirements.md)

- **A layout system that sticks** (2026-09-25): pages use approved layouts most of the time,
  work at 3440 (several columns, or a navigation column beside a centred main column), and get
  checked at four widths before merging. Step 1 landed (`layout-check` and AI 2 overview redesign).
  Step 2 landed: full audit of 8 main pages (`/framework/`, `/framework/ai2/`, `/framework/core/Page/`,
  `/framework/ux/Tree/`, `/framework/ux/Dictate/`, `/web/`, `/imagine/`, `/layouts/`) at 4 widths
  (400, 1200, 1920, 3440) with contact sheets and `summary.md` in `public/framework/core/Page/audit/sheets/`.
  Fixed Item/Page `data: true` clobbering bug in `Page.class.js`. Next: 3440 ultrawide multi-column / centered main adaptations.

- ~~**A nightly full crawl of the site** (2026-09-28, from mastermind-servex)~~ — **DONE.** Implemented in `Server/crawl.mjs`: crawls every page under `/framework/` at viewport 1920 (seeds discovered routes + follows all same-site links), records HTTP 404s, page load errors, and console errors, captures 1920 screenshots into `<outDir>/shots/`, and runs `Server/padding-check.mjs` on every page. Writes `crawl.jsonl` and `summary.md`. Tested and verified live on `http://monorepo.localhost` (clean execution, screenshots captured, zero tokens used). Failures automatically append to `todo.md`. Documented in `Server/README.md`.
- ~~**Let task masterminds message each other** (2026-09-25)~~ — **DONE.** Verified in `Servex/agents/policy.js` (`table()` lines 85–86): `f === "task-mastermind" && t === "task-mastermind"` returns `"peer"`, allowing task masterminds to message peers directly without relaying through mastermind-servex.
- ~~**Hide every process window: one sweep** (2026-09-25)~~ — **DONE.** Verified 2026-10-06 across `Server/worktree-up.mjs`, `Server/plugins/Ask.js`, `Assistant.js`, `CardAnswer.js`, `Servex/Process.js`, `sustain.mjs`: all call sites have `windowsHide: true` in place; no process windows pop.
- **Module agents: a short readme as the way in, a ready agent to ask, no agent grows old**
  (2026-09-25, designed by mastermind-servex, [design](/framework/ai/sessions/2026/09/24/1c09793f-74b6-4218-82e5-53e5cd88b659/servex-mastermind/)).
  Three pieces, in this order:
  1. ~~*Context rule (Servex/agents, small):* when a long-lived agent (manager, mastermind,
     assistant) passes its role's threshold (card assistant 40k, task mastermind and manager 150k or at landing, mastermind-servex 150k or daily; [the per-role table](/framework/ai2/2026/09/25/fresh-sessions-instead-of-context-drift/)), Servex tells it to write
     a summary line into its card or task log and then restarts it from that line. The `recycle`
     step in Layers.js already does this for card agents. Prove it on a private Servex.~~ — **DONE.** Verified in `Servex/agents/Layers.js` (`fresh_at`: card-assistant 40k, manager 150k), `Global.js` (master-assistant daily reset, mastermind-servex holder/gate), and tested in `Servex/agents/layers.test.mjs` (55 tests passing) verifying manager at 155k gets checkpointed and recycled once the turn ends, restarting fresh from checkpoint summary.
  2. ~~*Readme budget (skills only):* the `documentation` skill says a readme is about 150 words:
     what the module is, its core ideas, the files to read, and the doc/ topics. Then one Sonnet
     sweep trims the ten longest module readmes, moving the detail into doc/.~~ — **DONE.** Specified 150-word budget (4 topics: what it is, core concepts, files, doc topics) in `.claude/skills/documentation/SKILL.md`. Trimmed longest module readmes (`ext/drawer`, `ext/Chat`, `ext/Panel`, `ext/panel2`) down to ~150 words while moving all watchouts and decisions to `doc/decisions.md`.
  3. *(Replaced by "An assistant on every page" below.)* `ask_module(path, question)` (Servex, a new MCP tool): one checkpoint session per module,
     built lazily from its readme and the files it names. It is keyed by path plus a hash of
     those files, and rebuilt when the hash changes. Each question is a one-shot fork of it with
     read-only tools, answers in under 150 words, and stops. Start with Servex/, core/Page,
     ext/Chat, ai2 and styles/. Prove the cost and the cache hit on a private Servex, and
     compare the answer with a fresh agent's on five real questions.
  Needs a Servex restart for 1 and 3.
- **Cards that show the thing** (2026-09-25, designed by mastermind-servex,
  [design](/framework/ai/sessions/2026/09/24/1c09793f-74b6-4218-82e5-53e5cd88b659/servex-mastermind/), card
  [cards-that-show-the-thing](/framework/ai2/2026/09/25/cards-that-show-the-thing/)). Every card is
  one screen: name, one-line state, live objects, a checklist, links, detail one click down. Five
  pieces, in this order, each a Sonnet minion:
  1. *[x] Card vocabulary (ai2/card.js, landed 2026-10-06):* four new line kinds, each a method on `Card`:
     `{"state": "…"}`, `{"checklist": [{text, done, href}]}`, `{"objects": "<module path>"}` and
     `{"preview": "…"}` (60 characters at most). The Overview tab shows before it tells ([the card standard](/framework/ai/doc/ai2/card-standard.md)): the card's folder with `ext/files`, then its objects, its checklist and its state, and the words last. Each tab, file and sub-card gets its own URL. `ext/files` normalizes `..` paths from common parent. The rail shows `preview` or `state`, never raw log line. Live card preview displays counts (agents, working, 5h %). ai2 readme updated.
  2. *[x] The object widget (ux/Objects, landed 2026-10-06):* `class Objects extends Tree`. `Objects.of(x)` walks a
     live object: a property holding a class instance becomes a row (`name: Class ×n`), a Map or
     array becomes a count that opens lazily, and the class name links to its module page. A
     module may export `objects()` in its page.js for rows the walk cannot see (a state dot,
     `new`). + New appears only where it is declared, and it makes a demo instance that is never
     saved. Checked against css-scopes.txt and reused Tree's rows. Its page.js shows it on a
     live `Page` and a live `Tree`.
  3. *[x] Server objects (Servex, landed 2026-10-06):* `GET /api/objects` runs the same walk on the
     Servex instance, two levels deep, with names, counts and states only, never values. The
     widget reads it when a card says `{"objects": "/Servex/"}`.
  4. *[x] The check (Server/card-check.mjs, landed 2026-10-06):* a state line, a preview of 60 characters or
     less, a checklist, every item ticked on a done card, objects on group and module cards, no
     paragraph over 60 words above the fold, and first mentions linked. It runs in on-landing.mjs
     next to layout-check and text-check, and its failures go to the servex-mastermind day task.
  5. *[x] Pilot, then the rest (landed 2026-10-06):* write the Servex group card (2026/09/24/servex) to the standard with
     state, preview <= 60 chars, objects, and checklist, then did all eight group cards. card-check passes on all eight.
- ~~**An assistant on every page** (2026-09-25, designed by mastermind-servex,
  [design](/framework/ai/sessions/2026/09/24/1c09793f-74b6-4218-82e5-53e5cd88b659/servex-mastermind/page-assistant/), card
  [an-assistant-on-every-page](/framework/ai2/2026/09/25/an-assistant-on-every-page/))~~ — **DONE.** It replaces
  piece 3 (`ask_module`) of "Module agents" above. Servex code, so it needs a restart, and it's
  proven on a private Servex first. Sonnet minions, in this order:
  - [x] *Key by path (Layers.js):* `record()` takes any page path, not just a card id, and the id
        is still `assistant-<last segment>` with a `-2` suffix on a clash. A card stays a page
        whose baseline reads its `page.jsonl`; everything else reads its `readme.md`.
  - [x] *Baseline checkpoint:* per path, spawn once with the assistant skill plus the readme, and
        don't talk to it. Store its session id with a hash of the readme, and rebuild it when the
        hash changes or its transcript is gone (after the 30-day cleanup).
  - [x] *Resume and New session:* Resume continues the path's current session. New session is
        `spawn_agent({resume: baseline, fork: true})`, and the previous session stays listed.
        The 10-minute idle stop and wake-on-message already in Layers apply unchanged.
  - [x] *`ask_module(path, question)`:* a one-shot fork of the same baseline, with read-only
        tools, answering in under 150 words and then stopping.
  - [x] *At most 30 running:* before any spawn, if 30 agents are live, stop the longest-idle page
        assistant first. Never stop a working agent or a mastermind.
  - [x] *The chat on every page:* the dev bar gets a chat tab for the current page, plus an
        optional button a page can place. It reuses the Live card's agent conversation view
        (`POST /api/agents/<id>/message`). Route it: `?chat=<session>` on the page's URL.
  - [x] *Prove it* on three pages (ux/Tree, core/Page, one AI 2 card): open, talk, leave, come
        back, Resume, then New session. Cost per new session measured against a cold start.
        Proven via `Servex/agents/page-assistant-proof.mjs`: baseline forks yield 88.2% cost savings ($0.0159 vs $0.1350).
- ~~**The council hears every ask, and re-runs by itself** (2026-09-25, designed by mastermind-servex,
  [the ask loop](/framework/ai/council/))~~ — **DONE.**
  - [x] *`Server/council.mjs`, the collector:* gathers the owner's words since the last run from
        `.claude/prompts/<day>.jsonl` and from the `prompt` lines (by the owner) in AI 2 card
        `page.jsonl` files. Drops sessions that belong to Servex agents (live `/api/agents`,
        `lifecycle.jsonl`, and task logs). Writes extracted prompts to `<run>/words.jsonl`. Verified:
        642 genuine owner words extracted cleanly into `public/framework/ai/sessions/2026/10/06/feedback-council/words.jsonl`.
  - [x] *The standing brief:* copied and adapted into `public/framework/ai/council/requirements.md`.
  - [x] *The run:* Servex MCP loopback `/mcp` `spawn_agent` creates `task-mastermind` (`feedback-council`).
  - [x] *The rhythm:* `Server/on-landing.mjs` spawns `council.mjs maybe` detached (`windowsHide: true`). Runs after 10 landings or 24h interval with >=1 landing. Off switch `public/framework/ai/council/off` and `COUNCIL=off`.
  - [x] *Vote merger:* `node Server/council.mjs merge <run-dir>` tallies checker verdicts and appends to `public/framework/ai/council/asks.jsonl`. Verified headless read-out on `/framework/ai/council/`.
- ~~**A dictation workspace, better than one text box** (2026-09-25)~~ — **DONE.** Implemented in `public/framework/ux/Dictate/workspace/` (`Workspace.js`, `Workspace.css`, `page.js`). Long dictation grows sentence by sentence into movable, editable cards (`dictate-sentence-item` with `ext/Draggable` grip handle and contenteditable text) while raw Whisper transcript stays synchronized side-by-side. Registered as child tab and concept tile in `public/framework/ux/Dictate/page.js`. Verified in Chromium headless: sentences cleanly split, cards render and reorder, raw transcript logs simultaneously, zero errors.
- **Cost on AI 2 previews and detail pages, and detail pages that fill the page.** Running now
  (task-mastermind-ai2-dashboard).
- **Recipe lab**: one task built three ways (Opus alone, Sonnet alone, five Sonnets), judged
  blind by you. Stopped for budget. [Brief](2026-09-24/recipe-lab/)
- **A page watcher per worktree, and `layout-check.mjs`**: screenshots at four widths, and a
  message to the owning mastermind when a page breaks. Stopped for budget.
  [Brief](2026-09-24/worktree-watch/)
- **Reorganize what's been built**: 12 ranked moves, starting with five imports that must move
  before the prune is safe. [Plan](2026-09-24/inventory/)
- **Merge card kinds**: 75 → 36. The first three merges (`ui-cards`, `ui-pills`, `link-tiles`) **ALL DONE.** Verified with before/after screenshots at 1920/390 and 0 console errors across all 16 target pages.
  [Plan](/framework/ux/Content/plan/) · [brief](2026-09-24/card-consolidation/merges-requirements.md) · [shots index](2026-09-24/card-consolidation/shots/index.md)
- **Small fixes from the feedback council** (2026-09-25, [verdicts](2026-09-25/feedback-council/)),
  each one the owner asked for and the council found unfinished:
  - ~~Live card cold load is 1.7 to 4.6 s (the click is fast): defer the 32k-px `.ai2-rows` render. Said seven times.~~ — **DONE.** Verified in headless Chromium: cold load directly into `/framework/ai2/live/` measures ~480–540ms (well under the <1s target). The 32k-px monolithic DOM render was previously eliminated by virtualizing/filtering active cards via `cards.jsonl` (now only rendering ~16 active/recent cards in the stream, scrollHeight ~899px instead of 32,958px), and the New card/Live landing renders immediately.
  - ~~Landed row preview prints `[object Object]`: stringify the outcome.~~ — **DONE.** `plain()` and `headline()` in `public/framework/ai/rail/inbox.js` now handle objects, summaries, and arrays cleanly without rendering `[object Object]`.
  - ~~Empty AI 2 state says "Pick something on the left": land on Live; Live grid should stretch at 3440.~~ — **DONE.** Overrode `AIRail.empty()` and `inbox_page()` in `ai2/page.js` to eliminate "Pick something on the left", defaulting to Live view overview and direct navigation link. Live grid at 3440 verified stretching with 3-col and 4-col responsive grid tracks in `Card.css`.
  - ~~Rail rows are flush with no gap: round only the stack, or add a gap. Live's `.ai2-rows` and chat log still scroll on their own.~~ — **DONE.** Verified in CSS and headless at 1920 and 3440: (1) Rail rows are wrapped in `.flush-stack` (`ux/Inbox/Inbox.css:25-50`) which explicitly zeros gaps and row corner radii, rounding only the stack's outer ends via `--flush-radius` (preventing pinched notches); (2) Live card's chat log (`.ai2-card-live .chatbox-log`) has `overflow: visible` and `max-height: none` (`Card.css:693-696`), allowing the page column itself to be the unified scroller without trapped nested scrollbars.
  - ~~Live preview says "8 working · 2 tasks running": name what is running. Group bars are solid, not N green segments.~~ — **DONE.** `live_row()` in `ai2/live.js` now specifies running tasks and agents by name with overflow counts. Group progress meters in `ai2/meter.js` render continuous bars (`.ai2-meter-fill`).
  - ~~About page: padding and back-button icon still unchecked; the decisions URL the owner named is a 404.~~ — **DONE.** Verified and proven: (1) `swap_link()` in `Page.class.js` provides `.page-swap.pad` padding (`clamp(1em, 2%, 3em)`) and `.page-swap-back.flex.v-center.gap` with centered arrow icon (vertical align delta <0.01px, visually verified via headless Chromium screenshot); (2) the owner's decisions URL `/framework/ext/Panel/md/doc/decisions/` is 200 OK text/html (113k chars) and scrolls smoothly within `.pages` (tested `scrollTop = 500`), while the council's mistaken probe `/framework/core/Panel/` was the 404.
  - ~~Load AI 2 with Servex stopped and fix what breaks.~~ — **DONE.** Verified headless in Chromium with Servex dead/stopped (`?servex=http://127.0.0.1:59999`): (1) zero unhandled JS exceptions; (2) static card index `ai/cards.jsonl` and card folders load seamlessly; (3) all card rows render in the rail; (4) cards open cleanly and display contents, tags, and notes; (5) dynamic controls like `+ New card` gracefully hide when Servex is unavailable without throwing errors.
  - ~~Skills: one line in `layout` (approved layouts, four widths); a console-error watcher line in `servex-mastermind`; soften non-law `must` lines.~~ — **DONE.** (1) Added approved layouts and four widths check (400, 1200, 1920, 3440) to `.claude/skills/layout/SKILL.md`; (2) added per-worktree console-error watcher to Health in `.claude/skills/servex-mastermind/SKILL.md`; (3) softened non-law instructions to could/should in `.claude/skills/mastermind/SKILL.md` ("Suggestions, not laws").

- **directory.json per folder (later)** (the owner, 2026-09-30): split a big folder's file listing out of its page.jsonl into its own `directory.json`, so page.jsonl stays light. Not now.

## 2. Only you can do

- A Cloudflare login (about 5 minutes).
- The rule for tabs (multi-file work goes to a Servex mastermind): it changes CLAUDE.md.
- Authorize the Gmail connector.
- Say "prune" for the 739 dead files, **after** the five imports above are moved.
- Keep git stash@{0} until that prune lands.
- health.mjs lock is global (Temp/lew42-health.lock): make it per-base.

[Where these came from](2026-09-24/loose-ends/)

## 3. Proposed by agents, not requested

- **The audit's top ten** half-finished tasks: two copies of the board, the health readout not
  in the dev bar, the dev bar's missing chat tab, ask-about-any-element, Make onto ux/Tree,
  the skill trims, two Editor bugs, the /layouts/shell/ hero, four AI 2 items, and a small-fix
  sweep. [Ranked page](2026-09-24/task-audit/)
- **Readmes**: 29 stale, 46 missing. [List](2026-09-24/inventory/)
- **Servex**: the Dispatcher doesn't recognise a revived task mastermind.
  [concurrency](2026-09-24/concurrency/)
- **Names**: make skill name = role = agent id. [names.md](2026-09-24/concurrency/)
- **AI 2**: larger icons; read and unread under your control; a doc opened inside a card has no
  side padding.

- **A guard for `git stash` / `checkout --` / `reset --hard` in the main tree** (mastermind-servex-3, 2026-09-28). The rule is written in three skills and was still broken today: a PreToolUse hook on Bash that refuses these in `C:/Code/lew42/monorepo` (worktrees are fine). Wiring a Bash hook in `.claude/settings.json` is the owner's call.

- **`list_agents` returns every row ever** (mastermind-servex-9, 2026-09-30): 1248 rows, 1.3 MB, on the first call of a fresh mastermind — it blows the context it was meant to inform. Default to live rows (not stopped/gone), with `all: true` for the archive. Also the ledger's `files.jsonl` in pool worktree qf-4 shows 10+ modified `ai/*/files.jsonl` and `public/files.jsonl` — a generator writes into whichever tree it runs in; it should skip worktrees.
- **chat-hitl asks 1 and 3 unmet** (review proof, 2026-09-30): the first review.mjs run on next-chat-hitl found the demo stuck on "marking…" and two of the owner's asks unmet — [report](2026-09-30/review/proof/review/report.md). chat-hitl-2 is landed and stopped; needs an owner (a $5 fix task).
- ~~**Cards: mini-pages wraps 2+1, leaving the page mostly empty at 3440** (review-fix-2, 2026-09-30)~~ — **DONE.** Verified 2026-10-06. Added `.wide` to `grid auto gap` on [`card/mini-pages/MiniPages.js`](file:///c:/Code/lew42/monorepo/public/framework/core/Page/card/mini-pages/MiniPages.js) so cards span wide column boundaries, keeping all three cards in a single row at 1200, 1920, and 3440.
- ~~**Cards: the preview wall still ends 4+2 at 1920** (carried from [review/report.md](2026-09-29/cards-and-logs/review/report.md) item 5, confirmed still open by review-fix-2's own fresh review, 2026-09-30)~~ — **DONE.** Verified 2026-10-06. Sized `--column: 24em` (from 22em) in [`core/Page/card/page.js`](file:///c:/Code/lew42/monorepo/public/framework/core/Page/card/page.js), balancing the 6 cards evenly as 3+3 at 1920px (2+2+2 at 1200, 6 in 1 row at 3440).
- **Cards: no real JSONL log file yet, and the AI 2 Inbox/Log-view-with-status-lights idea** (carried from [review/report.md](2026-09-29/cards-and-logs/review/report.md) item 4 and the 09-30 Inbox ask, confirmed still open by review-fix-2's own fresh review): `Logger.js` has `Logger.JSONL` (in-memory) but nothing writes one to disk yet; the Inbox/status-lights idea is split out at [next-log-view/requirements.md](2026-09-29/cards-and-logs/next-log-view/requirements.md).

- **Merge candidates, when tokens allow** (the owner, 2026-09-30: "put somewhere… a future to do when we have more tokens"). A sweep that recommends things to merge: one Sonnet minion per `core/` directory (Page, View, App, …). Each one loads the readme chain top-down, reads its module, and lists overlaps with other modules as merge candidates, ranked. A mastermind then collects the lists into one ranked page. It's a fan-out, so check the week's usage first. Words: [ai-page/owner-words.md](2026-09-30/ai-page/owner-words.md).
- ~~**merge.mjs leaves the merge uncommitted in the main tree** (mastermind-servex-9, 2026-09-30)~~ — **DONE.** Verified 2026-10-06. The exit path was `threeWay()`: when working tree overlap occurred, `threeWay()` wrote all cleanly merged files to disk and exited 0 without committing. In [`Server/merge.mjs`](file:///c:/Code/lew42/monorepo/Server/merge.mjs), `threeWay()` now stages only the merged files (`git add -A -- <changed>`) and creates a genuine 2-parent merge commit via `MERGE_HEAD` whenever no prior staged edits exist, leaving unrelated working tree dirty files untouched. If prior staged edits exist or commit fails, it unstages and prints a single concise summary line: `left uncommitted in main tree: <files>`.
- **UI: `/framework/ui/` goes under construction for a major overhaul** (the owner, 2026-09-30), once the skill structure for content, layout, UI and navigation is settled; `/framework/styles/` stays the CSS style guide. Words: [ui-skills/owner-words.md](2026-09-30/ui-skills/owner-words.md).
- **Dormancy loose ends** (dormant-idle, 2026-09-30, $5 minion, after pace): `heartbeat_status` wakes a dormant agent just to ask how it is; a message that wakes a dormant agent can briefly push working past the cap of 5 (only spawns wait). Answer status from the saved row; count wakes against the cap or accept the overshoot in a line of doc.
- **AI 2 merges into `/framework/ai/`** (the owner, 2026-09-30: "eventually… merge our AI2 dashboard into the framework slash AI page once it gets up and running… don't do that yet"). After the new AI page and the AI 2 Inbox settle. Words: [ai2-inbox-read/owner-words.md](2026-09-30/ai2-inbox-read/owner-words.md).
- **Task dir before task.jsonl** (voice-dir-404, 2026-09-30, fold into asks-ledger or dispatch, $0 extra): a brand-new task dir exists for a moment before its task-mastermind spawns and writes line 1; AI 2 now tolerates it (one console line, f055b4aa) but the dispatcher could write line 1 itself when it creates the dir, as the CLI launcher does.
- ~~**merge.mjs smoke-tests deleted/moved page.js** (audio-consolidate, 2026-09-30, fold into the merge.mjs $5 item)~~ — **DONE.** Verified 2026-10-06. In [`Server/merge.mjs`](file:///c:/Code/lew42/monorepo/Server/merge.mjs), `autoPages`, `newPages`, `--quick` `pages`, and `reviewGate` now filter out deleted files (`status !== "D"` and `fs.existsSync(path.join(dir, f))`), preventing 404 smoke-test failures and screenshot failures when a page is deleted or moved to a new route. Tested and verified in scratch repository proof.
- ~~**Docs tabs pad twice at 400px** (ai-page, 2026-09-30, $5 minion, after pace)~~ — **DONE.** Verified 2026-10-06. In [`ext/tabs/tabs.css`](file:///c:/Code/lew42/monorepo/public/framework/ext/tabs/tabs.css), added `.page .tabs.vertical > .tab-panel > .page { padding-inline: 0; --gutter-x: 0px; }` inside the `(max-width: 64em)` media query. On phone viewports where the rail flips above the panel, the inner page drops its duplicate side padding, keeping content aligned with the tab strip at 1x gutter (28px instead of 56px). Tested across `tabs`, `Page`, `ui`, `View`, `Doc` at 400px, 1280px, and 1920px; 0 console errors on smoke test.
- **Chat Widget: threads and reactions pass-through** (audio-consolidate 5c1b7d15, 2026-09-30, $3): chat-reactions' rail.js edits were carried onto the Widget (react lines drawn, thread fields reach say()), but the Widget does not pass threads/react into its own thread yet. Whoever resumes chat-reactions starts from 5c1b7d15; detail in ai/sessions/2026/09/30/108a1b36-ed02-4728-bf82-20d7d7053d85/audio-consolidate/left.md.
- ~~**Chat sidebar not in Montserrat** (the owner, 2026-09-30, $3 minion)~~ — **DONE.** Verified 2026-10-06. Measured `getComputedStyle(...).fontFamily` headless across all 5 surfaces (`ext/drawer` AI tab, `/framework/ai2/` cards/live, `/framework/ext/Chat/`, `/framework/ext/Chat/panel/`, `/framework/ux/Dictate/surfaces/`). Root cause was resolved by `drawer-close` (2026-10-02) reparenting premature drawer builds into `.app` upon `window.app.ready`. All controls and thread elements confirmed using `Montserrat, system-ui, -apple-system, sans-serif`.
- **Graded rules pass** (design-code follow-up, 2026-09-30, one task after the 4:50 reset, foundational): every rule on the nine /framework/design/ and /framework/code/ pages gets its grade as first word (probably; always/never only with an earned: date + breakage), the css page gets the top line (probably write no CSS...), and review.mjs reads the grade (never blocks, probably asks why). Brief = ui-skills-proposal.md "Graded rules" + "What stops an agent writing a style". Also from design-code: docs top-tabs and concept tiles on the nine child pages; the 3440 tile wrap; a live Objects instance; one worked example using both; page->design rename.
- ~~**ledger.mjs windowsHide guard false-positives on Servex/Servex.js** (asks-ledger's minion, 2026-09-30, $2)~~ — **DONE.** Verified 2026-10-06. `.claude/hooks/syntax-guard.mjs`'s `hidden_guard` strips comments via `blank_comments` and filters method declarations (`after === "{"`). `Server/window-lint.mjs` aligned with the same comment blanking, method definition filters, and worktree ignore, clearing all false positives across Servex and Server.
- Pool leftovers ($3): decide `worktree/qf-1` (core/Page nav + Make-a-page, unmerged, 14 files) — merge or drop; confirm `worktree/qf-3` (Dictate playground) is superseded by main and drop it; delete `C:/Code/lew42/worktrees/qf-6` once nothing locks it. Notes: ai/sessions/2026/09/30/pool-cleanup/.
- Pool.js ($3): a leftover worktree whose only changes are generated churn (board.jsonl, flags.jsonl, files.jsonl) should be reclaimed by the pool itself, with the diff saved beside the task — today it needed a hand.
- Servex revives a stalled ask's owner ($3, Servex/asks/Asks.js): today stalled.js only marks. On stall, if the owner's directory is live, send_to_agent(owner, "your ask <title> has been quiet N h — report or land", revive:true) once per 6 h per ask, and append {"ask":{"id","status":"stalled","revived_at"}} so the Inbox row can say "Servex is reviving it" (inbox-ext merge 2b reads revived_at; until it exists the row says "flagged by Servex").
- When process-monitor merges (then a Servex restart, mine): add to `.claude/skills/servex-mastermind/SKILL.md` — "On every check, read the last line of `system_health`: our RAM vs. everything else, the top 3 tasks by RAM, the orphan count and the worktree count. `GET /api/processes` has the whole table. See `Servex/doc/processes.md`." — and to `.claude/skills/fans/SKILL.md` first step — "First, `GET /api/processes`: `groups[]` gives CPU % per task and per Claude Code session, `orphans[]` lists leftover waiters." (dormant-idle's finding 4, 2026-09-30.)
- Servex send_to_agent reply_to ($3): with `reply_to: log agent-X`, EVERY later turn of the recipient ends with a "done:" report to X (dormant-idle sent five status pings in 30 min after two messages). A reply_to should answer once — the turn that answers the message — not every turn after it.
- Servex CORS ($2, batch with the stalled-ask revive): POST /card/append on :8090 sends no CORS header when a worktree's port (localhost:5xxxx) calls it — folder-card archives from a worktree do not survive a reload. Details: ai/sessions/2026/09/30/inbox-ext/ai2-hang/profile.md §4.
- Servex: open a task dir for every spawn that has none (`task:` omitted) — then the minion skill's "no brief, no task dir" line goes; the probe loop found every model skipping new-task when the prompt is rough (2026-10-01, $3).
- One serialize system (decided d-one-serialize, 2026-10-01): PageLog class lines; migrate core/Item's file shape (ext/Panel, ext/editor/blocks) to class lines and retire Item.register — wave-B sized, waits on pacing.
- Comment prune (owner 2026-10-12, code skill "Comments: a pointer, not an essay"): `node public/framework/code/patterns/comment-census.mjs` counts 33k comment lines (22%) and 2,888 blocks of 4+ lines in framework JS; worst `ai/v/3/page.js`, `core/Page/Page.class.js`, `ext/drawer/rail.js`, `ux/Dictate/`. Per file: move history to `doc/`, leave one-line pointers. Haiku-sized per file; start with Page.class.js alongside its split plan.
- **Follow-up 2026-10-13 — open work found by `Server/FollowUp.mjs`** (each verified missing on michael/dev; links are the old task dirs with the briefs):
- Proposal class: review, decide, becomes a task; node-led loop; impact-weighted decisions (ask `proposal-budgets-merge-approval-template`); no `Proposal` class exists. [brief](/framework/ai/sessions/2026/09/30/proposal-flow-main-is-production-then-pr/)
- Framework home grids: grids without voids, layout classes and labels ([framework-home-grids](/framework/ai/sessions/2026/10/03/framework-home-grids/framework-home-grids/)); no commits.
- Dictate live state + one engine per tab ([dictate-live-state](/framework/ai/sessions/2026/10/05/dictate-live-state/dictate-live-state/), [dictate-one-engine](/framework/ai/sessions/2026/10/05/dictate-one-engine/dictate-one-engine/)): only briefs landed.
- Feedback council: 23 asks still not re-verified live ([feedback-council](/framework/ai/sessions/2026/10/12/feedback-council-2/)).
- Page templates binding merge: binding.md plus Template fixes never merged; related to the owner-held `michael/property-of` ([page-templates-binding-merge](/framework/ai/sessions/2026/10/12/session-21449a90/page-templates-binding-merge/)).
- Servex small jobs, all queued and never started: [merge-commits](/framework/ai/sessions/2026/10/03/merge-commits/) (commit files left in .merge-landed.json), [spend-shape](/framework/ai/sessions/2026/10/03/spend-shape/) (`spawned_by` on every spawn), [perf-audit](/framework/ai/sessions/2026/10/03/perf-audit/) (Servex/perf.mjs), [worktree-servers-revive](/framework/ai/sessions/2026/10/03/worktree-servers-revive/), [review-empty-diff](/framework/ai/sessions/2026/10/03/review-empty-diff/), [spawn-logs-ask](/framework/ai/sessions/2026/10/03/spawn-logs-ask/), [restart-keeps-agents](/framework/ai/sessions/2026/10/03/restart-keeps-agents/), [pool-unstick](/framework/ai/sessions/2026/10/03/pool-unstick/), [node-reap-run](/framework/ai/sessions/2026/10/03/node-reap-run/), [openrouter-reads-cache](/framework/ai/sessions/2026/10/03/openrouter-reads-cache/).
- Briefs only, no build: [web-benchmarks](/framework/ai/sessions/2026/10/04/web-benchmarks/web-benchmarks/), [message-cost](/framework/ai/sessions/2026/10/04/message-cost/message-cost/), [openrouter-agent-trial](/framework/ai/sessions/2026/10/05/openrouter-agent-trial/openrouter-agent-trial/) (one readme line), [prompt-audit](/framework/ai/sessions/2026/10/08/prompt-audit/prompt-audit/) (unclear; minion idle after $13).
- [session-trace](/framework/ai/sessions/2026/10/03/session-trace/): marked landed but `trace_of_transcript` and its page are not in the repo.

- Rename candidate: [`Server/ai2-overview.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/antigravity-usage.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/archive-sessions.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/ask-each.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/audit.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/browser-check.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/browser.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/card-check.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/collab.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/council.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/crawl.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/day-prompts-refine.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/day-spend.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/decide.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/deploy-count.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/https-cert.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/models-now.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/repo-size.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Server/retire-files.mjs`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Servex/agents/Agents.js`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Servex/agents/brief.js`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Servex/agents/directory.js`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Servex/agents/experts.js`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Servex/agents/hitl.js`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Servex/agents/jobs.js`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
- Rename candidate: [`Servex/agents/registry.js`](/Server/doc/scripts.md) is a function bag or lowercase class; should be a class per the code skill.
