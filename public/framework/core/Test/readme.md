# Test — node tests that run when the code they cover changes, with results you can open

## Index
- [TestRunner.test.mjs](./TestRunner.test.mjs) · [Test.test.mjs](./Test.test.mjs) · [fallback-modules.mjs](./fallback-modules.mjs) + [fallback-resolve.mjs](./fallback-resolve.mjs) — the test of Test; the SDK fallback for worktrees
- [Test.js](./Test.js) — `class Test`: `ok`, `eq`, `throws`, `view`, `done`, plus `test("name", fn)`; portable, no DOM, no node imports
- [TestBlocks.js](./TestBlocks.js) + [TestBlocks.css](./TestBlocks.css) — a `test()` file on a page: one block per test, its checks as green/red lines, its views drawn open ([doc/test-fn.md](./doc/test-fn.md))
- [TestRunner.mjs](./TestRunner.mjs) — `class TestRunner` (node only): find, run, cover, watch, record
- [TestResults.js](./TestResults.js) + [page.js](./page.js) — the live page of `results.jsonl`
- [Steps.js](./Steps.js) — `class Steps`: runs a class's core test written as steps (`X.steps.js`), the same in node and the browser
- [TestView.js](./TestView.js) + [view/](/framework/core/Test/view/) — watch a test run: every object drawn live in the default view, every line beside it
- [tasks/test-system/plan.md](./tasks/test-system/plan.md) — the design and why

## Use
```js
import Test from "/framework/core/Test/Test.js";
const t = new Test("Item: a verb on a child by id changes its state");
t.eq(a, b, "what must be equal");   t.ok(cond, "what must hold");
t.done();   // prints PASS/FAIL, sets the exit code on failure
```
- **One test file, a block per test, in node and on a page:**
```js
import { test } from "../Test/Test.js";
test("act saves the verb once", t => {            // a name and a function, as always
	const task = new Task({ data: { title: "t" } });
	t.view(task, "the task");                      // drawn open in this test's block on the page; nothing in node
	task.act("start");
	t.eq(task.state, "running", "act ran the verb");   // a green or red line in the block
	return task;                                   // a returned object is drawn too (the DefaultView inspector)
});
test.optional("edge: a refused verb emits nothing", t => { … });   // runs; the page shows it closed, "edge case"
test.node("writes the real file", async t => { const fs = await import("node:fs"); … });   // node only; the page lists it
```
  Node: `node X.test.mjs` (or the runner) prints PASS/FAIL per test and sets the exit code. Page: [`/framework/core/Test/view/?file=core/Item/act.test.mjs`](/framework/core/Test/view/?file=core/Item/act.test.mjs), the worked example; the page's file list is `FILES` in `view/page.js`. Views made before `fn`'s first `await` are captured into the block; later ones go through `t.view`. Caveats and what we did not do: [doc/test-fn.md](./doc/test-fn.md). `Test.stage` is the only link between the two hosts; nothing is written to disk.
- **Names:** `X.test.mjs` is a node test, passing when it exits 0 (old tests without `Test` count too). `X.test.js` is reserved for browser tests; none yet.
- **One test, node and the browser:** a class's core test can be a list of steps, `X.steps.js` (`{title, code, note, run(t), check(t), show(t)}`; Item, List, Task have one). `X.steps.test.mjs` runs it in node with `new Steps(steps).all()`; [the test view](/framework/core/Test/view/?test=Item) runs the same steps on screen, one painted frame per step. `?step` waits for Next and stops at a `debugger` after each step, so DevTools shows that step's view. `t.click(label, fn)` is the UI path (a real button in the browser, a call in node); `t.same(a, b)` compares two objects as data and, on screen, as their drawn views (the `.store` row left out). Each test ends by rebuilding its object from the saved lines and checking the two views match.
- **The one command:** `node public/framework/core/Test/TestRunner.mjs [folders…]`: whole repo by default, each file in its own process, 60 s timeout, 4 at once.
- **Coverage:** a test covers its own folder plus every file it imports, transitively. `--covers <file>` lists them; `--list [folders]` lists tests.
- **Near:** `--near <file>` lists the tests *near* a changed file: the `*.test.mjs` in its folder plus the tests that import it directly (one level, cheaper than `--covers`). A single test file path runs that file.
- **On change:** `TestRunner.mjs --watch core/Item core/Task` runs the covering tests (300 ms debounce, `.js`/`.mjs` only).
- **Results:** one line per run appended to [results.jsonl](./results.jsonl) `{file, ok, ms, at, trigger, tail}`; the [page](/framework/core/Test/) shows the latest per file, failures first.
- **Trigger values** (the `trigger` field): `manual` (the command), `change:<file>` (`--watch`), `merge` (`Server/merge.mjs` runs the tests covering the diff on the branch), `merge-base` (a branch failure re-run on the merge base to see if it already failed; cached per `sha` in a line that also carries `sha`, which the page ignores), `save` (`Servex/WorktreeWatch.js`, below).
- **Saves:** a taken worktree's watcher runs the near tests on each `.js`/`.mjs` save and writes the line, with a `worktree` field, to [save-results.jsonl](./save-results.jsonl) (git-ignored machine state, one line per save), never to `results.jsonl`. The watcher's "was passing" comes from that worktree's last save line, else dev's latest `results.jsonl` line, else unknown, and unknown is never reported.
- **Failures reach the builder quietly:** `Servex/WorktreeWatch.js` waits until a slot has had no saves for 45 s, then re-runs the near tests and page checks. Passes are silent. A real failure (or a page console error) is one line appended to `failures.jsonl` in the module's own folder (`{at, fail:{kind, file|page, msg, worktree}}`), and a later pass is one `{clear}` line; whoever `follow`s that module (the builder, for the modules it changes) gets it. Nothing is sent to the agent directly. `ai/errors/` (the one global folder) is the old shape: new failures go to the module, and `ErrorLog` readers should follow the module logs instead.
- **Every class has its basic test:** one instance, about 15 calls, a check after each, well under 1 s, named `X.test.mjs` in the class's folder (kept: the runner and 120 files use the name; `X.node.tests.js` is not worth the churn). `core/` has Item ([Item.basic.test.mjs](../Item/Item.basic.test.mjs), [Item.test.mjs](../Item/Item.test.mjs)), List, Store, Dated, Task, Project, Process, Session, Page and Test.
- **What earns a test:** something broke silently, or it is built to a spec. Never for what is certain to pass. When something fails that no test caught, add the one test that would have caught it, named after the bug. Test-first where it pays.

## Watch out
- A test importing Servex needs `@anthropic-ai/claude-agent-sdk`, which only the main checkout installs (`Servex/node_modules`). The runner adds `--import fallback-modules.mjs` in a worktree, a resolve hook that falls back to the main checkout's copy (nothing linked or installed).
- `Template.test.mjs`, `TasksPage.test.mjs` and `whisper-detach.test.mjs` are load-sensitive: they use the live site or a real socket and time out when 4 other tests run beside them; alone they pass.
- Coverage is wide: `core/List/List.js` is imported by about 50 tests, so a change there runs them all.
- Full run in the test-basics worktree (2026-10-24): 120 tests, 0 red (the 28 reds: SDK missing in worktrees, `task_key` for session paths, a stale `Append` test).
- The runner's first catch: a fresh `Task` stored `{tasks:{add}}` as plain data (Item.get skipped the lazy `tasks` getter). Fixed in `Task.get`; [child-verb.test.mjs](../Task/child-verb.test.mjs) holds it.

## More
- ⬜ Servex hosts the watch on core/Item + core/Task (next slice)
- Page smoke on change stays `Servex/WorktreeWatch.js` + `Server/smoke.mjs`.

## Notes from your asks

- Work is tested before it is handed back, so it does not fail on first pass and need owner fixes. ([your words](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p11150), 2026-10-12)
