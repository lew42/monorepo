verdict: fix
1. [fix] `public/framework/ai/AISession/AISessionCoverage.js:111` (diff line 488) has lost its backslashes: `/^/|^[w./-]+.(md|js|mjs|jsonl)$/` and `.replace(/^public//, "")` are a SyntaxError (`node --check` fails at `^`). AISessionDetail imports this file, so every session page fails to load, and the "session page shows it" done-when is broken. The intended code was `/^\/|^[\w./-]+\.(md|js|mjs|jsonl)$/` and `/^public\//`.
2. [fix] Ask 4 is not done. In the session's `prompts.jsonl` every prompt's latest `parts` line is `step: "outcomes"`, and none is `step: "file"`. 31 parts are still `open`, 24 of them asks or rules. `session.jsonl` holds no task with a `source: {session…}`. So `--file` was never run, and the open asks of e00f55c9 are neither tasks nor written-down notes (`--summary`: 40 of 69 complete). One possible cause: the session record is `stop`ped by StaleClose (`session.jsonl` line 2), so filing onto it may be refused. Check that, then file the open asks or write them down.
3. [note] The "task" outcomes in `--summary` (e.g. L7283 `task:5`) were written by the outcomes model, which pointed parts at tasks that already exist. They were not filed by this pipeline. A wrong `ref` therefore counts as settled once that task completes, so spot-check a few refs.
4. [note] Prompt.js no longer sets `Prompt.View`; that now lives in `PromptView.js`. `Prompt.prototype.view` (Prompt.js `get view`) throws unless PromptView.js was imported first. RefineDemo imports it. `ai/SystemClasses.js`, `RefineSystem.js` and `test/session-log.mjs` import only Prompt.js, so check that none of them reads `.view`.
5. [note] `prompts.jsonl` for e00f55c9 is 1.4 MB. That is the raw prompts plus two full `parts` lines per prompt, since each later step rewrites the whole list. It is acceptable, but every further step adds about 0.5 MB. A step could write only the outcomes it changed, keyed by part id.
6. [note] `Servex/agents/PromptTasks.js:337` has a stray double block, `{ { const t = …; } }`. It is harmless and can be tidied.
7. [note] The design side is sound and simpler than what it replaces. The blind parts step plus windowed outcomes is justified by the measured experiment (doc table: recall 0.95–1.0 at $0.16–0.29 versus about $2 for b and c). Completion is computed in one class shared by node and the browser. Both test files pass: prompt-records 10/10, prompt-tasks 22.

## Requirements
- 1 "A prompt is an item with completion" — yes — Prompt.js `parts`, `uncovered`, `progress`, `complete`. The store (one prompts.jsonl per session) is decided, with alternatives, in doc/prompt-records.md "The record".
- 2 "One pipeline, several processes" — partly — `PromptRecords.PROCESSES` defines live and review. Whisper and the cloud voice agent are listed as "not built yet" in the doc.
- 3 "Session audit, by experiment … pick the process" — yes — the doc's experiment table, experiment/results.jsonl, and the pick with its reasons.
- 4 "Apply it to this tab's session … anything not done becomes a task" — no — the breakdowns and outcomes are written for all 69 prompts, but none of the 24 open asks or rules was filed or documented (finding 2).
- Done-when "the session page shows it" — no — the Coverage tab code does not parse (finding 1).
- Done-when "readme/doc (conclusions only)" — yes — the readme links doc/prompt-records.md, which holds the record, the processes, the numbers and the pick.

## Words
- content 1 (clear for a newcomer) — yes — doc/prompt-records.md opens with what a record is and when a prompt is complete, in plain sentences.
- content 2 (one takeaway) — yes — "a prompt is complete when everything it asks is done or documented" leads both the readme line and the doc.
- content 3 (length) — note — the "Measured on the way" paragraph (SDK cost accounting, Haiku pricing) is useful but sits off-topic in this doc. It could move to a cost doc and be linked from here.
