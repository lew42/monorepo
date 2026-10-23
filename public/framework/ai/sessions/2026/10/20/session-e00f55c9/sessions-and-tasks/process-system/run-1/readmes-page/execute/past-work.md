<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Readmes page  Execute" (words: readm, execute)

## Tasks (8, best first)
- 2026-10-20 [Readmes page: Execute](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/run-1/readmes-page/execute/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/run-1/readmes-page/requirements.md
- 2026-10-22 [readme-roles](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/) — Ready to merge, not merged: branch task/readme-roles (3 commits). - ✅ CLAUDE.md 3,763 → 1,319 words; framework rules are one line each in [the framework readme](/framework/readme.md), long form in [doc/rules.md](/framework/doc/rules.md) - ✅ Six role readmes: …
- 2026-10-20 [session-class-readme](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/session-class-readme/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/session-class-readme/requirements.md
- 2026-10-19 [Documentation: every main system's readme states its structure and ho…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/docs/) — Readmes now state structure and function. Every main system's readme states its structure and how it works: ai, ai/sessions, ai/tasks, AITask, Inbox, core/Page, Servex rewritten (framework/readme.md indexes them). No history in them: old text moved to doc/rea…
- 2026-10-17 [drawer: the README links its architecture doc](/framework/ai/sessions/2026/10/17/cards/drawer-readme-arch-link/) — doc/architecture.md was linked only as a lone bullet under a trailing '## More' and was the one doc in doc/ missing from the README's own '## Doc topics' index. Promoted to the front of that index with a one-line description; the orphan '## More' block droppe…
- 2026-10-15 [framework/ai: readme smoke-test rule, logging, tags, asked-for summary](/framework/ai/sessions/2026/10/15/voice-20261015/ai-system/) — Rule added to the mastermind skill; framework/ai readmes audited (3 fixes, rest listed); append.mjs now stamps every line; in-memory query exists (SessionIndex + ext/Query), tags recommended; node Server/Asked.mjs answers 'didn't I ask for X?'. · paths 1/1 exist
- 2026-10-13 [Readmes: all under 100 lines, every module indexed](/framework/ai/sessions/2026/10/12/session-87bec773/readme-audit/) — Readme audit landed on michael/dev — 13 oversized readmes trimmed to under 100 lines, 93 unlisted modules now indexed, dead links 41 down to 26. Bodies moved verbatim to doc/; nothing lost. Script lists line counts, dead links, unindexed modules: audit.mjs, r… · paths 1/2 exist, gone: framework/ai/handover
- 2026-10-13 [How a page renders: one plain doc under core/Page, linked from the re…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/page-rendering/) — core/Page/doc/how-a-page-renders.md answers the owner's question (classes + helpers write the DOM; page.jsonl deltas replay into blocks on top), linked from the Page and framework readmes (7e3c10b23). Landed by the mastermind from the agent's own answer and t…

## Docs and readmes
- [AITask — the API (moved from the readme)](/framework/ai/AITask/doc/api.md) — <!-- moved verbatim from readme.md lines 4-72, 2026-10-12 readme audit --> js framework/ai/<date>/<slug>/page.js import { AITask, md } from…
- [ai — the page tabs, in full (moved from the readme)](/framework/ai/doc/readme-full-2026-10-12.md) — <!-- moved verbatim from readme.md lines 5-13, 2026-10-12 readme audit --> The page has three tabs: - Inbox (the default): a rail of what n…
- [What every agent reads, the roles, and a readme audit (prop…](/framework/ai/doc/readme-system.md) — The owner's ask: rules get lost because nobody is sure which files each agent reads. Measured below; the moves are proposals until the owne…
- [AI system docs: the index](/framework/ai/doc/readme.md) — One folder per subsystem, one current doc per topic. Load the folder you need; the rest costs nothing. Superseded files sit in [archive/](a…
- [Readmes: the detail behind CLAUDE.md](/framework/ai/doc/readmes.md) — The root [CLAUDE.md](/CLAUDE.md) keeps the rules for readmes (a short index, the iceberg, the memory). The extra detail that used to sit be…
- [ai — the watch-out list (moved from the readme)](/framework/ai/doc/watch-out-2026-10-12.md) — <!-- moved verbatim from readme.md lines 64-103, 2026-10-12 readme audit --> - Agents put work you didn't ask for into [todo.md](todo.md) r…
- [Models: which agent runs on what](/framework/ai/models/readme.md) — The table is drawn from now.json, which node Server/ModelsNow.mjs --write computes (roles.js, the live registry, the OpenRouter spend log, …
- [AI — the folder where the AI system's records live and the …](/framework/ai/readme.md) — Priorities now: [priority.md](priority.md) — the ranked list every mastermind reads before it spawns. Who does what: [doc/readme-system.md]…

## Owner asks
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (servex-mastermind-opus, landed)

## Commits
- a4d3b79a0 Dictate: real mic feedback + subclassable variants (deliverables 3-4)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 41,923 tokens of reading, under the 100k limit).

Question: Readmes page: Execute

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Readmes page: Execute"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
