# Page mastermind plan: navigation, items and pages, tests, and the build order

**Version 3 (2026-10-23): the item tool task you assigned at high priority is folded in, and it is being built now; the rest of the plan is unchanged.** Version 1 covered three parts of your ask: typed content (a), readmes as pages (b) and a narrower Page (c). You read it and said linking readmes as pages (`/md/`) is fine ([your words](/framework/ai/sessions/2026/10/20/session-e00f55c9/), latest prompt). Version 2 adds the four things you asked for next: navigation, your model of items and pages checked against the code, tests that run by themselves, and a ranked build order. Parts (a), (b) and (c) are unchanged and sit at the bottom.

## The short answer

- **Navigation:** there are seven ways today, and one rule already sits under most of them. The nearest page with its own navigation stays on screen, and everything below it swaps inside it. For Miller columns I recommend even slots: about 950px each at 3440, so three fit, and opening a column never moves the ones already open.
- **Items and pages:** your model is true for tasks. For pages it is true on disk, but the item tool never builds a real Page. It only checks a field list and appends the line. I measured that the real Page class does load and replay in node, so this gap is small.
- **The item tool for any item (assigned 2026-10-23, high):** reading any task or session by path is already instant. But a question can't be asked without writing a line, a session answers as a plain task list (150 tasks for this session) with no cost, duration or child sessions, and a page gets no instance. That work is now being built (section 2, "The item tool answers any item").
- **Tests:** `core/Test` works, but nothing runs it, and a failing test reaches nobody. Three tests fail right now and nobody knew. The fix: the worktree watcher that already runs per worktree also runs the tests nearest the changed file, and messages the builder when one turns red.
- **Building now:** the item tool for any item (session, task, page), and beside it the tests for Item, List, Store, Page replay and streaming, wired into that watcher. Everything else comes after, because it changes code those tests protect.

---

## 1. Navigation

### The seven ways pages navigate today

| Way | What stays on screen | What changes | Where it is used | Shot |
|---|---|---|---|---|
| **Top tabs** | the tab strip | the one panel under it | every module page (`ext/Doc`), and any page with `navigation:"tabs"` | [tabs at 1920](nav-tabs-1920.png) |
| **Left sidebar** | the site's page tree | the content area beside it | the `/framework/` root, so every page under it | the same shot, left side |
| **Rail** | a list on the left or right | the panel beside it | only the `/imagine/paging/` labs | (no real page uses it) |
| **List and detail** (`ux/Browse`) | the list | the detail pane | every `md/` explorer | [md/ at 1400](md-explorer-1400.png) |
| **Miller columns** (`Page.columns()`) | every open column | a new column opens to the right | `core/Page/overview/columns/` and its demos | [even at 3440](nav-columns-even-3440.png), [measured at 3440](nav-columns-measured-3440.png) |
| **No navigation** | nothing of the page | the child replaces the page | most pages | [takeover at 1920](nav-takeover-1920.png) |
| **Expand** | the row | the row grows in place, and the address does not change | `/imagine/paging/mechanisms/expand/` only | [expand at 1920](nav-expand-1920.png) |

### The one rule I recommend

**A page with its own navigation keeps it, and its children open inside it. A page without navigation is replaced by its child.** Put another way: the nearest page above you that has navigation (tabs, a sidebar, a rail, a columns row) stays on screen, and everything below it swaps.

The code already does this. When a child page opens, `container()` (`Page.class.js:525-533`) looks for the nearest place a parent made for children: a tab panel, a rail panel or a columns row. If there is none, the child is drawn where the parent was drawn, so it replaces the parent. What's missing is the rule written down in one place (`design/navigation/readme.md` and the core/Page readme), plus two fixes for the cases that break it:

1. **Expand changes no address.** Whatever it opens can't be linked to, and that breaks the navigation rule "route everything" (`design/navigation/readme.md`). I'd keep expand only for details that are not pages, like an FAQ answer, and never use it for a child page.
2. **Two of the seven `navigation` words do nothing.** The words are none, tabs, rail, rail-right, expand, columns and takeover (`words.js:43-58`). `columns` and `takeover` are used on no real page. `Page.columns()` is the real columns, and "no navigation" already means takeover. I'd make `navigation:"columns"` call `columns()` and retire `takeover` as a word. *The alternative* is to keep `takeover` as a second name for none.

### Miller columns: a measured width, shared evenly

> **Superseded 2026-10-23, 22:25 (your call, relayed by vscode-mastermind):** Miller columns are no longer the default, because they don't work (on the deputy/roles task page the first column is cut off). The rule for now is **previews plus full detail views**: a list of preview cards, and a clicked card opens its full page in place of the list. The columns code stays, unused by default. Being built in [nav-rule](nav-rule/requirements.md), last section. The text below is kept as the record of what was tried.

You asked: should a column be measured (about 800–1000px of 3000) and add another column, or split the space? Both modes exist today. Here they are side by side at 3440:

- **Measured (the default today).** Each column is about a third of the row, which is 828px at 3440. An open column never changes width. The rest of the row is drawn as narrow empty striped slots. That is the "always a little broken" look: one column, then six empty strips ([shot](nav-columns-measured-3440.png)).
- **Even (opt-in today; the Finder demo uses it).** The row is cut into N equal slots, where N is the row width divided by the recommended column width, rounded down. At 3440 that is 3 slots of about 950px, and each new column fills the next slot ([shot](nav-columns-even-3440.png)).

**I recommend even as the default.** It is exactly your measured column: the measure (about 900px) decides how many columns fit, and then the row is shared equally, so no thin strip is left over. Opening a column never moves the open ones, because its slot was already there. Only resizing the window changes the widths. When more columns are open than fit, the row scrolls sideways, the way Finder does. A column that asks for a width word keeps it: a small rail, or a full-width code view, as on `uses/docs`. *The alternative* is to keep measured as the default and only draw the leftover as plain background instead of strips. That's a smaller change, but with one column open a 3440 screen stays two-thirds empty.

### Where a linked markdown page fits

A link to a `.md` file opens it as `<page>/md/<doc>/`. That is an ordinary child page, so the same rule decides what happens:
- **Under a page with navigation** (the sidebar, tabs or columns), the doc opens inside it, and the navigation stays. In a columns tree, it opens as the next column (`Markdown.js:38-43`).
- **Under a page with no navigation,** it replaces that page. The site sidebar above stays.

**I recommend this rule: the parent's navigation stays, and a markdown page never brings navigation of its own.** The one exception is the `md/` explorer's file list, because that list is the whole point of the `md/` page.

---

## 2. Items and pages: your model against the code

Your model is this. A page is an item, and it streams its `page.jsonl`. Child items save into that file, unless they have their own file or subfolder, and then the root `page.jsonl` notes where they are. One item tool is the page tool.

| Your sentence | True today? | Where it lives |
|---|---|---|
| A page is an item, and it streams its page.jsonl | ✅ yes | `class Page extends Item` (`Page.class.js:32`); `PageJsonl.load()` opens the file and follows it live (`Jsonl.js:26-48`) |
| Child items save into it | ✅ yes | `Store.append()` writes into the host's own file (`core/Item/Store.js:158-190`) |
| A child with its own file or subfolder is noted in the root | ✅ mostly | Pages write `{"file":"<name>/page.jsonl"}` (`Servex/agents/Subpages.js:34-39`). Tasks write `{"task":url,"as":id}` (`page_tools.js:606, 744, 844`). **One hole:** when the parent is a `page.js` (with no page.jsonl), the note does not go into its `children:` list. The helper that would write it exists (`Subpages.js:107-114`), but nothing calls it, and the test for it fails. |
| One item tool is the page tool | ⚠ partly | There is one engine (`run_item`), but six tool names. Three of them (`page_add`, `page_call`, `page_log`) have their own second write path for page.jsonl (`page_tools.js:906-935, 970-974`). |
| The tool builds the item on the server and applies the delta | ⚠ tasks only | For a task, the tool replays the file into a live Task, refuses unknown keys and calls the verb (`page_tools.js:647-722`). **For a page it builds nothing.** It has no Page loader, because "Page touches the DOM" (`page_tools.js:345-355`). So a page line is only checked against a list of field names, then appended. |
| It is tested | ⚠ partly | `item_tool.test.mjs`: 73 of 73 pass, but its cleanup fails now and then on Windows file locks. `page_tools.test.mjs` **fails** (the hole above). No test replays a page.jsonl through the Page class. |

**The server-side Page is closer than the code comment says.** I loaded the real `Page.class.js` in node with a do-nothing DOM of about 15 lines and an import map that sends `/framework/…` to `public/`. Typed lines replayed into their real classes, `PageHeading` and `PageText`, and an unknown type was reported. The probe is in [node-page-probe/](node-page-probe/): run `node --import ./reg.mjs probe.mjs` from that folder. The DOM is touched at import time in only a few places, for example `View.js:468` and the stylesheets that `View.stylesheet()` loads on import. Make those safe without a DOM, and no stub is needed.

### The item tool answers any item (assigned 2026-10-23, high)

[Your words](/framework/ai/sessions/2026/10/20/session-e00f55c9/) (the prompt of 20:19 on 2026-10-23): the server builds the item, replays its lines and holds it in memory; a call then runs a method, which may set, save, do or answer something; and asking what is in a session is one quick call, never reading the raw JSONL or asking a mastermind. One system for every item. Measured today:

| Ask | Today | The work |
|---|---|---|
| Read any item by path, at once | ✅ for a task, a session folder and a process: replayed once and kept in memory (`live_root`, `page_tools.js:647`), so the next call is instant | a page has no instance yet, only rendered text |
| Run a method or set fields, and save | ✅ task and process; ⚠ a page line is appended unchecked | `a-real-page-on-the-server` (gaps 1, 2, 3, 4 and 6 below) |
| Ask without changing anything | ❌ every call with a delta writes a line (`run_item`), so asking a session for its `progress()` would write a junk line | `query-without-writing` |
| A session: its tasks, completion, cost, duration and child sessions | ⚠ a session folder replays as a Task (`class_of`, `page_tools.js:383`): completion yes, but every task is listed and there is no cost, duration or child sessions. `Task.cost` exists (`Agents.js` wires it), but it is not in the answer | `a-session-answers-as-a-session` |
| Tests for Session, Task and Page | Task ✅; a session only through Task; Page ❌ | `tests-for-session-task-and-page` |

**The shape:** the class says which of its methods only read: a `static queries` list such as `["progress", "cost", "duration", "children"]`. A delta whose keys are all queries runs them and answers with their values, and writes nothing. A delta that mixes asking with changing is refused, so the two happen in two calls. "A key naming a method calls it" stays the one grammar. The alternative was a separate `get` key, but that would be a second grammar.

**Where a mastermind's queue lives** (asked by the system architect for the task queue): in the role's own task folder, the way `core/Page/tasks/page-mastermind/` already holds this mastermind's queue across sessions. A session references only the tasks it takes up, never the whole queue, because `Session.progress` counts every child it references. Priority uses the shape that already exists, `{"priority":{"score":N,"why":…}}` (`Task.js:422`; `Task.rank` sorts by it). A plain `"priority":"high"` is ignored by that sort.

### The gaps, most important first

1. **A page line is not applied to a real Page on the server.** So a bad part type or a bad key is saved silently, and you see it only as wrong text in the browser. The fix: make the few import-time DOM lines safe in node, then give the item tool a Page loader the same way it has one for Task. *Size M.*
2. **A part type is known only if something imported its class.** The Parts page names `./Parts.js` on its first line, and the session pages import `PageHeading` by hand (`AISessionDetail.js:20`). The item tool, the tests and the browser must all load one list of types, so one place decides what is valid. *Size S.*
3. **`page.js` parents get no note of their children** (the failing `page_tools.test.mjs`). Wire in the helper that already exists. *Size S.*
4. **Two write paths.** `page_add`, `page_call` and `page_log` should hand their work to `run_item`, so every page write goes through one checked path. *Size M.*
5. **`item.set("prop", anotherItem)` stores a copy, not a reference** (a known gap from 2026-10-20). A child placed that way is not noted in the root. *Size M; it waits until 1–4 are done.*
6. **The item tool's own test is flaky on Windows.** It fails now and then deleting its temp folder (`item_tool.test.mjs:287-288`). *Size S.*

---

## 3. Lock it down with tests

### What runs by itself today

- **`core/Test` never runs by itself.** `TestRunner --watch` exists, but nothing starts it. Every line in `results.jsonl` says `"trigger":"manual"`. The readme lists "Servex hosts the watch" as not done yet.
- **`Servex/WorktreeWatch.js` runs by itself, once per worktree in the pool.** It listens for the dev server's "changed" event (no extra file watcher) and waits 2 seconds after the last change. Then it loads up to 3 changed pages in a headless browser at 4 widths, and messages the worktree's holder if a page breaks. It checks layout and console errors. It does not run tests.
- **The merge gate** (`Server/merge.mjs`) runs `Server/smoke.mjs`, an older page smoke test, and not `core/Test`.
- **So a failing test reaches nobody.** Three fail right now: `page_tools.test.mjs` (the `page.js` hole above), `Server/plugins/SocketServer/Append.test.mjs` (1 of 8: "a string line that is already JSON is still accepted"), and `ai/AITask/tree.test.mjs` (it reads a dated folder that no longer exists).

### What item, page, saving and streaming have today

| Area | Tests | Result |
|---|---|---|
| Item | `Item.test`, `act.test`, `Dated.test` | ✅ pass |
| Task (an item with its own file) | `Task`, `child-verb`, `Project`, `TasksPage` | ✅ pass |
| The item tool | `item_tool.test` ✅ (flaky cleanup); `page_tools.test` | ❌ fails |
| List | none of its own | ⬜ |
| Store (saving and replay) | none of its own; only `act.test` imports it directly | ⬜ |
| Page replay | none (`Template.test` covers templates only) | ⬜ |
| Streaming: append → `Tail.js` → socket → `live.js` → `page.set` | `Append.test` covers the first step only | ❌ 1 fails; the rest ⬜ |

**Measured: an edit to any core file is "covered" by 80 of the 110 tests.** `TestRunner --covers` gives the same 80 for `Store.js`, `List.js`, `Page.class.js`, `Jsonl.js` and `live.js`, because almost every test imports the app. Running all 80 on every save would be too heavy for 12 worktrees. So the proposal splits "near" tests from "all" tests.

### Proposal: the watcher that already exists also runs the tests

One of everything: `WorktreeWatch` already runs per worktree, already hears each change and already messages the holder. I add one step to it instead of building a second watcher.

1. **On a change, run only the near tests.** These are the tests in the changed file's own folder, plus the tests that import that file directly. For `Store.js` that is the `core/Item` tests, about 3 files and under a second. The full set of 80 runs at merge time instead.
2. **Node tests only.** Tests that start a browser (`Template`, `TasksPage`) run at merge, not on every save.
3. **One shared queue in Servex:** at most 3 test processes at once across all 12 worktrees. A new change to a worktree replaces that worktree's queued run instead of adding another.
4. **Report only a change.** When a test goes from pass to fail, the builder that holds the worktree gets one message and one `task.jsonl` line: the test's name and its first failing line. Its mastermind sees that line on the task. When the test goes back to passing, it gets one more line. A test that keeps passing says nothing. Every run still appends to `results.jsonl`, so [/framework/core/Test/](/framework/core/Test/) shows the latest state.
5. **The merge gate runs every test that covers the diff,** beside `smoke.mjs`. A red test stops the merge.

**Cost:** a typical save runs 1 to 5 node processes of about 0.1 to 0.5 seconds each, with no browser. With 12 worktrees saving at once, the shared queue still keeps it to 3 processes.

### The first five tests (item, page, saving, streaming)

1. **`core/Item/Store.test.mjs`:** a `set()` appends one line; replaying the file rebuilds the same state; a child with its own file writes its own file plus the note in the root.
2. **`core/List/List.test.mjs`:** add, remove, move and order survive a save and a replay.
3. **`core/Page/Page.test.mjs`:** replay a page.jsonl through the real Page class in node (grown from the probe). Typed parts become their classes, and an unknown type is reported.
4. **The item tool on a page:** a page line builds a Page, a bad key or type is refused, and the `page.js` parent gets its note (this makes `page_tools.test` pass).
5. **Streaming end to end, in node:** append a line to a page.jsonl in a temp folder, then check that `Tail.js` sends it over the socket and that `live.js` calls `page.set`, so the page's content changes. It reports the time taken and needs no browser.

---

## 4. The build order

Ranked for one outcome: a page, data and streaming system that is rock solid. Each step ends with a commit, and the merge is yours.

| # | Step | Why at this place | Size |
|---|---|---|---|
| 1 | **The five tests, run by WorktreeWatch and the merge gate** (section 3) | Every later step changes Page, Store or the tool. Without tests a break is silent, and three already are. | M |
| 2 | **The item tool answers any item** (assigned 2026-10-23, high): ask without writing, a session answers as a session, a real Page on the server (gaps 1 and 2), tests for all three | It makes "a page is an item" true on the server too, and a question about a session becomes one instant call. A bad line is refused when it is written, not found later in the browser. **Started 2026-10-23.** | M–L |
| 3 | **The item tool's holes** (gaps 3, 4 and 6) | One checked write path, and the failing test passes. | S–M |
| 4 | **(a) Typed content:** `part-view`, `part-file`, unknown types refused | Nearly free after step 2, because the class itself does the refusing. | S |
| 5 | **Navigation:** the rule written down, even columns as the default, expand kept for things that are not pages, the two `navigation` words fixed | This is what you see most. It touches other files (`Columns.js`, `Page.css`, `words.js`), so it can run beside steps 1–3 in its own worktree. | M |
| 6 | **(b) A folder with only a readme opens as a page** | Small, and it uses step 4's `part-file`. **Landed 2026-10-24:** [doc/subpages.md](/framework/core/Page/doc/subpages.md), e.g. [/framework/core/Events/](/framework/core/Events/). | S |
| 7 | **(c) A narrower Page** | It moves the most code, so it goes last, protected by the tests from step 1. Step 3 of (c) renames the forwarders' callers, which is major surgery under CLAUDE.md. | L |
| beside each step | **Archive the dated docs in `core/Page/doc/`** | Scripted, with a manifest, and nothing deleted. | S |

**Building now:** step 2, because you assigned it at high priority, and step 1 beside it. Both rest on the same new fact: the real Page replays in node. The tests use it to check pages, and the item tool uses it to refuse bad lines. With those two in place, a broken page, a bad line or a broken stream turns red within seconds, and the builder hears about it without anyone opening a page.

---

## What you can still change

Each step is built in a worktree and brought to ready-to-merge, and the merge is yours. Steps 1 and 2 are being built now. The rest follow in order, using the defaults above unless you change them:
- **The one navigation rule:** the nearest page with navigation stays, and everything below it swaps.
- **Even columns as the default:** about 950px at 3440, so three fit, and an open column never moves.

---

## Appendix: version 1, unchanged

### What I found first (it changes the plan)

- **`Page.class.js` is 745 lines, not thousands.** It was split on 2026-10-12, from 2,270 lines down to 745 ([split-plan.md](../../doc/split-plan.md)). The problem now is width, not length. Page still has about 100 methods, and 49 of them are one-line forwarders. Each forwarder builds a throwaway helper object on every call, for example `tab(obj){ return new Jsonl({page:this}).tab(obj) }`.
- **Typed content mostly exists already.** `part-heading`, `part-text` (any amount of markdown: paragraphs, lists, code), `part-card` and `part-link` all work today. The one piece missing is a custom view class as a content item.
- **Readmes as pages mostly exist already.** Every page answers `<its url>/md/`. That is the Markdown Explorer (built 2026-10-19), and it is driven by `files.jsonl`. It shows the readme in the pane and every `.md` file in the list beside it ([shot](md-explorer-1400.png), [try it](/framework/core/Item/md/)). Two things are missing. First, a folder with a `readme.md` and no `page.js` does not open as a page. Second, a page cannot place a markdown file among its own content parts.

### (a) An AI writes page content by type, through the item tool

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

### (b) Readmes become browsable pages, from `files.jsonl`

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

### (c) A narrower Page: small classes, attached once

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

### Alongside: the docs are current

`core/Page/doc/` holds 60+ files. Some are dated snapshots (`readme-before-2026-10-19.md`, `readme-full-2026-10-12.md`, `readme-moved-2026-10-17.md`) and some are scripts (`split-*.mjs`, `comment-*.mjs`). With each step I move the stale ones into `doc/archive/`, using a scripted move with a manifest (nothing is deleted). I also correct the readmes to match the code, for example "Page.js is thousands of lines" and the count of part files.
