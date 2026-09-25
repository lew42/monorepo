---
name: new-page
description: Run every time you create a page.js — the blessed shape, the parent `children:` line that makes it exist, the doc/ dir, and the one-line sizing check. Trigger skill; thirty seconds.
---

# New page

1. **Answer `layout`'s five questions in one line** — container, size, own layout, regions,
   preview — before writing the file.
2. **The file:**
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
3. **Add its name to the parent's `children:`.** Nothing crawls; an unlinked page does not
   exist. ⚠ `children:` makes it ROUTABLE, not linked: a parent whose `content()` draws its own
   thing instead of calling `previews()` shows zero links to the new child (`/layouts/` → `browse`,
   0 anchors at 1920, 2026-09-17) — add one visible line there too, and check by counting
   `a[href='<child url>']` on the PARENT, never by loading the child's own url. ⚠ A name declared in `children:` whose dir has no `page.js` and no `.md` 404s
   the whole probe — declare only what exists. Backed only by a `.md`, it still renders
   (core's probe tries `page.js` first, `.md` last) but logs a console 404 for the
   missing `page.js` on every page in that subtree — declare the note as a config that
   names the file instead: `["Naming", { content(){ return md.file(import.meta, "naming.md", { h1: false }); } }]`
   for a clean console (`/layouts/doc/`, 3 errors × 16 pages, 2026-09-08).
   ⚠ Not every subtree wants this line at all, and not every `page.js` is a `Page` —
   `public/blog/readme.md` documents `/blog/` posts as deliberately undeclared (the
   manifest `blog/posts.js` lists them so the front need not import every post to print
   a title), and a post is `export default new Post({ meta: import.meta })`, four lines,
   no `content()`. Check the module's own readme before assuming step 2/3 apply
   (`/blog/ai/playwright/`, 2026-09-08).
   ⚠ `icon:` is unverified and fails silently: the site loads **Material Icons**, not Symbols — a name only the newer set has (`developer_guide`) renders as its literal word, ~291px in a 219px card label, and nothing throws. Probe a new name's `offsetWidth` in the live page: a glyph is ~19px, a miss is 100px+.
4. **Every view is a url — never a button that flips a class.** If a page shows two views
   (an overview and an inbox, a list and a detail, tabs worth coming back to), each one is a
   page the Router knows: a `children:` entry, or a name `route()` returns a `Page` for. The
   switch between them is a plain link (`a.c("page-link").href(url)`), and CSS picks what shows
   off the Router's own `.active-page` mark. A view you reach by `classList.add()` has no
   address, so the site nav, the back button and a reload cannot get you out of it: AI 2's
   "Open the full inbox" did exactly that and the nav rail stopped switching pages (the owner,
   2026-09-23: "we can't just have these buttons that when clicked switch the view manually").
   Check by clicking every view, then the site nav, then Back — the url must change each time.
5. **`doc/`** beside it when there is a topic worth a url; `readme.md` for a module.
6. Log the url in your task's `links`. Then `documentation` and `finish-task` when done.

Improve this skill: append to [`improvements.md`](improvements.md).

## How an agent makes a page

Use the page tools (Servex MCP), not hand edits: `create_page` makes the folder and links it from its parent, `place` adds a .md or module to a `page.jsonl` page, `set_layout` picks a name from `core/Layout/layouts.js`, and `list_pages` / `read_page` show what is there. Each write is one appended line. A `page.js` page still takes hand edits.
