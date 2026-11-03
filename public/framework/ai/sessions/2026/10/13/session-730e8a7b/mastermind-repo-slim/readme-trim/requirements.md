# Two readmes over 100 lines become indexes again: core/Page and Server

Budget: $4. Sonnet (Haiku for nothing here: the judgment is which lines move). Load the `minion` and `documentation` skills. CLAUDE.md "Readmes are the cheap index": each readme is a short index under about 100 lines, what exists, one line each, when you would load it, links to the deeper `doc/*.md`; detail is never removed, it nests one click down. The past-work checkup (10-17, `../checkup-past-work/checkup.md`) found `public/framework/core/Page/readme.md` and `Server/readme.md` over 100 lines and left them for a readme-upkeep pass. The documentation skill says how to move text out without losing it (a `doc/*.md` beside the module, linked from the line that replaces it; `ai/doc/claude-md-archive.md` shows the pattern for keeping original wording). Your log is this dir's `task.jsonl`.

## Deliverable

1. For each of the two readmes: count the lines now; move every paragraph that explains rather than indexes into an existing `doc/*.md` where one fits (name it) or a new `doc/<topic>.md`, replacing it with one index line that links there; keep every "watch out" as one line with its link; the readme ends under 100 lines with nothing lost (the moved text is byte-identical in its new home: say so with a diff count). Print before and after line counts for both.
2. `node Server/doc-check.mjs` on both modules reports 0 dead links; `check_page` on `/framework/core/Page/` and `/Server/` (the readme pages) at 400 and 1200 render clean.
3. One line in this run's log and in the readme-upkeep record if one exists (`grep -rl readme-upkeep public/framework/ai/doc .claude/skills | head -3`). Worktree, `merge.mjs` (`--no-review` naming your review if the gate cannot see this 2026-10-13 task dir), a `finish` line with the four line counts checked with `tail -1`, `git status` clean for your paths. Never restart servers; never drive the owner's tabs.

Fence: `public/framework/core/Page/readme.md` and its `doc/`, `Server/readme.md` and `Server/doc/`, this task dir. No code.
