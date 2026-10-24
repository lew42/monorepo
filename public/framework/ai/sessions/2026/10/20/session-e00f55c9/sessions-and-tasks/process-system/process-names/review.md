verdict: fix
1. [fix] `Server/rename-phase-to-step.mjs` breaks things if it is run a second time. Its own `--dry-run`, run today, would rewrite `body.step ?? body.phase` into `body.step ?? body.step` (Process.js:100), turn `{ step: _s, phase: _p }` into a duplicate `step` key (Process.js:102), and change the old-shape test line (ProcessRunner.test.mjs:44) so it no longer tests an old line. That would quietly remove the old-log alias the brief requires. Make the script refuse when `STEP_LINES` is already in Process.js, or skip lines that mention `body.phase` and `phase: _p`.
2. [note] `Servex/agents/roles/mastermind.md:19` gained the line the brief asked for, but the bullet in front of it still says "Multi-phase work… each phase's session… every phase". The page now uses both words; "phase" there should be "step".
3. [note] `Servex/agents/page_tools.js:356` `CLASS_SOURCES.Process` still lists only `core/Task/Process.js`, so the class text read at line 389 no longer contains the templates (they now live in `processes/*.js`). Add `core/Task/processes/index.js` there if that text is meant to show what a Process can do.
4. [note] The templates only exist when `processes/index.js` has been imported. Code that imports `Process.js` directly gets an empty `Process.TEMPLATES`, so `Process.lines({process:"build"})` returns null. The comment at Process.js:103 says this. Today page_tools loads index.js, so Servex works, but a browser page that imports Process.js and calls `template()` would find nothing.
5. [note] There is no `session.jsonl` in the task folder yet, so the "Done means" items (review answers, the `ready:` line, `--status` clean) are still to do after this review.
6. [note] The option name chosen is `steps_over` (Process.js:93; the brief allowed "steps_over or similar"). Nothing in the repo passed the old `phases:` override (the one other `phases:`, in `Server/refine.mjs:430`, is a different thing), so nothing broke. A caller still passing `phases` now gets it written onto line 1 as a plain field, with no error.

## Requirements
- 1 "Mark the proposals decided… cite that prompt… title and intro read as a decision… role/kind/template table decided" — yes — process-names.md: the title says "decided 2026-10-23", the intro cites the 23:51:53Z prompt, every row and the table heading say decided
- 2 "Rename script with --dry-run and a manifest; scoped; renames; old `phase` still read; a test for an old line" — partly — the script, manifest (117 change lines) and scoped FILES list are there; `body.step ?? body.phase` is at Process.js:100; the test is at ProcessRunner.test.mjs:44 and passes. But the script is unsafe to re-run (finding 1)
- 3 "One subclass per template in processes/, Process.template(name), refusal lists every name, callers keep working" — yes — Build/Design/InvestigateProcess.js; index.js registers them; page_tools:482–485 uses `template()`/`names()`; no `DEFINITIONS` left
- 4 "Handoff: mark decided only, don't build" — yes — the process-names.md Handoff row says "decided… Not built here"
- 5 "Docs say step, list templates one line each, no dated log in readme; mastermind line" — mostly — process.md and the readme say step and list the three templates; the readme's dated "Built (2026-10-22, branch…)" line is gone; the mastermind line was added, but its bullet still says phase (finding 2)
- Done: tests pass — yes — ProcessRunner.test 42 passing; Task 58/58, Project 9/9, TasksPage 4, child-verb 4
- Done: review answered, ready line — not yet — no session.jsonl (finding 5)

## Words
- content: plain words — yes — the templates' comments and the readme line are short, full sentences
- content: one word per idea — no — "phase" and "step" sit side by side in mastermind.md:19 (finding 2)
- No shots were given: the diff changes no page, so only Requirements and Words are answered.
