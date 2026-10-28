# Build H: watch a class's test run, drawn in the default view, from the integration branch, NOT merged

**The owner (asks 26 and 44):**
- "For each test that we create, I should be able to run the test, but also see the outcome of the test rendered on screen with those debug views. That's what I used to do, and it works pretty well, especially if I can step through the test itself by putting breakpoints there."
- "If the rendered view gets updated line by line synchronously… we might need to manually trigger app.inject on a test page."
- One core test per class covering about 80%, through every way an object is created (a UI click, a replay from JSONL), each with the same outcome.

## What exists (on `integration/data-shapes`)

- **The default view:** `ux/Content/Object/DefaultView.js`. It's live and redraws only the row that changed.
- **The step-through demo:** `core/Item/watch/`.
- **Class pages with the core test drawn step by step:** Item 6/6, List 7/7 (build C; `ext/Doc/`, `core/Item/`, `core/List/`).
- **Build A's persistence matrix test,** and seat (g)'s delta-flow test (node, `*.test.mjs`).
- **The app's delayed inject** (`/app.js`), and the test system under `core/Test/` (read its readme first).

## Setup

`git worktree add C:/Code/lew42/worktrees/test-view -b worktree/test-view integration/data-shapes`, then lock it. Start its dev server through Servex and log the url.

## Scope

1. **One test, two places, the same code:**
   - a class's core test is written once, as a list of steps;
   - it runs headless in node (pass/fail), and in the browser on a test page that draws every object it makes in the default view.

   Reuse build C's step format if it fits. Don't invent a third.
2. **The browser run is synchronous and steppable:**
   - the page injects before the first step (`app.inject` by hand if needed), and each step's change shows before the next one runs;
   - a `debugger`-friendly mode (a `?step` flag) pauses between steps, so a breakpoint in DevTools shows the object's view at that moment;
   - Next and Run-all buttons.
3. **Both creation paths in one test:** build an object by the UI path (a click calls a verb), then rebuild it by replaying its saved lines, and show that the two views match.
4. **Do it for `Item`, `List` and `Task`.** If `Task` needs no new runner code, the pattern holds.
5. **Look at it:** headless screenshots at 1920 and 400, judged against the page skill. One line of text per step, at most.

## Fences

- No changes to `core/Item/Item.js`, `Store.js` or `core/List/List.js`; log any request instead.
- **Don't merge.** Don't restart Servex or the main dev server.
- **When done:** run `node Server/review.mjs <this task dir> <worktree>`, answer every finding, and land with the branch, url, screenshots and review phrase.
- **Budget:** about $35. Spawn no one but the reviewer. **Finish by about 21:15.**
