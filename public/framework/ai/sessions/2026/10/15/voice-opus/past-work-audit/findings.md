# Past work: dashboards, audits, refinement, the past-work skill — findings

Read-only pass, run from the record (`node Server/PastWork.mjs`, git log, the ask ledger, the Refine run log). Nothing else was edited.

## 3. Per-topic, per-class and per-module views

**What exists today**

- The AI dashboard grid is [/framework/ai/dashboard/](/framework/ai/dashboard/) (a grid of live previews, stalled first). It is not organised by topic.
- Refined asks are grouped by module, one generated page per module: [/framework/ai/doc/asks-by-module.md](/framework/ai/doc/asks-by-module.md), with per-module lists such as [/framework/ai/tasks/doc/refined-asks.md](/framework/ai/tasks/doc/refined-asks.md), [/framework/core/Item/doc/refined-asks.md](/framework/core/Item/doc/refined-asks.md) and [/framework/ext/Refine/](/framework/ext/Refine/).
- Past work by topic is a generated markdown file, [/framework/ai/past-work-index.md](/framework/ai/past-work-index.md): 277 topics, 1,090 landed tasks. It is markdown, not a live page.
- Per-prompt refinement lives on each session's Coverage tab (see section 4).

**Owner asks on this**

- ask "Dictation: ONE system everywhere" (2026-09-30) and "Prompts: each owner prompt becomes a refined Inbox card" (2026-09-30, status `stalled` on the 2026-09-30 tick, later `dropped` 2026-10-13 as "superseded"). The ledger is [/framework/ai/asks.jsonl](/framework/ai/asks.jsonl).
- No ask in `asks.jsonl` mentions a per-class or per-topic dashboard, or "where do I browse past work". The owner's 2026-10-15 words (the question you relayed) are not in the ledger yet.

**What is missing**

- A page per class or topic (for example a prompt-refinement class page with its recent work). Nothing links that view from the root readme or the AI tab.
- Refined asks are counted per module, but there is no summary page that a newcomer finds from the front door.

## 4. Retroactive audits, the audit data, and refinement of past sessions

**Audits actually run**

- Day audit, 2026-10-03: [/framework/ai/sessions/2026/10/03/day-audit/](/framework/ai/sessions/2026/10/03/day-audit/) (readme, `day-audit.mjs`, `audit-2026-10-03.json`, `files.jsonl`). It checks each task folder for brief, log and landing line.
- Branch audit, 2026-10-13 (`089660dc1`) and the 90-branch landing audit (`fa65fbb38`).
- Readme audit, 2026-10-13 (`c9f5180d6` census, `373aa4757` moves, `00ffa2d3c` fixes).
- Figma fluid audit (`18a08916e`, `91d360e7f`).
- Live `audit_session` tool (`Servex/agents/tools.js` line 188): recomputes one session's cost from the raw transcript and writes the result to `session.jsonl`.
- `ai/audits/` ([/framework/ai/audits/](/framework/ai/audits/)) is a page with one child, the paging audit, not a log of past audits.

**Audit data structure**

- Day audit: one JSON file keyed by task, plus `files.jsonl` (one line per file). No shared schema across audits.

**Past sessions through refinement (did it launch?)**

- Yes, the queue ran. `Server/RefineQueue.mjs` (one Haiku call per owner prompt, commit `88acd129b`, 2026-10-13). Its run log `public/framework/ext/Refine/queue/runs.jsonl` holds 84 calls: 81 on 2026-10-13 and 3 on 2026-10-15 (about $0.03–0.05 each, brief `v2`).
- The asks index `queue/asks.jsonl` holds 1,224 asks. The confidence run covered 338 asks for $6.72 (`659670c5e`).
- Owner's hope to hold off: no ask in `asks.jsonl` records that hold-off, so this is an open question for the owner.

**Refinement status: two-step, or not?**

- The two-step exists in code only in the Refine engine: `clean()` then `structure()` (`public/framework/ext/Refine/engine.js`, `structure.js`), used by the live page `/framework/ext/Refine/try/`.
- `RefineQueue` does not do the two steps. It makes one call per prompt. So the "clean pass, then refine to essence" pipeline is not wired into the queue.
- Regression sign: [/framework/Servex/doc/echo.md](/Servex/doc/echo.md) says the local-first clean step never works (1,090 `servex.jsonl` lines: context 32,768 exceeded), so every prompt falls back to the default model twice. Echo cost $24.72 on 80 prompts, against a counter of $5.54.

## 5. The past-work skill

- `.claude/skills/past-work/SKILL.md` and `Server/PastWork.mjs` (185 lines): one script searches tasks, modules, docs, asks and commits by topic words, about 1 second, then a Haiku minion or the mastermind judges the output.
- Resurfacing in the right place: partly. The script finds matches by words. The skill has no step that puts a finding in front of the owner.
- "Human flags which work was beneficial": missing. No word such as "beneficial", "useful" or "flag" appears in the skill or the script.
- Per-topic site page: none. The index is a generated markdown file; the skill is referenced from the root readme, not from a page the owner browses.

## What the owner should open first

1. [/framework/ai/past-work-index.md](/framework/ai/past-work-index.md) — the per-topic record that exists today.
2. [/framework/ai/doc/asks-by-module.md](/framework/ai/doc/asks-by-module.md) — where every refined ask lives, by module.
3. [/framework/ext/Refine/queue/](/framework/ext/Refine/) and [/Servex/doc/echo.md](/Servex/doc/echo.md) — the refinement run and the open regression.
