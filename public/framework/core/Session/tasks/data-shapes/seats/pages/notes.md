# Seat (d) `pages`: findings

Asks 11–14 and 20 of [../../requirements.md](../../requirements.md). One page of shape: [shape.md](shape.md). Every count below came from a script (listed at the end), and each "works" was checked by running the code.

## 1. Page vs Item today (ask 11)

**What Page is.** `class Page extends Item` (`core/Page/Page.class.js:33`). A page built from code is a `page.js`, and a page built from a log is a `page.jsonl`. Saving, `set(delta)` and replay come from Item. Page adds a url, routing, content parts, layout words, tabs, columns, previews and the inbox.

**How much Page adds.** Measured by walking the prototypes in node:

| Class | Own methods and getters | Statics | Lines (with helper files) | Own keys on a fresh instance |
|---|---|---|---|---|
| Item | 22 | 14 | 397 | 3 |
| Page | 105: 100 new, plus 5 overrides (`assign`, `bubbles`, `set`, `get`, `lists`) | 40 | 701 + 15 helper files ≈ 2,250 | 11 |
| Task | 59 | 28 | 621 | |
| Session (extends Task) | 11 (89 counting inherited) | 13 | 181 | |

**What a Page subclass inherits.**
- All 126 prototype names and 75 statics.
- A constructor that runs `hoist_content`, `naming`, `declare`, the page extensions and `initialize`.
- A `set()` that records every line in `jsonl_lines` and pulls out the layout words (`Page.class.js:74`).

### Should a session *be* a page, or *have* one?

**The code already answers "has", and "be" is not possible without surgery.**

1. **Single inheritance blocks it.** The chains are `Session > Task > Item` and `Page > Item`, and JavaScript gives a class one parent. For Session to be a Page, either:
   - Task rebases onto Page, so every task record (about 1,700 folders) carries Page's 100 extra names and its constructor work; or
   - Page becomes a mixin, which is major surgery (CLAUDE.md, "Ask before").
2. **Three names would collide, each with a different meaning:**
   - `children`: on Task it is the child *sessions*, computed (`Task.js:218`); on Page it is the Map shim over subpages (`Page.class.js:130`).
   - `content`: both are Lists, but Page's is typed parts with the `hoist_content` rule (`Page.class.js:91` vs `Task.js:74`).
   - `render`: Task draws through TaskView (`Task.js:128`); Page draws the routed frame.

   Each collision is a silent override, not an error.
3. **The pattern already in the code is "has":**
   - `TaskPage extends Page` loads the folder's `task.jsonl` or `session.jsonl` and sets `this.task` (`core/Task/TaskPage.js:7`, `load_task`).
   - `AISessionDetail extends Page` draws one session at its dated folder (`ai/AISession/AISessionDetail.js:41`).
   - The proposal says the same: rename the viewer `AITask` to `AITaskPage` so that the record can be the Item (`ai/system-proposal.md:222`).
   - The 1,072 `page.js` files inside dated folders are mostly these thin stubs.

**What "has" costs:**
- Two objects per session.
- One more name per record type (`SessionPage`, `TaskPage`).
- Each side needs one link to the other: `page.record` going down, and `record.url` (computed from its folder) going up.

That is cheap, because the namespaces stay apart. A change to Page's 100 names never reaches a Task, and a Task's verbs (`start`, `stop`, `complete`) never show up on every page.

**When "be" would win:** only if most records needed Page's layout machinery on their own, and none do today.

**Recommendation: "has".**
- A record is an Item with data, lists and a computed `url`.
- Its page is a thin Page subclass with `record`, `route()` and layout, and nothing else.
- This keeps the owner's lean, and it is what `TaskPage` already does.

## 2. Page CRUD audit (ask 12)

**What exists.** `Servex/agents/Subpages.js` (124 lines) does `add`, `rename` and `remove` for the children of one parent. It sits behind `page_set {pages:{add|rename|remove}}` and the `create_page` tool (`Servex/pages.js:90`).
- **add** makes `<name>/page.jsonl` (line 1 holds the labels) and appends `{"file":"<name>/page.jsonl"}` to the parent's `page.jsonl`, creating that file if the parent only has a `page.js`. It never edits a `page.js`.
- **rename** moves the folder, then writes a `gone` line for the old name and a `file` line for the new one.
- **remove** moves the folder to `_removed/<name>-<time>/` and writes `gone`. Nothing is deleted.

It has a dry run and a CLI. There is no `ext/Make` module any more; `ext/editor` and `ext/files` do not create pages.

**Does it work? Mostly yes, verified by running it:**
- ✅ `node Servex/agents/page_tools.test.mjs`: 33 checks pass. Lines 90–128 cover add, rename and remove on a jsonl parent and on a `page.js` parent.
- ✅ `node public/framework/core/Page/Page.test.mjs`: 21 checks pass. Template: 14/14. TasksPage: 4/4.
- ✅ The CLI on a scratch tree (add, rename, nested add, remove, and a bad name refused): every result was what the doc says. A removed child landed in `_removed/`; nothing was lost.
- ✅ Headless browser, with a `page.js` parent (declaring one child) and a created child plus its own child, served under a page-tree url:
  - the created child and its grandchild open and render;
  - after a rename, the new url opens.

**What does not work:**
1. **A created child is invisible from its parent.**
   - What I saw: the parent page (a `page.js` with `children: "declared"`) shows only "Declared kid" in the sidebar. The created child appears only after you visit its url. Screenshots: `shot-1` and `shot-2` in the scratchpad.
   - This is the open question in `core/Page/doc/subpages.md` ("Navigation… the nav was not checked"), now answered: it does not show.
   - `children: "… auto"` would adopt it (`Page.class.js:271`, `declare`), but **0 pages use `auto`**.
2. **No move between parents.** `rename` only works within one folder. Moving a page to a new parent is a hand job.
3. **A rename leaves no redirect.** The old url is a 404, so every link to it breaks silently.
4. **A page inside a task folder never routes.**
   - What I saw: my first probe, a `page.js` under `core/Session/tasks/data-shapes/seats/pages/`, opened as "404 — nothing matches".
   - Why: `child("tasks")` hands any `tasks/` folder that has no `page.js` of its own to `TasksPage` (`Page.class.js:384`), and from there only record folders route.
5. **Almost unused.** 16 live subpages in 5 parents were made this way (24 `file` lines, 8 of them `gone`), against 1,276 live `page.js` pages. The tool exists, but the site is still built with `children:` strings.

## 3. How child pages are stored today, and what they should be (ask 12)

**Today, four mechanisms feed one list:**
- `page.pages` is a List (`Page.class.js:128`, `of: null`). It is the real store.
- `page.children` is a Map-shaped shim over that list (`Children.js`, "`instanceof Map` stays true").
- The shim is **not retired.** There are 105 matches of `.children.get/set/has(` outside old and dated folders (some belong to other Maps), against 22 calls on `.pages.`. `declare()`, `add()` and `child()` all go through it.

The four feeds:

| Feed | Count (live) | Persisted as |
|---|---|---|
| `children:` in `page.js` | 259 string · 124 array · 41 object · 6 function | code; it reruns on every load (a "code-made" structure) |
| `{"file":"x/page.jsonl"}` / `gone` | 16 live children | special lines handled by `Jsonl.file` and `link_child` (`Jsonl.js:61,89`), not List deltas |
| the folder (`files.jsonl` from `Server/plugins/PageFiles.js`, `/api/folder-names`) | every folder | the dev server; `child()` falls back to it |
| `route(name)` | 70 `page.js` files | code (dynamic pages) |

**Problems:**
- **Order is undefined across feeds.** Declared names come first, and the rest show only when visited.
- **A child in its own file has two spellings.** Pages write `{"file":"x/page.jsonl"}`, while tasks write `{"task":"<folder url>"}` (`Task.js:453`).
- **The `file` line bypasses List.** A subpage add is not a `pages` delta, so List's ids, order and move do not apply to it.

**What it should be.** Only the ask is the owner's; the shape is my proposal.
- **One List, `pages`, persisted like any other list:** `{"pages":{"add":{"ref":"x/"}}}`, then `move` and `remove` as list verbs.
- **One reference shape for "a child that lives in its own folder",** shared by pages, tasks and sessions.
- **Code builds the structure; lines add the rest.** `children:` in `page.js` stays as the code-made default and reruns harmlessly, because it only makes stubs. Lines in `page.jsonl` add to it.
- **The file system stays as discovery only.** It works like `auto` and fills in folders nobody declared, after the declared ones, so a new folder still shows up.
- **A rename writes the new ref plus a `{"moved_to":"y/"}` line at the old name,** so the old url redirects instead of returning a 404.

## 4. Route vs item: should a file-owning item draw differently? (ask 11)

**Yes.** The question to ask is whether a child is **inline** (its lines live in the parent's file) or a **reference** (its own file or folder). Whether the child is a Page or an Item does not matter for this.
- **Today both kinds exist:**
  - pages: a `tab` (embedded) vs a `file` line (`core/Page/doc/subpages.md`, the table);
  - tasks: an inline `tasks.add` vs a `{"task":"<folder>"}` reference.
- **Today they draw differently by accident.** A referenced Task becomes a live child replayed from its file (node only: `Task.resolver` reads disk). A referenced page is just a sidebar entry once visited.
- **The proposed rule:**
  - An **inline child** draws in place.
  - A **referenced child** draws as a link card. The card shows its title and state, says where it lives ("own folder"), and opens at its url.
  - Its url comes from the viewer page for its record type, the way `TaskPage.route` already opens any record folder (`is_record_folder`).
  - So every file-owning item gets a url through its viewer page, and an item with no file of its own has no url, only an anchor inside its parent.

## 5. What pages must carry later: shapes only, nothing built (ask 13)

Every one of these follows the same pattern: a **record** (an Item) and a **thin page** that has it.

```
User extends Item       { name, avatar, sessions: List<Ref Session>, pages: List<Ref Page>, teams: List<Ref Team> }
UserPage extends Page   { record: User }                         /u/<name>/
Team extends Item       { title, members: List<Member>, topics: List<Ref Topic> }
  Member extends Item   { user: Ref User, role }
Topic extends Item      { title, chat: Chat, channels: List<Channel>, pages: List<Ref Page> }
Channel extends Item    { title, chat: Chat }                    one file per channel (it grows without end)
Chat extends Item       { messages: List<Message | Ref> }        a reference to a sentence or task, or an owned card
TopicPage extends Page  { record: Topic, is: "topic" }           Page already has role words: nearest("topic"), 22 uses
```

**What the current base lacks for these:**
- **Identity and permission.** The item tool trusts every caller; there is no user, and no "who may write this list".
- **A data class for chat.** There is no `Chat` or `Message` data class (`ai/system-proposal.md:52`); `Chat` today is view code.
- **Browser-side references.** `Task.from_ref` resolves `{"task":…}` through `Task.resolver`, which only node sets. A browser cannot yet replay a referenced child.
- **Global ids.** Ids are unique only among siblings (seat a). A reference from a channel to a task in another file needs a path or a global id.
- **A home outside `/framework/`.** Users, teams and topics are site data, not framework docs. They would want their own root (like `ai/sessions/`, dated or keyed by name), each with its own folder (the owner's "data lives with its page").
- **Size.** A long-lived channel is the editor problem again (section 6). Give it one file per channel, and later one file per month; seat (e) has the size limits.

## 6. A web editor, Webflow- or Figma-like (ask 14)

**It already exists in small form.** `ext/editor` (drag-and-drop blocks) on `ext/Panel` (a workspace of panels) is built on Item and List.
- Headless check: it loads with no errors. It shows a block palette, a canvas, a layer tree (Item › Section › Text, Grid, Card) and a properties panel (`flex`/`grid`, gap, column). Screenshot: `ed-editor.png` in the scratchpad.
- It saves in **snapshot mode**, the owner's older system: `FileSaver` writes the whole document to `/data/editor.json` (1,993 bytes), on every change (`ext/editor/page.js:21-25`). The data sits in a global `public/data/` folder, not beside its page.

**The shape with JSONL deltas:**

```
Document extends Item   { title, layers: List<Layer> }            one file: <page>/design.jsonl
Layer extends Item      { type, props: {…}, layers: List<Layer> }  a tree; ids unique per document
a change   = {"<layer id>": {"props": {"gap": "1em"}}}            walks by id (Item.get), one line
a move     = {"<parent id>": {"layers": {"move": {id, after}}}}
history of one layer = the lines that name its id: filter, then replay
```

**Where it breaks today:**
1. **Ids and walking.** `Item.get(key)` finds a child id across the item's own lists, one level at a time (`Item.js:177`), so a deep layer has to be addressed by nesting its ancestors' ids. A flat `{"<deep id>":…}` line works only if the root keeps an id index (`Task.below` does this for tasks; Item does not). An editor needs ids that are unique per document, plus the index.
2. **Mouse-rate writes.** A drag would write about 60 lines a second. The rule should be: preview locally, and write one line on release (`pointerup`) or after a short pause. The log records decisions, not pointer samples. Today's `act()` writes one line per verb, so this needs no new mechanism, only the discipline.
3. **Can several pages share one file?** They can (lines address by id), but they should not. 50 pages with hundreds of layers each would put every page's history in one tail. One `design.jsonl` per page keeps each replay small and each tail quiet; seat (e) has the numbers.
4. **The store switch.** The editor uses `Saver` (whole JSON) and pages use `Item.Store` (lines). A swappable store (seat a) would let the same document write either way.

## 7. Other data structures pages could carry (ask 20, brief)

One line each:
- **Table** (rows as Items; `ext/DataGrid` draws 2,000 rows).
- **Graph** (nodes and edges as two Lists; the importance graph under `/imagine/importance/` did this in JSONL).
- **Timeline** (a List sorted by time; `ext/Timeline`).
- **Board** (Lists of Lists; the task board).

Each one is "Item + named Lists". The one new need is the id index from section 6, so a line can name any node directly.

## The owner's directions: where they hold and where they break

- ✅ **"A session should have a page, not be one."** This holds, and the code already does it (TaskPage, AISessionDetail). Being one is blocked by single inheritance and the three collisions above.
- ✅ **"A page has a route; an item may own a file but has no page."** This holds. Refined: a file-owning item gets a url through its viewer page, by record type, and an inline item gets none.
- ⚠ **"`children` was a pseudo-map, since retired."** Only half true. The data moved into the `pages` List, but the Map shim (`Children.js`) is still the main API, with about 105 call sites.
- ⚠ **"Automatic from the file system, or from creating a page inside a page?"** Both exist today, plus code (`children:`) and `route()`. Nothing orders them, so a created page is invisible from its parent. Recommendation: one list, declared order first, the file system as a fallback.
- ✅ **"Page CRUD was never tested with confidence."** Add, rename and remove are tested (33 checks) and work. Moving between parents, nav visibility and redirects were never built.

## Scripts and evidence (scratchpad, not the repo)

All in `%TEMP%/seat-pages/`:

| Script | What it checks |
|---|---|
| `count.mjs` | prototype census of Item, Page, Task, Session and AISession |
| `census.mjs` | page files and how children are declared |
| `crud.mjs` | Subpages on a scratch tree |
| `mk.mjs` + `probe3.mjs` | headless routing of a created child, before and after a rename (the probe folder was removed afterwards) |
| `ed.mjs` | headless load of the editor and Panel pages |

Screenshots: `shot-1.png` (the parent lists only its declared child), `shot-2.png` (the created child renders), `ed-editor.png`.
