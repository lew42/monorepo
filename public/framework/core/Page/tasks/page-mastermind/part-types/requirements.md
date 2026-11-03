Budget: $8

# core/Page parts: `part-view` and `part-file`, two new content types a page.jsonl line can add

Load the `minion` skill first, then the `page` skill (you are making a demo page). This task's log is `session.jsonl` in this folder.

**Why:** today a page.jsonl card can be only a heading, a text, a card or a link. An agent that wants a chart or a readme inside a page has no way to say so in one line. The design is already written: [plan.md](../plan.md), section "(a) Typed content", lines 178-205. Read it first; this brief only adds where things are.

## What each line looks like

```jsonl
{"content":{"add":{"type":"part-view","class":"./MyChart.js","data":{"value":92}}}}
{"content":{"add":{"type":"part-file","file":"./readme.md"}}}
```

- **`part-view`**: imports `class`, a path relative to the page's folder. If the module's default export has a `render`, the part builds `new Default({ page, item, ...data })`. Otherwise it calls the export as `fn(page, box, data)`.
- **`part-file`**: renders that markdown file in place.

## Where things are (your branch already contains worktree/qf-5)

- Part classes: `public/framework/core/Page/parts/PageCard.js` is the pattern. It is an `Item` subclass, with a `.View` that has `render()`, and `Item.register(Class, "part-…")`.
- **The ONE list of part types:** `public/framework/core/Page/parts/kinds.js`. The browser, the item tool and the tests all import it. Add both new types there.
- **Code to reuse, not copy:** `Jsonl.draw_module(url, data)` and `Jsonl.draw_md(url)` in `public/framework/core/Page/Jsonl.js:235-252`. The page-level `place` line uses them through `draw_placed()` at line 225. Make the two parts and `place` share one implementation (law 6). Either the parts call these methods, or the methods move into the parts and `place` calls the parts. Choose one and log a `decision` line naming the alternative.
- **The url base:** `draw_placed` resolves the path against `location.origin + this.page.log_folder()`. The parts resolve the same way.
- **The item tool already refuses an unknown part type**, from `PART_TYPES` (`Servex/agents/page_tools.js:788`). Once the list holds the two new types, check that both lines are accepted.

## Do

1. Add `PageView.js` (`part-view`) and `PageFile.js` (`part-file`) in `core/Page/parts/`, and add both to `kinds.js`.
2. **Tests:** add cases to `Servex/agents/item_tool.test.mjs`:
   - a `part-view` line and a `part-file` line are accepted, and they replay into the two new classes;
   - `part-nope` is still refused, and the refusal lists the types.
   Also add a case to `public/framework/core/Page/Page.test.mjs` if it fits there.
3. **Demo:** `public/framework/core/Page/parts/example/` (it exists; read it first) or a new `parts/types/` folder holds one page with one part of each of the six types:
   - include a tiny View module for the `part-view`;
   - point the `part-file` at a real `.md` in that folder.
   Write the lines with `node .claude/hooks/append.mjs <file> <json-array-file>`, run in YOUR worktree. Never write through the live item tool: that writes the main tree.
4. **Docs:**
   - `public/framework/core/Page/doc/ai-api.md`: the two new types, plus a note that `part-text` already takes a whole markdown block, so no new type is needed for one;
   - `core/Page/parts/readme.md`: the six types.
5. **Prove it:**
   - `node --check` every touched file, and run both tests;
   - smoke `/framework/core/Page/` and your demo page: `MSYS_NO_PATHCONV=1 node Server/smoke.mjs C:/Code/lew42/worktrees/part-types <url>`, run from the main tree;
   - headless shots of the demo at 400, 1200, 1920 and 3440. Put them in the demo's own `doc/`, not `shots/`, which is git-ignored;
   - **live:** with the demo open headless on your worktree's server, append one more part line and show that the page redrew without a reload (a shot before and after, or the part count before and after).
6. Log `ready: worktree/part-types at <sha> <one line>` on this task, and send `mastermind-page` one line.

## How

- Your worktree is `C:/Code/lew42/worktrees/part-types`, branch `worktree/part-types`. It is already made and contains `worktree/qf-5`, so it merges after qf-5. Commit after each step.
- Never kill or restart the dev server or Servex, never drive the owner's tabs (headless only), and never `git stash`. Edit nothing in the main tree except this task's log.

**Deliverable:** the branch, the two classes in the one list, the tests passing, the demo with its four shots, and one decision line. If time runs out, cut the 3440 shot first, then the `Page.test.mjs` case.
