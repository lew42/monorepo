verdict: pass
1. [note] Order step 4 is still open: nothing yet shows the Step runner proven on two real tasks, and plan.md has only the "before" rate (116 tasks, 0 estimated); STATE.md:5 is ⬜. It can only happen after merge and a Servex restart, so it is not a merge blocker, but the task must not land without it.
2. [note] The worktree (worktrees/step-runner) still has 40 uncommitted files, mostly generated `files.jsonl` and `page.jsonl` (e.g. `public/framework/ai/2026-10-12/task-folders/files.jsonl` deleted); none are task.jsonl any more. Merge by exact path and leave these out, or revert them.
3. [note] `Servex/TaskLoop.js` nudge_step: the nudge line still moves the file's mtime, so the quiet chase resets on the next tick (it is only protected for the current tick). That is probably fine (a nudge is a chase), but the comment at the call site claims more than it does.
4. [note] `Server/Steps.mjs` NOTES "Shoot the page at its widths" always says 400/1200/1920/3440, while the review system picks widths by change (`Server/doc/review.md`); point the note at the screenshot-system brief's own rule instead of a fixed list.
5. [note] A nudge only reaches a task with `heartbeat: true` (doc/steps.md says so, good); worth checking that spawn_agent sets it by default, or most real tasks will only get the hook prompt, never the 2× nudge.

## Requirements
- "Structured tasks: steps, each with a time estimate; node prompts each next step" — yes — `Steps.parse` reads "(N min)", `.claude/hooks/step-prompt.mjs` returns `Steps.prompt` as additionalContext when `step` moves.
- "Nudge once at about double its estimate: 'You were on step 3; is it done?'" — yes — `TaskLoop.nudge_step` + `Steps.overdue` (2×, once per step via `log.nudge`); proven in `Servex/TaskLoop-steps.test.mjs` (one send across two ticks).
- "Spend few tokens" — yes — the hook adds one sentence, no extra turn; the nudge is one message per step.
- "A UI task gets the screenshot-system steps attached" — yes — `Steps.TEMPLATES.ui` + NOTES naming `mcp__site__shot`, via `--plan --kind ui`.
- "Each system has a name, its requirements and its own log" — yes — `Servex/doc/steps.md` names it, links the brief, and nudges go to the Servex `steps` log.
- "Node does the clerical work, AI the judgement" — yes — procedure in `Server/Steps.mjs`; agents only report.
- "Measure the followed rate" — yes — `node Server/Steps.mjs --report`; "all reported" now needs every step on its own line (fixed since the first review).
- Order 1–3 (past work, plan.md, build) — yes — plan.md, commits de61ef02d … 6873e0410.
- Order 4 "Prove it on two real tasks; before and after rate" — not yet — see note 1.
- "One Servex restart proven on a private port" — yes — `Servex/proof/step-runner-proof.mjs` on 8390, now with SERVEX_NO_TASKLOOP / NO_HEARTBEAT so it cannot write into real logs (first review's fix 1 addressed; both flags exist in `Servex/Servex.js:259,272`).
- "Update the mastermind skill in a line or two (suggestion)" — yes — one sentence in mastermind/SKILL.md step 5, worded as a suggestion; minion and sub-mastermind got a matching clause.
## Words
- doc/steps.md opens with what it is in one sentence, then five numbered steps — yes.
- Servex/readme.md adds one line and a link, no explanation — yes.
- Skill edits are one clause each, linking the doc — yes, though the mastermind line is now long (one sentence carrying two parentheticals); a note, not a fix.

Widths given: none (no page change; light review).
