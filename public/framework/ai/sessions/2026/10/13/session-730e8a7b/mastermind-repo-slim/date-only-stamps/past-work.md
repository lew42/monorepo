<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "A date only stamp never shifts a landing to the previous day  Day of reads  YYYY MM DD  as a local day  and the append hook fills a missing time" (words: date, only, stamp, never, shift, land, previou, day, read, yyyy, local, append, hook, fill, miss, time)

## Tasks (8, best first)
- 2026-10-17 [Socket: a phone may run read-only queries, so Last landed and Waiting…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/mobile-socket/) — A LAN peer can now ask the socket for the task tree; commands are still refused. one list in [Socket.js](/framework/dev/Socket/): LAN_OK gains query, and LAN_QUERY names the only two sources a phone may ask (sessions, tasks); rule in [lan.md](/framework/dev/S… · paths 1/1 exist
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-10-13 [date-only-stamps](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/date-only-stamps/) — public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/date-only-stamps/requirements.md
- 2026-10-13 [Asks tally: 859 asks, 309 features, what landed and what never did](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/prompt-outcomes/) — [Your asks, tallied](/framework/ai/doc/asks-outcomes.md): 859 asks in 1,990 of your prompts since 09-15, grouped into 309 features. 101 done, 118 partly, 90 with no evidence. Asked most, not finished: 1. session system: 47 asks, partly 2. task system: 33, par…
- 2026-10-13 [Readmes: today's pages reachable, a reach script, the Server readme t…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/readme-upkeep/) — Every page that landed today is linked from its readme; Server/readme-reach.mjs checks it; the skills proposals doc is linked; the Server readme's body moved to its doc. Commit ba73481e9. Landed by the mastermind from the agent's own commit (the agent ended i…
- 2026-10-13 [Inbox: one record per thing, and the inbox as a timeline of big things](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-data/) — [The inbox timeline](/framework/core/Page/ext/Inbox/timeline/) is live: 1,096 things built and 70 for you, newest and most urgent first, each opening beside the rail with its card's chat. ![detail with chat](shots/localhost-61253-framework-core-Page-ext-Inbox… · paths 1/1 exist
- 2026-10-04 [Day cards: Today/Yesterday pins, by-time and by-system views, confide…](/framework/ai/sessions/2026/10/04/day-cards/day-cards/) — Landed — Today and Yesterday cards pinned in the AI inbox, each its own day page. Today/Yesterday pinned like Now, each own URL: /framework/ai2/ Day summary (cost, tasks, prompts refined) — /framework/ai/2026-10-04/ Two views + toggle, by time (default) and b… · paths 1/1 exist
- 2026-10-02 [The card pipeline: every major ask gets a readable card, by node](/framework/ai/sessions/2026/10/03/card-pipeline/card-pipeline/) — Every major ask now gets a real card, written by code — the owner's dashboard explains why each score is what it is. Ask -> card, by node: is_major()/ensure_card() on every 60s tick. 3 of today's 4 named asks got a real card just now; the 4th already had one.… · paths 2/5 exist, gone: framework/ai2/2026/10/02/page-extends-item-one-set-persistence-in/ framework/ai2/2026/10/02/ext-panel2-header-toolbar-main-with-side/ framework/ai2/2026/10/02/ai-system-docs-the-system-tab-now-explai/

## Modules that exist now (files outside the module that import it)
- [ext/Timeline](/framework/ext/Timeline/) — used by 5 files
- [ui/timeline](/framework/ui/timeline/) — used by 9 files

## Docs and readmes
- [JSONL — append-only .jsonl logs the AI blindly appends to, …](/framework/ext/JSONL/readme.md) — > ⚠ Converge (the owner, 2026-10-02): file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [e…
- [Research — a question dug by several minions into append-on…](/framework/ext/Research/readme.md) — Two shapes, one module. A topic is one question argued to a verdict, then closed. A program is several subjects dug continuously and never …
- [Research architecture — append-only files, validated in cod…](/framework/ext/Research/doc/architecture.md) — Research lets several minions dig a question into append-only log files that a page renders as they grow. Two shapes share one module: a to…
- [Push-to-talk stream — Discord-style, local only](/framework/audio/v1/push-to-talk/readme.md) — PushToTalk opens a MicStream while its button (or Space) is held, and hands the raw MediaStream to whoever is listening through on_start(st…
- [Timeline — a general h/v timeline (CSS-var positioning, gre…](/framework/ext/Timeline/readme.md) — ## Use js import { Timeline } from "/framework/ext/Timeline/Timeline.js"; new Timeline({ orientation: "h", zoom: 6, items: [ { from, to, la…
- [Dev — the local-only tier: live reload, the DevBar rail, ta…](/framework/dev/readme.md) — ## Index [Claim](./Claim/) — a ring and label around a browser tab an agent has claimed, so you can see which tab is theirs [DevBar](./DevB…
- [Ask — talk to a Claude Code session from the browser; for p…](/framework/ext/Ask/readme.md) — ## Use js import { ask, available } from "/framework/ext/Ask/Ask.js"; if (available()) { const { text } = await ask("Name the three widest …
- [CSSDoc — every CSS rule that lands on one element, read out…](/framework/ext/CSSDoc/readme.md) — A human writes *why a rule exists*. A human must never write a declaration, a selector, a layer, a file name or a computed value — those ar…

## Sessions tagged with these words
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/15 [AI system requirements review](/framework/ai/sessions/2026/10/15/session-13eaee4d/) — kind/owner model/sonnet mod/ai/sessions mod/.claude/hooks/append mod/server task/ai-system · $3.08
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard, queued)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (servex-mastermind-opus, landed)
- 2026-10-18 Logs: validated writes only; shell appends to .jsonl blocked (?, tracked)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)

## Commits
- e151cfc4d mastermind: clarity-one-pass closed from the merge; date-only-stamps brief (dashboard showed 6 of 9)
- a178ce2fd Sessions: honest Stop/Duration, real date-path rows, fix the 1200 squeeze
- 4aa3a71ca core/Task: a DOM-free unit of work — the base state-machine class
- 9cf225e03 Course correction: a stalled ask is an Inbox row, not a second view

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: A date-only stamp never shifts a landing to the previous day: Day.of reads `YYYY-MM-DD` as a local day, and the append hook fills a missing time

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "A date-only stamp never shifts a landing to the previous day: Day.of reads `YYYY-MM-DD` as a local day, and the append hook fills a missing time"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
