<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Build the test system s first slice  core Test " (words: build, test, system, first, slice, core)

## Tasks (8, best first)
- 2026-10-16 [Checkup: the task system and the migration of old tasks](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-task-system/) — The task system build is on dev (17 steps, 44 commits checked), and 211 old tasks now have module homes with nothing deleted (2c8f4b674, 0 check problems, 5 of 5 spot checks link both ways). /tasks/ shows open work first with finished tasks folded; the task w…
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-20 [Process system: node runs a task's phases, completion automatic](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Ready to merge: task/process-system (merges clean). - ✅ Study notes + doc fixes, maps indexed ([ai/doc/readme.md](/framework/ai/doc/readme.md)) - ✅ [process.md](/framework/core/Task/doc/process.md) with class sketch - ✅ Slice 1: Process + ProcessRunner, moves…
- 2026-10-12 [core/Page: binding.md, the binding system measured](/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/binding/) — core/Page/doc/binding.md written: each owner question decided with its alternative, measured on 1,000 rows (lazy Property 1.3 MB / 8 ms update, Property-per-cell 3.2 MB, Item change 1.0 MB / 4.4 ms, re-render 38 ms per update; all unbind to 0). Slice fixes: g…
- 2026-10-09 [Agent rules: contradictions fixed, CLAUDE.md cut proposed](/framework/ai/sessions/2026/10/09/session-a07780b9/system-architect/) — Agents carried rules that contradicted each other; 8 skills are fixed, and the owner's follow-ups are in the skills. load measured, contradictions found and fixed: [the page](/framework/ai/2026-10-09/system-architect/), [doc/findings.md](/framework/ai/2026-10…
- 2026-10-04 [Models tab: added a one-row-per-model catalog with live pricing and o…](/framework/ai/sessions/2026/10/04/models-page/models-page/) — Live on /framework/ai/ → System → Models, above the fold. A 17-row sortable table — provider, context window, $/M in/out/cached, our docs/reasoning/refine test scores, seconds, tokens in/out, and a "typical minion $" column — plus five notes on why reads are … · paths 2/2 exist
- 2026-10-03 [core/System: the module itself — readme, page.js, doc/system.md](/framework/ai/sessions/2026/09/30/ui-system/system/docs-module/) — core/System/ is now a real module, not just a class file: readme.md, page.js (a Doc documenting the System class — five live Concepts tiles linking Design/Code/UI/UX/AI, then the minimal page.js example), and doc/system.md (what a System is, the two ways to a… · paths 1/2 exist, gone: framework/core/System/
- 2026-10-02 [Refine engine: clean()/structure() + the 3-model litmus test](/framework/ai/sessions/2026/10/03/26075318-fb11-4162-97af-dbc4f1802545/prompt-refine/minion-core/) — Landed: the shared refine() engine (clean + structure) and the 3-model litmus test. clean(text, {prev}): engine.js — numbered sentences, mechanical glossary/strike/reject checks, lean model prompt (no glossary sent) clean = near-verbatim, code-enforced: a dif… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Test](/framework/core/Test/) — used by 0 files, no readme
- [ext/filesystem](/framework/ext/filesystem/) — used by 29 files
- [ext/System](/framework/ext/System/) — used by 8 files

## Docs and readmes
- [Owner notes, 2026-10-16: the task system (dictated, capture…](/framework/core/Task/doc/owner-2026-10-16-task-system.md) — Not a plan, not approved. Before building: look at what exists, write a plan, get it approved. If the owner does not approve, follow up; th…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — Third note of the day; read owner-2026-10-16-task-system.md and owner-2026-10-16-composition.md first. Where the owner said "I'm not sure",…
- [Page system: the owner's asks, merged (2026-10-12)](/framework/core/Page/doc/asks.md) — The owner's own prompts that touch the page system, tagged by Haiku, folded into one ask each, then checked against the code by Sonnet. Ope…
- [Storage slice 1: give Store a backend, with zero behaviour …](/framework/core/Page/doc/storage-slice-1.md) — A brief, ready to spawn (a Sonnet minion, in a worktree). The design it starts: [storage.md](storage.md). The owner's words: asks 5 and 6 o…
- [Export system notes](/framework/core/Page/generator/doc/generator-export-notes.md) — ## The endgame: exporting generated trees to real page.js files THE ENDGAME — a generated tree, written out as real page.js files. Waves 1-…
- [Generator — pages without the filesystem](/framework/core/Page/generator/readme.md) — A seed draws a spec string; the spec builds a real page tree under this url. Real urls, the real Router, the real active-page contract, cor…
- [Layout — the layout system: how pages sit among pages, how …](/framework/core/Page/layout/readme.md) — Layout is not one class or one file here. It is a system spread over several modules, and this folder is its index. Read it top down, in th…
- [Old — the first Page docs, moved out of the Overview tab an…](/framework/core/Page/old/readme.md) — ## Index [intro](./intro/), [nav](./nav/), [children](./children/), [previews](./previews/), [shell](./shell/), [flow](./flow/) — the six o…

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Clarity trace page system](/framework/ai/sessions/2026/10/15/session-eb5e27d5/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Debug views](/framework/ai/sessions/2026/10/15/session-eafccb46/) — kind/agent model/sonnet work/read-only task/page-system · $0.14

## Owner asks
- 2026-10-02 AI system docs: the System tab now explains the whole thing (task-mastermind-ai-system-docs, landed)
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)

## Commits
- ee2ed62d6 process-system: Process extends Task (phases node runs in series) + ProcessRunner; one item call creates a bu…
- 0e10a9854 ext/Shots: ShotsView (browser side) - round tree, before/after/overlay, judge buttons
- 47f5f7e5e skills: readme upkeep moves to the mastermind (quick look on every readme it reads: sense, gaps, unindexed sy…
- 3a5c54b83 Models tab: add a model catalog (provider, context, price incl. cache, our own test scores, typical minion $)
- 1d5219a05 openrouter: rule-following tests with known answers (5/5 pass on Haiku)
- a5646898a ai2/card.js: the card's own sidebar mount is chat.js now, desktop only; Widget.css: the orange assistant-bubb…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,048 tokens of reading, under the 100k limit).

Question: Build the test system's first slice (core/Test)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Build the test system's first slice (core/Test)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
