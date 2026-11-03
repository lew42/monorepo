<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Agent context  a map of what each agent is given and loads  and a plan to make it visible" (words: agent, context, map, each, given, load, plan, visible)

## Tasks (8, best first)
- 2026-10-20 [agent-context](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-context/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-context/requirements.md
- 2026-10-17 [Voice: one assistant places each sentence as you talk](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/) — Your words stay where you said them; each sentence can be placed by one line. Plan: [voice-assistant.md](/framework/ux/Dictate/doc/voice-assistant.md). Review: reviewed: pass, 7 notes answered ([review.md](review.md)). plan first, with ask 1 answered: the pla…
- 2026-10-15 [AI: tool context bloat, collapse plan](/framework/ai/sessions/2026/10/15/voice-20261015/tool-collapse/) — Plan only, nothing built or restarted. The 81 Servex tools are about 18,000 tokens per Servex-spawned agent; 65 were called in 14 days, 16 never. First step: scope tools by role, no new tool, one restart. [tool-collapse.md](../../../../../doc/tool-collapse.md…
- 2026-10-14 [Scripts: the last four function bags are classes; two Servex cores ha…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/scripts-rename-5/) — AskEach, Browser, Collab, Decide are classes (merged fe2728518, case fix after); callers relinked, outputs identical to the old files, undo proven on a copy; Agents.js and directory.js have a plan in Servex/agents/doc/class-plan.md, decision d-agents-director…
- 2026-10-09 [Agent rules: contradictions fixed, CLAUDE.md cut proposed](/framework/ai/sessions/2026/10/09/session-a07780b9/system-architect/) — Agents carried rules that contradicted each other; 8 skills are fixed, and the owner's follow-ups are in the skills. load measured, contradictions found and fixed: [the page](/framework/ai/2026-10-09/system-architect/), [doc/findings.md](/framework/ai/2026-10…
- 2026-10-07 [Token accounting: fixed the real undercount (144/145 project folders …](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/) — Found and fixed the real accounting bug, and planned the realtime sessions page. Found it — [findings.md](/framework/ai/2026-10-07/token-accounting/findings.md): a case-sensitive match hid 144 of 145 worktree folders from the cost ledger; readers fell back to…
- 2026-09-29 [readme_chain(dir): every directory-bound agent starts already knowing…](/framework/ai/sessions/2026/09/29/readme-chain/readme-chain/) — What landed — a fresh agent Servex spawns FOR a directory or a page now opens with the readme.md chain from the repo root down to it, in order, so it knows "where it is" before its first turn. readme_chain(dir) helper next to brief.js, root-down, trimmed to f… · paths 3/3 exist
- 2026-09-29 [Drawer chip: selected-element context never reached the card-assistant](/framework/ai/sessions/2026/09/29/7eedf4fd-044f-49b9-ae35-8ed667240d78/chip-context-fix/) — Fixed and merged to michael/dev: the drawer's "this code block ✕" chip now reaches the assistant. find where the chip's data is dropped — one function, post_card() in [ext/drawer/tabs/ai.js](/framework/ext/drawer/), called card_prompt(re, entry.text, entry.vi… · paths 2/3 exist, gone: framework/ai2/2026/09/29/layout-explorer-3-columns-and-a-study-of/

## Docs and readmes
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Rules — the layout dos and don'ts, one page each, with live…](/framework/styles/rules/readme.md) — ## Use Each rule is a url — cite it in a review instead of quoting it: /framework/styles/rules/nesting/. Reading order: Cascade → Proportio…
- [The voice assistant: one assistant places each sentence as …](/framework/ux/Dictate/doc/voice-assistant.md) — What it is. One plain assistant, the voice assistant, listens to a voice session. Each time you finish a sentence, your words are already s…
- [What every agent reads, the roles, and a readme audit (prop…](/framework/ai/doc/readme-system.md) — The owner's ask: rules get lost because nobody is sure which files each agent reads. Measured below; the moves are proposals until the owne…
- [Page.class.js comment blocks: what to do with each (DONE 20…](/framework/core/Page/doc/comment-plan.md) — Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history …
- [Context loss: a session's work survives only in files](/framework/ai/doc/context-loss.md) — When a Claude session ends, its context window is gone: everything it read, reasoned and was told. The next agent starts cold and knows onl…
- [Page health — is it working? After every change, the pages …](/framework/ai/health/readme.md) — ## Use Run node Server/health-supervisor.mjs. It keeps one Server/health.mjs per tree alive, and that loads pages from HEALTH_BASE, the own…
- [Catalog — next: previews that load in under 2 s](/framework/catalog/doc/next.md) — The ask: "a preview on the catalog page is enough to see what it looks like" — the review's test was 40 previews in under 2 s. Today they a…

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/15 [Clarity refine audit](/framework/ai/sessions/2026/10/15/session-f2708f57/) — kind/agent model/sonnet work/read-only task/refine-audit framework/refine · $0.14
- 2026/10/15 [Clarity trace page system](/framework/ai/sessions/2026/10/15/session-eb5e27d5/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Debug views](/framework/ai/sessions/2026/10/15/session-eafccb46/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Clarity live post](/framework/ai/sessions/2026/10/15/session-e9ea50e3/) — kind/agent model/sonnet work/read-only task/live-post page/live-cards · $0.14

## Owner asks
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)
- 2026-09-30 Page inbox for necessary agent coordination (task-mastermind-page-inbox, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,996 tokens of reading, under the 100k limit).

Question: Agent context: a map of what each agent is given and loads, and a plan to make it visible

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Agent context: a map of what each agent is given and loads, and a plan to make it visible"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
