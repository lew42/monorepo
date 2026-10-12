# Plan of action — AI system, 2026-10-08

Ordered by value over cost, quick first. Source: [findings.md](findings.md), [systems-map.md](../../../../../../systems-map.md). Nothing here is built yet unless marked done.

## 1. Quick (a few lines each, no spawn needed)
- **Done:** System tab as class cards, SDK page, systems map, iceberg readmes, task-queue section.
- Write `ai/doc/meta/history.md` (evolution log, links only). One edit, one commit.
- Make the System tab's Servex card AI-focused: `class_cards(["Servex","Agents","Dispatcher","Sessions","Pool","Usage","Budget"])` first, the rest folded.
- Name the three "inboxes" (page inbox, agent inbox file, owner's inbox cards) in `ai/readme.md`, each linking its doc.

## 2. Tune the whole Servex docs set (most loose ends cluster here)
Servex readme is 388 lines, `Servex/agents` 289, with a name clash on "heartbeat" still open. Plan: a Haiku pass cuts each readme to an index under 100 lines, moving detail into `doc/` (additive, nothing deleted). Then `check-classes.mjs` re-verifies the class cards.

## 3. Cost of every agent turn
The `mastermind` skill is 47 KB (~12k tokens) on top of CLAUDE.md. Split it into a short core plus on-demand sections. Needs the skill owner's approval; propose, do not apply.

## 4. Tasks: one queue
Today five stores hold tasks. Recommendation and the alternative are in [systems-map.md](../../../../../../systems-map.md). First step is a node script that lists open tasks from the task folders; the board and queue are then views of it.

## 5. Sessions and inbox cards
Wrap inbox cards in session context cards once `minion-session-class` lands its class. Not before: it owns those files.

## 6. Streaming and polling
The dashboard Now card has no message timestamps and the Log page is not yet a real-time stream. Start only with pace comfortable (currently 5 points under): Log stream first, then Now timestamps, then Inbox.

## 7. The website shows everything (the long-term fix for "I miss what landed")
Source: [website-shows-everything-2026-10-08.md](../../../../../../doc/design/website-shows-everything.md). Plan only; no template changes now. First candidates, in order:
1. **Recently landed** index page, computed by script from `git log` and each `task.jsonl` (newest first, every row linked). Cheapest and most valuable; one Sonnet coder or me.
2. **One index page per major system** from [systems-map.md](../../../../../../systems-map.md), each a wall of previews that links its readme.
3. **Demos that show instead of describe**, starting with the System tab class cards already built.

## 8. Docs-only items folded in from the task audit
Source: [task-audit/plan.md](../../../../../../2026-10-08/task-audit/plan.md) (354 loose ends; its agent ended without landing).
- **JSONL backlinks:** link the 39 JSONL docs with no backlink to one overview, `core/Page/doc/jsonl.md` (list in `task-audit/doc/jsonl-map.md`). Haiku, additive links only.
- **Session-shape gaps:** old sessions lack name, tags, effort, parent link and closed state (`doc/session-shapes.md`); cost must be summed by script. Doc only; goes to `minion-session-class`, which owns sessions.
- **Transcription conglomerate page** (Dictate, Whisper, Chat, Refine), cross-linked from the Servex docs. Haiku proposes, I commit.
- **Missing `/framework/ai/models` page:** small Sonnet coder task; I am not building it, so it is free to take.
- Where a system has many open items (transcription, AI), do the docs index first, pick the top three, and mark the rest superseded with a reason.

## 9. Inbox, Log and streaming (stage 1 done)
Findings: [inbox-log-streaming-findings-2026-10-08.md](../../../../../../doc/logs/inbox-log-streaming.md). The Inbox class exists (`core/Page/ext/Inbox/`); creation likely "broke" because `board.jsonl` has been dead since 10-04 and the rail refreshes every 20 s; unread is per browser (`localStorage`).
**Default:** converge on `ext/JSONL` `live()` plus the dev-server socket. Order: (1) replace the `ai2/live.js` pollers with file tails, (2) make read state a shared `read` event on the card, (3) retire `board.jsonl`. **Alternative:** one multiplexed Servex `/api/stream`. Step 1 is a bite-sized Sonnet coder task once `ai2/` is free of other agents; first confirm by creating one card with the tool and timing when it shows.
Also from the owner's layout questions: [ai2-merge-and-layout-proposal-2026-10-08.md](../../../../../../doc/ai2/ai2-vs-ai.md) (port ai2 into ai with stubs; keep the hybrid date layout; two-line slug fix for the Servex owner).

## 10. Why agents write function bags (the `code` skill review, 2026-10-08)
**Cause, in order of weight:**
1. **The skill never said it.** The old `code` skill (18 lines) said "assign-based OOP" and pointed away; "one class per file", "no loose functions" and "a page is a class" were nowhere in it.
2. **The docs contradicted the rule.** `code/patterns/readme.md` said a lowercase file "holds functions, helpers or views", which blesses the bag. `new-page`'s blessed `page.js` is a script of bare calls (`content(){ p("Body.") }`), so every page grows inline helpers.
3. **The rule sits in CLAUDE.md among about 30 others,** and a skill that only points means the agent follows its neighbours instead. The neighbours are bags: 286 files hold 3+ loose functions and no class, 97 of them `page.js` (`ai/sessions/page.js` 1,428 lines, `ext/Chat/Chat.js` 1,018, `ext/Session/Session.js` has 17 functions and no class despite its name).
4. **The only census checked file-class naming, not bags.**

**Done (small, clearly right):** rewrote `.claude/skills/code/SKILL.md` as a six-point rule first (one class per file, helpers are methods or statics, a page extends `Page` and `page.js` stays tiny, check a neighbour is a class before copying it); fixed the contradicting line in `patterns/readme.md`; added `code/patterns/function-bag-census.mjs`, which ranks the backlog (run it for the list; top: `ai/sessions/page.js`, `ext/Chat/Chat.js`, `ext/AITask/dashboard.js`, `ext/DesignTool/ratios.js`, `ext/Session/Session.js`).
**Not done, for a coder task:** the `new-page` skill's `page.js` shape still shows bare calls; change it to "import a class and instantiate it" once a template class exists (`class System extends Page` is the first candidate). Refactors themselves: top-10 files above, one Sonnet coder each, no refactor now.

## Blockers
- The pool cannot make a worktree for minions, so no Sonnet coder can be spawned yet; items 1 to 3 wait for it or I do them by hand with `worktree-up.mjs`.
- No spawns made, so `spawns.jsonl` is empty by design.
