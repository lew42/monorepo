# asks-critic — press the Asks tab and the Session tab against the owner's sentences, fix what fails, re-press

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more. Clear beats brief by far. Prioritize.
**Length budget:** findings are numbered `log` lines, one sentence each with the measurement; the landing report is one screen: found / fixed / left, with numbers.
**The reader is the overwhelmed newcomer.** Level 1 shown, not told; detail one click down.

## The owner's sentences this page must satisfy (2026-09-17)

> the ai log page for this session should show everything i've asked for (summarized, but linking to the original prompt from the session), listed as previews, when possible. Simple, visual, interactive.

> I want to be able to see an item for AI log revamp, for example, and then I can click through that and kind of see what was discussed, what decisions were weighed and made. And so a lot of that decision-making process, I don't want to see it right away. We tend to get into too much detail too early. [...] Iceberg UX (simple -> complex).

> the session logs can even be clicked through, although that navigation and just the rendering and the layout of the conversation needs to be much more of like a chat conversation instead of just like a summary that's just a big text dump and really doesn't have any flow or rhythm to it

> for every requirement that I give you, I need you to make a report that shows me exactly what I asked for. [...] we need to make sure that the original prompt that I'm giving you and all the requirements are adhered to as closely as possible.

Standing rule (2026-09-13): "self-evident demos that are impossible to misunderstand. every button, every item, every part — perfectly clear what goes where, what does what, what clicks do." A control with no visible consequence reads as broken. Reports to the owner are one screen.

## What to do

1. **Read** `public/framework/ext/AITask/` (`AITask.js`, `asks.js`, `conversation.js`, `ai.css`, `doc/asks.md`) and `ext/JSONL/JSONL.js`'s `ask` verb, and the builder's log `ai/2026-09-17/ai-log-asks/task.jsonl`.
2. **Press everything, headless, at 400 / 1280 / 1920 / 3440** on your private server (`PORT=8099 node server.js`, background, killed by PID at landing), on `/framework/ai/2026-09-17/mastermind-layout-browser/`: every ask card opens level 2 in place and closes again; "the prompt" lands on the Session tab AT that message (measure: the message's top within the viewport after the click, and cold via `?m=<uuid>`); every task pill opens the task page; status chips and "n of m landed" agree with the serving tasks' `landed_at` (count them yourself from the task.jsonl files — two numbers that must agree); the Session tab's prompts rail scrolls to each message; a folded tool run opens on click and says what it hides; a second task page with a long transcript (`/framework/ai/2026-09-13/page-cms/`) still renders as a conversation; a task with NO asks opens on Report as before. At 400: one column, nothing at x:0, the rail becomes something a thumb can use, level 2 readable.
3. **Judge against the sentences**, one line each: can a stranger say in ten seconds what the Asks tab is? Are the previews previews (a picture where a serving task has a shot) or only text? Is the click-through what was *discussed and decided*, or a log dump — is the level 2 too much too early? Does the Session tab read as a conversation with rhythm — or as cards of the same grey (one cue between owner and Claude is enough; three is noise)? Does anything tell the reader what it is about to show? Is any control without a visible consequence?
4. **Fix every finding you can inside the fence**, cause not symptom, easy to change, caveat beside it; re-press by number and log which pass now. Two failures on one item → leave it with the reason. The `ask` verb's shape (id, at, summary, quote, prompt, status, tasks, links; merged by id) is fixed — the mastermind writes it; render it, do not change it.
5. Findings needing a decision outside the fence → proposals in your log with file:line.

## Rules

- Load `code`, `layout`, `css`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/asks-critic/`); `finish-task` at the end; `skill-improvement` for any skill that misled you.
- **Fence:** `public/framework/ext/AITask/**`, `public/framework/ext/JSONL/**`, your task dir. Nothing else — never the run task's `task.jsonl` (read it; the mastermind writes it), never `ai/page.js`, never another task's jsonl. The builder has landed; nobody else edits these modules.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. `ui-test` has the headless recipe; before/after shots of anything you fixed into your task dir as jpeg. The transcript is read from `~/.claude/projects/` by the dev server — your private server serves it the same way.
- Landing: `outcome` = a headline (found N, fixed N, left N), the list by number, one before/after pair, the link. One screen.
