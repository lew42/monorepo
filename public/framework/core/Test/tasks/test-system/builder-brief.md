Budget: $8

# Build the test system's first slice (core/Test)

You are a Sonnet builder. Work ONLY in the worktree `C:/Code/lew42/worktrees/test-system` (branch `task/test-system`). Commit after each working step. Never touch the main tree `C:/Code/lew42/monorepo` except to read. Don't merge; the test mastermind (`mastermind-test`) reviews and merges.

**Read first:** the design, `public/framework/core/Test/tasks/test-system/plan.md` (in the main tree; copy it into the worktree's same path in your first commit along with requirements.md). Follow it; if you must deviate, say why in your report. Load the `code` skill before writing JS.

## Build (each step: run it, then commit)
1. `public/framework/core/Test/Test.js` — `class Test`: `constructor(name)`, `ok(cond,msg)`, `eq(a,b,msg)` (deep equal via JSON or a small recursive compare — no node imports, it must load in a browser), `async throws(fn, re, msg)`, `done()` → prints `PASS <name> (n checks)` or `FAIL <name>: <msg>` lines and, when `globalThis.process` exists, sets `process.exitCode = 1` on failure. Returns `{name, passed, failed, failures}`. Keep it ~60 lines.
2. `public/framework/core/Test/TestRunner.mjs` — `class TestRunner` + a CLI at the bottom (`if (import.meta.url === pathToFileURL(process.argv[1]).href)`):
   - `find(folders)`: every `*.test.mjs` under the given repo-relative folders (default whole repo), skipping `node_modules`, `.git`, `worktrees`, and dated session folders (`public/framework/ai/sessions/`).
   - `run(files, {trigger})`: each file in its own `node` child process, cwd = repo root, timeout 60 s, 4 at once. Verdict = exit code 0. Append one line per file to `public/framework/core/Test/results.jsonl`: `{file, ok, ms, at, trigger, tail}` (tail = last 15 output lines, only when failing). Print one line per file and a summary; exit 1 if any failed.
   - `covers(file)`: the tests covering a changed file = tests in the same folder + tests whose transitive static imports (regex over `import … from "…"` and `await import("…")` with relative or `/framework/…` paths; resolve `/framework/` to `public/framework/`) include it. Build the graph once per run; cache per mtime.
   - `--watch <folders…>`: `fs.watch` recursive on each folder, `.js`/`.mjs` only, ignore `*.jsonl`, debounce 300 ms, run `covers()` of the changed files with `trigger: "change:<file>"`. Never run the same test twice concurrently.
   - `--list`: print the files found, and with a file argument after `--covers <file>`, the tests covering it.
3. `public/framework/core/Task/child-verb.test.mjs` — today's bug, at core level, using `Test`: a Task with two child tasks added through `task.set({tasks:{add:{…}}})` (read core/Task/Task.js and core/List/List.js to get it right); `task.set({tasks:{<id>:{start:{}}}})` must make that child `running` and leave the sibling alone; the list's `get(id)` finds the member. Confirm it FAILS if you revert line 116 of `core/List/List.js` to `get(key){ return super.get(key); }` in a scratch copy (do not commit that), and passes on the real file. Say so in the report.
4. Run `node public/framework/core/Test/TestRunner.mjs public/framework/core/Item public/framework/core/Task` and then the whole repo once; report counts (passed/failed/timed out). Don't fix other tests' failures — list them in the report (file + one-line reason).
5. `public/framework/core/Test/page.js` — the Test page: read `results.jsonl` (look at how another page tails a JSONL live, e.g. grep for `live(` under `public/framework/`, and reuse that), show the latest line per file, failures first, then a count line. Plain, one screen. Check it at 400 and 1920 with `mcp__site__shot` against the worktree's own dev server if you can start one; otherwise say you could not.
6. `public/framework/core/Test/readme.md` — conclusions only, under ~50 lines, the readme shape (what · Use · Watch out · More): file names, the one command, coverage rule, results file + page, the rule for what earns a test, test-first, and `⬜ Servex hosts the watch on core/Item + core/Task` as the next slice. Add `- [Test](./Test/) — …` to `public/framework/core/readme.md` Index; one line in `public/framework/readme.md` "The systems"; one bullet in the code rules (find them: `.claude/skills/code/SKILL.md` or `public/framework/code/`) — "a node test is `X.test.mjs`, run by core/Test/TestRunner.mjs; a test earns its place by a silent break or a spec".

## Report
End with a short report: what you built, the commit list, the run counts, the failing tests, anything you deviated on. Then stop.
