# Test — node tests that run when the code they cover changes, with results you can open

## Index
- [Test.js](./Test.js) — `class Test`: `ok`, `eq`, `throws`, `done`; portable, no DOM, no node imports
- [TestRunner.mjs](./TestRunner.mjs) — `class TestRunner` (node only): find, run, cover, watch, record
- [TestResults.js](./TestResults.js) + [page.js](./page.js) — the live page of `results.jsonl`
- [tasks/test-system/plan.md](./tasks/test-system/plan.md) — the design and why

## Use
```js
import Test from "/framework/core/Test/Test.js";
const t = new Test("Item: a verb on a child by id changes its state");
t.eq(a, b, "what must be equal");   t.ok(cond, "what must hold");
t.done();   // prints PASS/FAIL, sets the exit code on failure
```
- **Names:** `X.test.mjs` is a node test, passing when it exits 0 (old tests without `Test` count too). `X.test.js` is reserved for browser tests; none yet.
- **The one command:** `node public/framework/core/Test/TestRunner.mjs [folders…]`: whole repo by default, each file in its own process, 60 s timeout, 4 at once.
- **Coverage:** a test covers its own folder plus every file it imports, transitively. `--covers <file>` lists them; `--list [folders]` lists tests.
- **On change:** `TestRunner.mjs --watch core/Item core/Task` runs the covering tests (300 ms debounce, `.js`/`.mjs` only).
- **Results:** one line per run appended to [results.jsonl](./results.jsonl) `{file, ok, ms, at, trigger, tail}`; the [page](/framework/core/Test/) shows the latest per file, failures first.
- **What earns a test:** something broke silently, or it is built to a spec. Never for what is certain to pass. When something fails that no test caught, add the one test that would have caught it, named after the bug. Test-first where it pays.

## Watch out
- A test importing a Servex or Server module needs `node_modules`; a worktree without them fails those with ERR_MODULE_NOT_FOUND.
- A plain `Task` makes its `tasks` list lazily, so `task.set({tasks:{…}})` finds nothing until `task.tasks` is read; see [child-verb.test.mjs](../Task/child-verb.test.mjs).

## More
- ⬜ Servex hosts the watch on core/Item + core/Task (next slice)
- Page smoke on change stays `Servex/WorktreeWatch.js` + `Server/smoke.mjs`.
