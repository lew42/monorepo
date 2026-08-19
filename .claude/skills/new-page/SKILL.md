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
       content(){ p("Body."); },
   });
   ```
   A module index is `new Doc({ … })` instead (`documentation` skill). Never name a page
   method `render()` — it collides with core; `draw()`, `report()` are free.
3. **Add its name to the parent's `children:`.** Nothing crawls; an unlinked page does not
   exist. ⚠ A name declared in `children:` whose dir has no `page.js` 404s the whole
   probe — declare only what exists.
   ⚠ `icon:` is unverified and fails silently: the site loads **Material Icons**, not Symbols — a name only the newer set has (`developer_guide`) renders as its literal word, ~291px in a 219px card label, and nothing throws. Probe a new name's `offsetWidth` in the live page: a glyph is ~19px, a miss is 100px+.
4. **`doc/`** beside it when there is a topic worth a url; `readme.md` for a module.
5. Log the url in your task's `links`. Then `documentation` and `finish-task` when done.

Improve this skill: append to [`improvements.md`](improvements.md).
