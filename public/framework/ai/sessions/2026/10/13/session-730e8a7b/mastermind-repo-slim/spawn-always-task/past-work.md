<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Every spawn has a task dir  a spawn without a  task  option gets one opened by Servex  so no agent is ever outside the one state" (words: every, spawn, ha, task, dir, without, option, get, one, opened, servex, agent, ever, outside, state)

## Tasks (8, best first)
- 2026-09-29 [readme_chain(dir): every directory-bound agent starts already knowing…](/framework/ai/sessions/2026/09/29/readme-chain/readme-chain/) — What landed — a fresh agent Servex spawns FOR a directory or a page now opens with the readme.md chain from the repo root down to it, in order, so it knows "where it is" before its first turn. readme_chain(dir) helper next to brief.js, root-down, trimmed to f… · paths 3/3 exist
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-09-28 [Fresh-eyes review: a new agent checks every task before merge](/framework/ai/sessions/2026/09/28/b6fa1bc1-fad0-4bdd-9b20-8cd1cd20afb4/fresh-eyes-review/) — A fresh agent now reviews every task before it merges, sized by the diff — none / light (Sonnet) / full (Opus, with screenshots). Reviewed: 10 fixed, 2 declined — [review.md](/framework/ai/2026-09-28/fresh-eyes-review/review.md) Review built into the task sys…
- 2026-10-13 [Voice and chat surfaces: one permanent page showing every surface](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-surfaces/) — Page /framework/ux/Dictate/surfaces/ shows 9 surfaces (screenshot, where, renderer file, who answers, log), one flow diagram and the session model. 5 duplicates found (3 conversation stores, 3 Refine-stage writers, New session button built 3 times, ext/Ask/ch… · paths 1/1 exist
- 2026-09-24 [Every task shows what it cost](/framework/ai/sessions/2026/09/24/ai2-cost-fill/task-cost/) — Every task now shows what it cost in dollars, including its minions, and the day and each effort show their totals. - See it: the [day page](/framework/ai/2026-09-24/) reads "$202.87+ today", with one total per effort (ai log $115, servex $29, pages $22 …). E…
- 2026-10-08 [Task audit: every task categorised, every loose end has a fix and a v…](/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/) — Audit landed: 1,303 tasks categorised, 244 open loose ends each with a suggested fix and a verdict. Loose ends listed with a fix per row: [by-system.md](/framework/ai/2026-10-08/task-audit/by-system.md), 54 now, 145 later, 43 superseded, 2 in-flight Prioritis…
- 2026-10-02 [The card pipeline: every major ask gets a readable card, by node](/framework/ai/sessions/2026/10/03/card-pipeline/card-pipeline/) — Every major ask now gets a real card, written by code — the owner's dashboard explains why each score is what it is. Ask -> card, by node: is_major()/ensure_card() on every 60s tick. 3 of today's 4 named asks got a real card just now; the 4th already had one.… · paths 2/5 exist, gone: framework/ai2/2026/10/02/page-extends-item-one-set-persistence-in/ framework/ai2/2026/10/02/ext-panel2-header-toolbar-main-with-side/ framework/ai2/2026/10/02/ai-system-docs-the-system-tab-now-explai/
- 2026-10-02 [Stalled tasks + budget vs actual: Servex/asks/tasks.js writes tasks.j…](/framework/ai/sessions/2026/10/03/stalled-and-budgets/stalled-and-budgets/) — public/framework/ai/tasks.json exists now, regenerated every ~60s. stalled check: 32 of 149 tasks stalled now, e.g. openrouter-harness (owner agent stopped) snooze/kill/re-prioritise verb lines + 3 Servex tools budget vs actual: 8 of 149 tasks have a Budget: …

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 514 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Chat](/framework/ext/Chat/) — used by 10 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme

## Docs and readmes
- [One state of everything](/framework/ai/doc/one-state.md) — What you asked for (2026-10-17, 22:50): one coherent data structure, sessions plus module tasks, that represents the current state of every…
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/readme.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [The Inbox tab: every page has one, unread first, archive to…](/framework/core/Page/doc/inbox-tab.md) — Ask (the owner, 2026-10-12): "Every core thing, every module should have an inbox ... a secondary tab ... read it, then archive or clear it…
- [Router — everything between "a url changed" and "the DOM re…](/framework/core/Router/readme.md) — ## Use html <a href="/docs/intro/">Intro</a> That is the whole API. Each url segment is one page.child(name), a miss is an import, and a ur…
- [chat.js — one chat box, one conversation, every surface](/framework/ux/Dictate/doc/chat.md) — Before this file, every place that showed a chat box on the site — the mobile ✦ sheet, the desktop ☰ drawer's AI tab, a card's own sidebar,…
- [Page health — is it working? After every change, the pages …](/framework/ai/health/readme.md) — ## Use Run node Server/health-supervisor.mjs. It keeps one Server/health.mjs per tree alive, and that loads pages from HEALTH_BASE, the own…

## Sessions tagged with these words
- 2026/10/15 [Spawn policy review](/framework/ai/sessions/2026/10/15/session-e94bf72b/) — kind/agent model/opus work/read-only task/spawn-policy servex/policy · $0.60
- 2026/10/15 [Remote full registry](/framework/ai/sessions/2026/10/15/session-d75b6d76/) — kind/agent model/sonnet work/read-only task/remote-full-registry servex/remote-tools · $0.14
- 2026/10/15 [Voice MCP directives](/framework/ai/sessions/2026/10/15/session-92760713/) — kind/owner model/sonnet mod/servex task/voice-mcp-directives servex/remote-tools · $0.35
- 2026/10/15 [Spawn policy review](/framework/ai/sessions/2026/10/15/session-50064889/) — kind/agent model/opus mod/ai/sessions task/spawn-policy · $0.82
- 2026/10/14 [Clarity voice connector](/framework/ai/sessions/2026/10/14/session-9a02d4eb/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim servex/voice · $0.15
- 2026/10/14 [Clarity r2-archive](/framework/ai/sessions/2026/10/14/session-4085644e/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim servex/policy · $0.14

## Owner asks
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (servex-mastermind-opus, landed)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)

## Commits
- 9c498b6c7 Servex: write past-work.md at spawn, so every new task starts from what already exists
- 9e947fcd7 sheet step 8: page hand-off from the global chat
- d13bdc643 Servex: spawn_agent defaults parent to the caller (ctx.caller), per the owner's parent/child requirement
- 7b2f023d6 sessions: the fallback now actually fires on a real refusal (last_error, not just error: wakes)
- e58e7ba85 sessions: fix local backend leaving smart on Claude, double-counted tail, add one-way site-wide fallback
- d0122f83b sessions/agents: fix env-drop on the default path, re-root the sdk.env trap, correct cost math, prove the fal…
- d6f71fc76 openrouter-cost-blind: price each call from its own usage.cost, gate 3 unpriced calls, pause spawns until pro…
- 628cd9a53 never-lose-a-wake: close every way a wake message could vanish

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: Every spawn has a task dir: a spawn without a `task` option gets one opened by Servex, so no agent is ever outside the one state

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Every spawn has a task dir: a spawn without a `task` option gets one opened by Servex, so no agent is ever outside the one state"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
