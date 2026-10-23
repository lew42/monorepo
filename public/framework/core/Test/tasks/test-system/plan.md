# Test system: the design (mastermind-test, 2026-10-22)

## Name and home
- **`core/Test/`, `class Test`** (portable, no DOM, no node imports) and **`class TestRunner`** (`core/Test/TestRunner.mjs`, node only: finds, runs, watches, records).
- Alternative: a `Server/Tests.mjs` tool with no class. Lost because the owner wants results that persist and render, and a browser half needs a home under `public/`.
- `Test` does **not** extend `Item` yet: a result is one JSONL line a view tails, which needs no Item. Switch when a test needs verbs (rerun, skip) on its record.

## File names (two kinds)
- **`X.test.mjs` = node test.** Already the convention in ~100 files; `.mjs` says node. Run with `node X.test.mjs`; it passes when it exits 0.
- **`X.test.js` = browser test** (under `public/`, imports real `.js` urls). Loaded by the Test page in the browser. None exist yet; the slot is reserved.
- Alternative: the owner's old `X.tests.js` / `X.node.tests.js`. Lost because renaming 100 working files is surgery for no gain.

## The helper (`Test.js`)
```js
import Test from "/framework/core/Test/Test.js";
const t = new Test("Item: a verb on a child by id changes its state");
t.ok(cond, "what must hold");
t.eq(a, b, "what must be equal");
await t.throws(fn, /message/, "what must refuse");
t.done();   // prints one summary line, sets process.exitCode = 1 on any failure (node)
```
Existing tests need no change: the runner treats any `*.test.mjs` as a test and its exit code as the verdict. New tests use `Test`.

## Who runs what, on which change
- **One command:** `node public/framework/core/Test/TestRunner.mjs [folders…]` runs every `*.test.mjs` under them (default: the whole repo), each in its own child process with a timeout, a few at once.
- **Coverage = imports.** A test covers its own folder's files and every repo file it imports, transitively (static `import … from "./x.js"` parsed by regex). A change to a file runs the tests that cover it.
- **On change:** `TestRunner.mjs --watch core/Item core/Task` (fs.watch, debounced, `.js`/`.mjs` only, ignores `.jsonl`) runs the covering tests. Who hosts the watch: Servex later (it owns long processes and logs); for now the one command, run by hand or by a task's smoke step. Servex hook is the next slice (`⬜` in the readme).
- Page smoke on change stays `Servex/WorktreeWatch.js` + `Server/smoke.mjs`; not duplicated here.

## Where results live and show
- `public/framework/core/Test/results.jsonl`: one line per test run `{file, ok, ms, at, trigger, tail}` (tail = last lines of output on failure). Appended, never rewritten.
- `/framework/core/Test/` page: the latest result per file, failures first, tailed live.

## What earns a test (the rule)
- A test exists because something **broke silently** or **will be built to a spec**. Never for what is certain to pass.
- When something fails that no test caught: ask why, then add the one test that would have caught it, named after the bug.
- Test-first where it pays: a plan phase writes the API's `X.test.mjs`; builders make it pass.

## Today's bug
The item tool answered ok while `{tasks:{<id>:{start:{}}}}` did nothing. `Servex/agents/item_tool.test.mjs` lines 69-74 already cover it through the tool (added by the fix, 8c8a66d21). This slice adds the core-level test: `core/Task/child-verb.test.mjs` (List.get finds a member by id; `task.set({tasks:{<id>:{start:{}}}})` changes that child's state), so a change to `core/Item` or `core/Task` runs it.
