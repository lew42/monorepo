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
- A test importing Servex needs `@anthropic-ai/claude-agent-sdk`, which `package.json` does not list: a worktree's `npm ci` lacks it, so 16 Servex tests fail there with ERR_MODULE_NOT_FOUND (they pass in the main tree).
- Coverage is wide: `core/List/List.js` is imported by about 50 tests, so a change there runs them all.
- First full run on `michael/dev` (2026-10-22): 84 of 99 pass, 15 fail. The failures are real and were silent until now; the page lists them.
- The runner's first catch: a fresh `Task` stored `{tasks:{add}}` as plain data (Item.get skipped the lazy `tasks` getter). Fixed in `Task.get`; [child-verb.test.mjs](../Task/child-verb.test.mjs) holds it.

## More
- ⬜ Servex hosts the watch on core/Item + core/Task (next slice)
- Page smoke on change stays `Servex/WorktreeWatch.js` + `Server/smoke.mjs`.

## Notes from your asks

- Work is tested before it is handed back, so it does not fail on first pass and need owner fixes. ([your words](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p11150), 2026-10-12)
