# Past work: dashboards, audits, refinement, the past-work skill — findings

Budget: $3. Haiku. Read-only investigation; write only `findings.md` beside this file (and your own task.jsonl).

## The owner's words (voice, 2026-10-15, question d738360b, relayed)

> 3. Dashboards: he finds the current dashboards (AI sessions, the data grid, inbox rail) frankly bad; too much built, not made good, no per-class or per-topic view. He wants to browse what's been done per topic/class/extension (e.g. a dashboard or summary for the prompt-refinement class showing recent work) and doesn't know where to go for that despite asking multiple times.
> 4. Past work audits: what retroactive session/task audits have actually been run, what audit data structure exists, and have past sessions been run through the prompt refinement system (he had hoped we'd hold off on that; did it launch?). Also status of the prompt refinement system itself (clean pass then refine to essence); he suspects regression.
> 5. He recalls asking for a "past work" skill: lean on prior work rather than repeat it, and organize past work so it resurfaces in the right place, with human-in-the-loop to flag which work was actually beneficial. Does that exist? Where should he go to browse past work per topic?

## Answer each, from the record (git log, files, task logs), never from memory

3. Which per-topic / per-class / per-module views exist today (URL each), which of the owner's earlier asks for one are in `public/framework/ai/asks.jsonl` (quote the ask id + status), and what is missing. Use `node Server/PastWork.mjs dashboard per topic` and `node Server/PastWork.mjs refine`.
4. List every retroactive audit actually run (date, what it covered, where its output lives: `ai/audits/`, `sessions/2026/10/03/day-audit/`, the `audit_session` tool, anything else); the audit data structure (file + schema). Did any batch of PAST sessions get fed through prompt refinement (Echo, `ext/Refine`, `Servex/doc/echo.md`)? Check git log and the refine logs for dates and counts. Status of refinement now: the last commits, whether the "clean pass then refine to essence" two-step exists in code, and any sign of regression (a step that used to work and no longer does — name the commit).
5. The `past-work` skill (`.claude/skills/past-work/SKILL.md`, `Server/PastWork.mjs`, `ai/past-work-index.md`): what it does, whether it has the "resurface in the right place" and "human flags which work was beneficial" parts, and whether any page on the site shows past work per topic.

## Output

`findings.md` here: one section per question, at most 25 lines each, plain sentences, every file or page as a link (`/framework/...`). End with a 3-line "what the owner should open first". Then report to your parent in two sentences. Commit `findings.md` + your log (`Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>`). Not: edits to any other file.
