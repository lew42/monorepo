# test("name", fn): how it works, what it costs, what we did not do

The owner's shape: a name and a function. `test()` in `Test.js` queues it. In node it runs at once and prints PASS/FAIL. On a page `Test.stage` (a `TestBlocks`) is set first, so `test()` hands the entry over: the stage makes a block, runs the same function through `Test.run`, and draws the verdict. One runner, two ways to show it.

## Caveats
- **Capture is synchronous.** Views made before `fn`'s first `await` land in the block by themselves. After an `await`, give the thing to `t.view(thing, "label")`, or return it. (Same trap as a demo: `core/View/doc/capturing.md`.)
- **Nothing node-only at the top of a test file.** `import fs from "node:fs"` at the top breaks the page. Put those in a `test.node(...)` and `await import("node:fs")` inside it; the page lists such a test and does not run it.
- **Failing optional tests fail.** `test.optional` only changes how the page shows it (closed, dashed, "edge case"). In node it counts like any test; the exit code is 1 if it fails.
- **Views are the inspector.** Returned Items and `t.view` use `DefaultView` even when the class has its own `View` (as `TestView` does), so every instance opens to its properties.
- **Which files have a page link** is the `FILES` list in `view/page.js`. A file not on the list still opens with `?file=`.

## Not taken
- **A second runner for pages** (a `.test.js` browser format): two systems to keep in step. One file, two hosts instead.
- **Auto-drawing every Item `fn` creates** (patching `Item`'s constructor): magic that draws scratch objects too, and Item.js is not ours to change. Returning or `t.view`-ing the object that matters is explicit and cheap.
- **Every check as its own test:** the owner wants one or two tests that cover a behavior, so a block is a test and its checks are lines inside it.
- **A second page for blocks:** `view/` already is "watch a test run"; `?file=` picks the blocks view, `?test=` the steps view.
