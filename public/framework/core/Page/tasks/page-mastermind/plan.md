# Page mastermind plan: typed content, readmes as pages, a narrower Page

**This is a plan, so nothing is built yet.** It covers the three parts of your ask about `core/Item` and `core/Page` ([your words](/framework/ai/sessions/2026/10/20/session-e00f55c9/), latest prompt). When you approve the shape, I build it in a worktree in the order a → b → c. Each step ends with a demo you can open and a merge you approve.

## What I found first (it changes the plan)

- **`Page.class.js` is 745 lines, not thousands.** It was split on 2026-10-12, from 2,270 lines down to 745 ([split-plan.md](../../doc/split-plan.md)). The problem now is width, not length. Page still has about 100 methods, and 49 of them are one-line forwarders. Each forwarder builds a throwaway helper object on every call, for example `tab(obj){ return new Jsonl({page:this}).tab(obj) }`.
- **Typed content mostly exists already.** `part-heading`, `part-text` (any amount of markdown: paragraphs, lists, code), `part-card` and `part-link` all work today. The one piece missing is a custom view class as a content item.
- **Readmes as pages mostly exist already.** Every page answers `<its url>/md/`. That is the Markdown Explorer (built 2026-10-19), and it is driven by `files.jsonl`. It shows the readme in the pane and every `.md` file in the list beside it ([shot](md-explorer-1400.png), [try it](/framework/core/Item/md/)). Two things are missing. First, a folder with a `readme.md` and no `page.js` does not open as a page. Second, a page cannot place a markdown file among its own content parts.

---

## (a) An AI writes page content by type, through the item tool

**What the AI writes:** one line per part, through `item({path, delta})`. `page_set` is the same writer under an older name (both live in `Servex/agents/page_tools.js`).

```jsonl
{"content":{"add":{"type":"part-heading","text":"Findings"}}}
{"content":{"add":{"type":"part-text","text":"Any **markdown**: paragraphs, lists, code blocks."}}}
{"content":{"add":{"type":"part-card","title":"Cache","text":"Hit rate 92%."}}}
{"content":{"add":{"type":"part-view","class":"./MyChart.js","data":{"value":92}}}}   ← new (any module whose default export is a View class)
{"content":{"add":{"type":"part-file","file":"./readme.md"}}}                                        ← new, used by (b)
```

**What changes:**

1. **New: `part-view`**, a custom view class as one content item. The item imports `class` and builds `new Default({ item, page, ...data })` if the module has a `render`. Otherwise it calls the export as `fn(page, box, data)`. The code for this already exists as `Jsonl.draw_module`, behind the page-level `place` line. I move it into the part, so `place` and `part-view` share one implementation (one of everything).
2. **New: `part-file`**, a markdown file rendered in place, for example a readme as the first part of a page. It reuses `Jsonl.draw_md`.
3. **The tool lists the types and refuses unknown ones.** The item tool's `instructions` for a page lists every registered part type. It reads that list from `Item.types`, so it is computed, never typed by hand. An unknown `type` is refused at write time, with the list of known types in the answer. Today an unknown type is quietly saved as a plain Item and drawn as bare text.
4. **No new type for "a markdown paragraph".** `part-text` already renders a whole markdown block (`ext/markdown/md.js` → `marked.parse`). I document that in [ai-api.md](../../doc/ai-api.md) instead of adding a second type.

**Choices I made, and the alternatives:**
- The new field is called `class`, the same word line 1 of a `page.jsonl` uses. The alternative is `module`, the word `place` uses.
- The names are `part-view` and `part-file`. The alternative is one `part-embed` that switches on the file extension. Two names are clearer to read than one name with a hidden switch.

**Done when:** a demo page under `core/Page/parts/` has one of each type, written only through the item tool, and it redraws live as each line lands. A shot is taken at 400, 1200, 1920 and 3440.

---

## (b) Readmes become browsable pages, from `files.jsonl`

**What you see:**

| url | shows | today |
|---|---|---|
| `/framework/<module>/md/` | the readme, with every `.md` file listed beside it | ✅ built ([shot](md-explorer-1400.png)) |
| `/framework/<folder>/` where the folder has only a `readme.md` | the readme as the page, its `.md` siblings listed below it, and an `md` tab | ⬜ today this falls back to a plain page load |
| a `page.jsonl` page | `{"type":"part-file","file":"./readme.md"}` places the readme among the cards | ⬜ comes with (a) |

**What changes:**

1. **A readme is a page.** In `Page.child()`, after the `page.js` probe misses: if the folder's listing (`files.jsonl`) has a `readme.md`, the child opens as a `PageMarkdown` page of that folder. This follows your order, readmes first and pages second. The readme gives the content its shape. A `page.js` or `page.jsonl` added later takes over, and nothing has to be moved.
2. **The `md` tab shows wherever a folder has `.md` files.** The rule is `md_tab()` in `ext/Doc/Doc.js`, and it already does this for module pages. I check that it also holds for pages that are not modules.
3. **Production.** `files.jsonl` is committed (3,613 files), so the explorer's list should work on the static site too. I check it with a headless shot of the deployed site, and remove the explorer's "this server has no file list" message if it turns out to be stale.

**Logged for later, not built now:** a real file-system UI: browse a directory's files, syntax-highlighted, with a deliberate place to open it from. `fs/` (`ext/files/explorer.js`) is the start of it. This becomes one ⬜ line in the core/Page readme.

**Done when:** a folder that has only a readme opens as a page. Shots at 400 and 1920.

---

## (c) A narrower Page: small classes, attached once

**The target shape.** `Page.class.js` keeps only what makes a page a page: a name, a url and its chain, `set`/`get`, `child(name)` (routing) and `render()`. That is about 250 lines. Every other group is its own small class, made once per page as a lazy property instead of once per call:

```js
class Page extends Item                      // url, chain, set/get, child(name), render  (~250 lines)
  get log()      → PageJsonl                 // tab, place, file, overlay, listing: 24 forwarders today
  get columns()  → PageColumns               // the Finder shape: 10 forwarders today
  get previews() → PagePreviews              // walls, cards, thumbs: 6 forwarders today
  get links()    → PageLinks                 // open_link, swap_link, md helpers: 4 forwarders today
  static load / file / from / props / slug   → PageLoad   (the statics, ~100 lines)
```

**Three steps, safest first:**

1. **One helper per page.** Each forwarder calls a lazy property (`this._log ??= new Jsonl({page:this})`) instead of building a new helper on every call. No behavior changes and no caller changes. Proof: the node tests pass and the shots match before and after.
2. **Move the groups still inside `Page.class.js` into their own files:** the statics into `PageLoad`, roles and words into `words.js` (which already exists), and activate/deactivate into `Frame.js`. This is done by a node script with a dry run and a manifest of every moved method. Measured with `doc/split-measure.mjs`, before and after.
3. **Retire the forwarders.** Callers move from `page.tab()` to `page.log.tab()`, through a scripted rename with a manifest. This is "major surgery" under CLAUDE.md (a dozen callers or more), so it is the one step that waits for your OK on the merge.

**Done when:** `Page.class.js` is under about 300 lines, no method body builds a helper, and every node test plus the headless shots at 400, 1200, 1920 and 3440 match.

---

## Alongside: the docs are current

`core/Page/doc/` holds 60+ files. Some are dated snapshots (`readme-before-2026-10-19.md`, `readme-full-2026-10-12.md`, `readme-moved-2026-10-17.md`) and some are scripts (`split-*.mjs`, `comment-*.mjs`). With each step I move the stale ones into `doc/archive/`, using a scripted move with a manifest (nothing is deleted). I also correct the readmes to match the code, for example "Page.js is thousands of lines" and the count of part files.

## The one decision for you

Approve the shape of (a), (b) and (c) as written, or change it. The defaults I'd build with are written above. I build nothing until you say go.
