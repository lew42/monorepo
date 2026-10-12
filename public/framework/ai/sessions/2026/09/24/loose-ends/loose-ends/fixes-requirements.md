# Loose-ends small fixes — minion briefs

Owner's words: "Don't wait on me to move things forward. Make your best guess."
Decisions are in [report.md](report.md). Load the `minion` skill first. Never write the owner's name.

## Minion A — `fix-hooks` (worktree C:/Code/lew42/worktrees/loose-ends, branch worktree/loose-ends)

Fence: `.claude/settings.json` only, inside the worktree.

1. Add the `Bash` matcher from `public/framework/ai/2026-09-21/arm-the-hooks/settings-block.md` §1 to the existing `PostToolUse` array (beside `Edit|Write|NotebookEdit` and `Skill`). Do NOT add §2 (UserPromptSubmit) — decided off.
2. Check it parses: `node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))"`.
3. Prove it: from the worktree, run `echo '{"tool_name":"Bash","tool_input":{"command":"node Server/hold.mjs on \"probe — test\""}}' | node .claude/hooks/ledger.mjs post-tool-use` style check as settings-block.md describes, if cheap; otherwise say so.
4. Commit on worktree/loose-ends: "Arm the reload hold-guard: Bash matcher for ledger.mjs". Do not merge.

## Minion B — `fix-page` (main tree C:/Code/lew42/monorepo)

Fence: `public/framework/ai/2026-09-24/loose-ends/page.js` (new), appends to the task.jsonl files listed below, and one line appended to `public/framework/ai/handover.md`.

1. `page.js` beside report.md, the shape of `public/framework/ai/2026-08-09/page.js`: title "Loose ends", icon "checklist", description one sentence, content returns `md.file(import.meta, "report.md", { h1: false })`. Load `http://monorepo.localhost/framework/ai/2026-09-24/loose-ends/` headless (Playwright, see the ui-test skill) at 1920: zero failed requests, zero console errors; save a screenshot to `public/framework/ai/2026-09-24/loose-ends/shot-1920.png`.
2. Close each stale task by appending ONE line with `node .claude/hooks/append.mjs <task.jsonl> <lines.json>` (write lines.json with the Write tool, in the scratchpad, name it le-close-*.json):
   `{"assign":{"landed_at":"NOW","outcome":"**Closed by the loose-ends sweep, 2026-09-24** — <one sentence: what replaced it>. [loose-ends](/framework/ai/2026-09-24/loose-ends/)"}}`
   Tasks: 2026-08-12/apps, 2026-08-12/layouts, 2026-08-12/stage, 2026-08-12/strategy, 2026-08-12/unify, 2026-08-13/persistence, 2026-09-13/self-evident-fixes, 2026-09-13/self-evident-fixes-2. Read each first to write the one sentence honestly (e.g. "superseded by the 08-12 overhaul, which landed"; "its fixes landed under self-evident-minors"). Skip any that has no task.jsonl, or already has landed_at; report it. 2026-09-04/paging has only requirements.md — create nothing there, just report it.
3. Append one line to the end of `public/framework/ai/handover.md`: `- Owner items and every decided loose end since 2026-08-08: [/framework/ai/2026-09-24/loose-ends/](/framework/ai/2026-09-24/loose-ends/) (2026-09-24).` Use an append (e.g. `>>` with printf), never a rewrite — other agents edit this file.

Report in one line each: what you did, the screenshot path, anything skipped.
