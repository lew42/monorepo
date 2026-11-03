Budget: $6

# Show the process system to the owner (agent-base brief, item 27)

The owner has never seen the process system. It is built: `public/framework/core/Task/Process.js` (110 lines), the templates in `core/Task/processes/` (BuildProcess, DesignProcess, InvestigateProcess), the runner `Servex/ProcessRunner.js`, and the doc `core/Task/doc/process.md` (read it first, plus `process-names.md`).

Work in a NEW worktree: `git worktree add C:/Code/lew42/worktrees/process-page -b worktree/process-page michael/dev`. Never edit the main tree. Commit as you go; the mastermind reviews and merges.

## Deliverables

1. **A page for it** in the framework (pick the home: a child page of `core/Task/`, declared in its parent's `children:`, and linked from `core/Task/readme.md`). Read `public/framework/readme.md` and `doc/rules.md` first, and the `page` skill. It shows, object-oriented:
   - the class (`Process`, how the templates extend it) with its properties and API, each in plain words;
   - a live demo with real data: render a real process run (the readmes-page run of 2026-10-22, "Run 1" in process.md, or a current one from `ai/` task logs), showing its steps, their states and the session each step ran in. No invented data.
   - one screen at level 1: what it is, shown not told; detail nested.
2. **Answer, then add if missing:** does finishing step N inject step N+1's instructions into the next agent automatically? Read `ProcessRunner.js` and `Process.js` to find out, and write the answer (with file:function) on the page and in process.md. If it does not, add that, small: when step N completes, the runner hands step N+1's instructions to its session. Add a test beside `ProcessRunner.test.mjs` (or Process.test.mjs).
3. **Docs:** index the new page in its parent readme (`children`/link) and `files.jsonl` where the folder keeps one; update process.md to match the code (no history).
4. **Check:** `check_page` on the new page, a headless look at 1280 and 3440 (`mcp__site__shot`; never the owner's tabs), and the Task tests that touch Process.

## Report

Log lines in your task folder as you go. When done, report to `ai-system-mastermind`: the page URL, the answer to "does N inject N+1" (yes/no/added), the branch name and commit, and anything that failed. Keep it to one screen.
