---
name: new-page
description: Run every time you create a page — the `create_page` tool that does the mechanics reliably, the blessed page.js shape for when you write one by hand, and the traps that still apply. Trigger skill; thirty seconds.
---

# New page

These are the mechanics. What the page is, where it goes and what goes on it, top-down, is the
`page` skill. Load that first.

1. **Answer `layout`'s five questions in one line** — container, size, own layout, regions,
   preview — before writing the file.
2. **Call `create_page`** (Servex MCP tool), never the hand steps. One call makes the folder,
   `page.jsonl` line 1 (title, icon, `description`, optional `layout`), a `readme.md` stub, and
   links it from the parent — the parent link is the step an agent most often forgets by hand.
   `description` is required, one sentence; a clear error names the field if you skip it. No
   empty `doc/` is made — one appears only once there is a real doc. Its return value hands you
   the **parent's own context** (title, layout words, sibling names, readme url) — read that
   before choosing this page's own layout (`page` skill, step 2). `place`, `set_layout`,
   `list_pages`, `read_page` (same MCP tools) add more to a `page.jsonl` page afterward.
3. **Want a hand-written `page.js` instead of the jsonl stub?** Write it in the same folder and
   delete the stub `page.jsonl` — a folder with both uses `page.js`. The shape:
   ```js
   import { Page, p } from "/app.js";
   export default new Page({
       meta: import.meta,           // derives url; link() works while dormant
       title: "Text",
       description: "One sentence — the card's subtitle everywhere it is previewed.",
       children: "intro guide",     // names in nav order; auto-imported
       content(){ p("Body."); },    // p/div/img are FUNCTIONS, not Views — call them bare
                                     // or with .c("cls"); img.attr(...) throws, nothing renders
   });
   ```
   A module index is `new Doc({ … })` instead (`documentation` skill). Never name a page
   method `render()` — it collides with core; `draw()`, `report()` are free.
   New pages place `page_work(page)` (`core/Page/ai/work.js`) in `content()` by default — the one line that shows the page's own open tasks and agents; skip it only if the page truly has no topic to match keywords against. Detail: [`core/Page/ai/doc/work.md`](/framework/core/Page/ai/doc/work/).
4. **Route everything.** Anything a reader can see or open on the page — a doc swapped in place, a
   tab, a detail — has its own url (a child page, or `history.pushState` to one that reloads to
   the same view). A view with no address loses the reader's place on reload. `swap_link` does it
   for docs; core/Page's readme. Each view is a plain link, never a button that flips a class:
   AI 2's "Open the full inbox" did that and the nav rail stopped switching pages (the owner,
   2026-09-23). Check by clicking every view, then the site nav, then Back — the url must change.
5. **Traps that still bite once the folder exists** — `create_page` gets you the folder, the
   file and the link; these are about what you put in `children:` and `icon:` by hand:
   - ⚠ `children:` makes a name ROUTABLE, not LINKED — a parent whose `content()` draws its own
     thing instead of calling `previews()` shows zero visible links to the new child (`/layouts/`
     → `browse`, 0 anchors at 1920, 2026-09-17). Add one visible line there too, and check by
     counting `a[href='<child url>']` on the PARENT, never by loading the child's own url.
   - ⚠ A name added to `children:` by hand, whose folder has no `page.js` and no `.md`, 404s the
     whole probe — declare only what `create_page` (or you) already built.
   - ⚠ Not every subtree wants this line at all: `public/blog/readme.md` documents `/blog/`
     posts as deliberately undeclared (the manifest `blog/posts.js` lists them so the front need
     not import every post), and a post is `export default new Post({ meta: import.meta })`, four
     lines, no `content()`. Check the module's own readme before assuming a page.js shape applies.
   - ⚠ `icon:` is unverified and fails silently: the site loads **Material Icons**, not Symbols —
     a name only the newer set has (`developer_guide`) renders as its literal word, ~291px in a
     219px card label, and nothing throws. Probe a new name's `offsetWidth` in the live page: a
     glyph is ~19px, a miss is 100px+.
6. **`doc/`** beside it when there is a topic worth a url; `readme.md` already exists once you
   used `create_page` (fill in its stub sections).
7. Log the url in your task's `links`. Then `documentation` and `finish-task` when done.

Improve this skill: append to [`improvements.md`](improvements.md).
