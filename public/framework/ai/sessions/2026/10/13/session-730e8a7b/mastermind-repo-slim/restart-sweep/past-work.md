<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The restart recovery sweep never touches an agent that started after the restart or has not had a turn yet" (words: restart, recovery, sweep, never, touch, agent, started, after, ha, not, had, turn, yet)

## Tasks (8, best first)
- 2026-10-13 [Git status: the log sweeper now covers every record kind; a Servex re…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tidy-git-status/) — The sweeper's allowlist is widened and today's dirty records are committed; it runs only after a Servex restart. Landed by the mastermind from the agent's own answer (the agent ended without a landing line). LogSweeper ALLOW widened (sessions day index.json, …
- 2026-09-29 [readme_chain(dir): every directory-bound agent starts already knowing…](/framework/ai/sessions/2026/09/29/readme-chain/readme-chain/) — What landed — a fresh agent Servex spawns FOR a directory or a page now opens with the readme.md chain from the repo root down to it, in order, so it knows "where it is" before its first turn. readme_chain(dir) helper next to brief.js, root-down, trimmed to f… · paths 3/3 exist
- 2026-10-03 [Servex: dev-server RAM leak reaped, and the hand-started-server leak …](/framework/ai/sessions/2026/10/02/node-reap/) — Reaped now, then guarded against it happening again. Reap now: 60 node processes/2319MB -> 16/859MB, freed 1460MB. result.json. Server stops on pool-return or landed task: already built (Worktrees.js/Pool.js, 2026-10-01); this run's reasons prove it. Idle, no… · paths 1/1 exist
- 2026-10-01 [Local AI phases 2+3: Servex runs llama-server as a model provider](/framework/ai/sessions/2026/09/24/servex-mastermind-opus/local-ai/) — Servex talks to a model on this machine's own GPU — merged, restarted, and verified live (a real reply came back from llama-server through the Claude Agent SDK after the restart). checked first (Phase 3 ask 2): llama-server already speaks the Anthropic Messag… · paths 2/2 exist
- 2026-09-29 [Lifecycle: a reaper closes what finished tasks leave running](/framework/ai/sessions/2026/09/29/3c88ad4d-b2e6-4899-b5c4-fbca0e2674e2/lifecycle/) — A reaper now closes what finished tasks leave running. Before → after: servers 20 → 7, run.js 13 → 6, node 45 → 26, idle agents 14 → 4. a creation log: lifecycle.jsonl, [doc](/Servex/doc/lifecycle.md) the study: [page](/framework/servex/lifecycle/): 29 tasks … · paths 1/1 exist
- 2026-09-29 [node_modules: found what emptied it, guards so it can't again](/framework/ai/sessions/2026/09/29/8e50318b-7bf9-4e51-bedd-b91580b96caa/node-modules-guard/) — Cause proven, and four guards so a worktree can never empty node_modules again. name the cause: a mastermind hand-linked both node_modules into main with mklink /J, then ran git worktree remove --force at 13:46:47, and git deleted through the links. [cause.md…
- 2026-09-29 [Drawer chip: selected-element context never reached the card-assistant](/framework/ai/sessions/2026/09/29/7eedf4fd-044f-49b9-ae35-8ed667240d78/chip-context-fix/) — Fixed and merged to michael/dev: the drawer's "this code block ✕" chip now reaches the assistant. find where the chip's data is dropped — one function, post_card() in [ext/drawer/tabs/ai.js](/framework/ext/drawer/), called card_prompt(re, entry.text, entry.vi… · paths 2/3 exist, gone: framework/ai2/2026/09/29/layout-explorer-3-columns-and-a-study-of/
- 2026-09-29 [Servex: follow(path) tells agents what changed](/framework/ai/sessions/2026/09/29/follow/) — follow(path) is live: Servex watches a file or folder and sends each burst of changes to the agents that asked, as one message. follow / unfollow tools: live, follow("public/") refused one watcher, many subscribers: 20 lines in 1 s arrived as 1 message, in or…

## Modules that exist now (files outside the module that import it)
- [ext/Chat](/framework/ext/Chat/) — used by 10 files

## Docs and readmes
- [Handover as a query — a plan, not yet built](/framework/ai/doc/handover-query.md) — Status: plan only. Nothing here is built until the owner has seen it. Asked by voice, 2026-10-16 (question 37d0025a); task: [handover-query…
- [Extensions — a page.jsonl line turns a small piece of behav…](/framework/core/Page/ext/readme.md) — See it running: [this page](/framework/core/Page/ext/) — its own page.jsonl has one line, {"ext": "Inbox"}, and two {"inbox": …} messages. …
- ["Nothing to refine yet" with a transcript on screen (2026-1…](/framework/ext/Refine/doc/nothing-to-refine-2026-10-09.md) — Cause. RefineDemo gave Dictate $input: () => this.$box.el — the raw element. Dictate reads .el on what it is given (push_to_target), so eve…
- [The changes to core this model needs, written down and not …](/framework/core/Page/navigation/model/doc/core-changes.md) — Status: proposed, not made (2026-10-14). These four edits would move the [navigation model](../readme.md) from a demo into core. Each touch…
- [Claim — a tab claimed by an agent: a ring around the viewpo…](/framework/dev/Claim/readme.md) — ## Use mcp__site__claim tab: "3e83f2c0", note: "<task-slug>" — ring the tab you drive mcp__site__release tab: "3e83f2c0" — when the task la…
- [Mic.js notes](/framework/ext/Chat/doc/mic-notes.md) — The long comments pruned from Mic.js (2026-10-12), kept word for word, one heading each. The code points here with // see doc/mic-notes.md#…
- [Sizing — what a panel can be told about its own size, and w…](/framework/ext/Panel/doc/sizing.md) — A panel is a div in flow. Its height is what it holds, never below a floor; its width fills. Adding a split, a section or more text grows t…
- [log — how objects write down what they do (ideas, not built)](/framework/log/readme.md) — The owner's direction (2026-10-05, dictated; the session page of VS Code tab 60d9def6 has the full words): any object can log anything, and…

## Sessions tagged with these words
- 2026/10/15 [Cloudflare MCP server fact check](/framework/ai/sessions/2026/10/15/session-d8658310/) — kind/agent model/haiku work/read-only · $0.13
- 2026/10/13 [Minion arch styles system](/framework/ai/sessions/2026/10/13/session-ff432476/) — kind/agent model/haiku mod/styles/system task/mastermind-repo-slim docs/architecture · $0.16
- 2026/10/13 [Core List architecture](/framework/ai/sessions/2026/10/13/session-fa932cf9/) — kind/agent model/haiku mod/core/list docs/architecture · $0.21
- 2026/10/13 [Servex mastermind setup and oversight](/framework/ai/sessions/2026/10/13/session-f9ad7b59/) — kind/agent model/haiku work/read-only · $0.07
- 2026/10/13 [ext/tabs architecture documentation](/framework/ai/sessions/2026/10/13/session-f9024369/) — kind/agent model/haiku mod/ext/tabs task/mastermind-repo-slim docs/architecture · $0.21
- 2026/10/13 [Core/Search architecture](/framework/ai/sessions/2026/10/13/session-f7d87dba/) — kind/agent model/haiku mod/core/search task/mastermind-repo-slim docs/architecture · $0.21

## Owner asks
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Monitor: a Playwright agent on main; template changes get console + screenshot + stall ch… (mastermind-servex (10 PM, first in the task), queued)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, dropped)

## Commits
- e9e79cc3f todo: restart-recovery sweep kills a fresh spawn; respawn logged

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: The restart-recovery sweep never touches an agent that started after the restart or has not had a turn yet

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The restart-recovery sweep never touches an agent that started after the restart or has not had a turn yet"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
