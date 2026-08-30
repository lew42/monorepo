# Demo compaction — audit, prototype, migration

**Prototype:** [/framework/ext/demo/shell/](/framework/ext/demo/shell/) — three existing pages, one shell.
**Verified:** 400 / 1920 / 3440, console clean, render height == content height at every width, readout present in every state.

---

## 1. The audit

### Variants — 14 in code, 14 in the table

Counts are call sites in `framework/ web/ notes/ imagine/`, excluding `ext/demo` and `ext/layout` themselves.

| # | variant | file | calls | width readout | replaced by |
|---|---|---|---|---|---|
| 1 | `demo(fn)` | demo.js | 223 | yes | **keep** — an inline quoted example, not a page |
| 2 | `demo.page(name, fn)` | exhibit.js | 101 | yes | `page.demo()` |
| 3 | `demo.stage(fn)` | demo.js | 56 | yes | `page.demo({ code: false })` |
| 4 | `demo.tree(config)` | exhibit.js | 52 | yes | `page.demo({ app: true })` |
| 5 | `demo.exhibit({…})` | exhibit.js | 47 | inherits | `page.demo()` |
| 6 | `demo.app(page)` | app.js | 45 | **NO** | **keep as the engine**, stop calling directly |
| 7 | `demo.layout(config)` | layout.js | 31 | yes | `page.demo()` + `parts` |
| 8 | `demo.source(src)` | demo.js | 19 | n/a | **DELETE** — this is the expando |
| 9 | `mini(word)` | mini.js | 5 | n/a | **keep** — a preview picture, not a demo |
| 10 | `demo.source.file(meta,url)` | demo.js | 3 | n/a | **DELETE** — `code: true` reads `page.js` |
| 11 | `twin(fn)` | twin.js | **0** | **NO** | **DELETE** — dead: `layout.js` imports it and never calls it |
| 12 | `demo.stage.two(fn)` | demo.js | 2 | yes ×2 | **DELETE** — the split screen |
| 13 | `two(fn)` | two.js | 25 (2 direct + 23 `twin: true`) | yes ×2 | **DELETE** with #12 |
| 14 | `stage(fn)` | stage.js | engine | yes | **keep** — the one viewport, `page.demo()` uses it |
| — | `layout.bar(target)` | ext/layout | 5 direct + every exhibit | n/a | **keep**, as a `bar:` option |

Plus 6 modifier classes that behave as variants: `stack` (2), `quoted` (18), `bare` (3), `bleed`, `max`, `checkered`; and 3 config flags: `html: true` (3), `full:` (2), `twin: true` (23).

**Total demo call sites: 584.**

### Fixed heights — 17 call sites, 0 in the CSS

`grep '^\s*height: "'` over `framework/ web/ notes/ imagine/` → **16 config `height:` keys** on `demo.tree()` / `demo.layout()`, plus **1 inline** `demo.app(…).style({ height: "24em" })` (`ai/2026-08-12/apps/navigation`).

No demo stylesheet declares a fixed height on a render. Every clip is a call site meeting one CSS rule:

    app.css:56    .demo-app-pages { overflow: auto; }

A `height` on the box plus `overflow: auto` inside it = content cut off with no sign it was.

**Sampled 8 of the 17 at 1920 — 6 clip:**

| page | hidden |
|---|---|
| `core/Page/overview/landing` | 1174 of 1587px — **74%** |
| `core/Page/overview/site` | 967 of 1412px — 68% |
| `web/nav/rail` | 5 boxes, worst 265px |
| `web/nav/wall` | 5 boxes, worst 265px |
| `web/nav/sidebar` | 4 boxes, worst 265px |
| `web/nav/crumbs` | 4 boxes, worst 265px |
| `core/Page/overview/columns`, `web/layout/screens` | ok |

The repeated 265px cuts are **preview cards**: a rail of sibling previews re-renders the same clipped box on every page in the set, so one bad `height:` is visible from a dozen urls.

### The width readout

Present on 12 of 14 (all of them via `stage()`'s one `ruler()`). Missing on exactly two: **`demo.app()` called bare (45 sites)** and **`twin()` (dead)**. `demo.source` and `mini` are not renders.

So "sometimes we display the width, sometimes not" has one cause: **a `demo.app()` box that is not inside a stage.** `page.demo()` fixes all 45 by construction — app mode is always inside the stage.

---

## 2. The prototype — `Page.prototype.demo(options)`

`ext/demo/shell.js`, patched onto `Page` the way `ext/tabs` patches `tabs()`. No core edit.

    import rail from "/web/nav/rail/page.js";
    content(){ rail.demo(); }

Four rules it cannot break — which is the whole reason one shell exists:

- the **path** is always above (crumb links, live in app mode);
- the **width readout** is always under the render;
- the **source is a column** beside the render where there is room, under it where there isn't — never a `<details>`;
- the render has **no height**, only a floor.

### The config surface — six words, and no `height`

| word | default | what it does |
|---|---|---|
| `code` | `true` | the page's own `page.js`. `false` · a function · a string |
| `app` | children? | live navigation in the box — the path strip follows it |
| `nav` | `false` | the rail, in app mode |
| `widths` | the site's four | `[[px, label], …]`, or `false` for none |
| `min` | none | a minimum height. **A floor.** There is deliberately no `height` |
| `path` | `true` | the path bar |

`min` is the whole compaction argument in one word: a floor can only add, so no configuration can ever cut a demo off. The 17 `height:` keys become `min:` or nothing.

### The three seams it needed (all additive, no behaviour change)

- `stage.js` — `stage(fn, board, widths)` and `tools(…, widths)`; `WIDTHS` is still the default, so every existing stage is identical.
- `demo.js` — `source_file` added to the export list.
- `app.js` — three methods, all no-ops for existing callers:
  - `root_of()` — `scope ?? page.chain()[0]`. Without it, demoing an imported site page roots the box at the **whole site**.
  - `trail(page)` — the chain from the box's root down. `slice(0)` when the root is the tree's root, which is every existing caller.
  - `place(page)` — the root mounts in the box, whatever region its real parent already granted it. Every child of an `ext/Doc` has a tab panel waiting; without this the box renders **empty**. Identical to `activate()` for a parentless tree.

### Measured

| | 400 | 1920 | 3440 |
|---|---|---|---|
| shells / path bars | 3 / 3 | 3 / 3 | 3 / 3 |
| code beside the render | no (stacked) | **yes** | **yes** |
| render height vs content | equal | equal | equal |
| console | clean | clean | clean |

Band basis is `52em + 28em` — two columns from ~1440px up. The exhibit band's `84em + 32em` only splits past ~2.5K, which is why so much of the site still reads as one narrow strip on a 3440.

Screenshots: `shell-400.png`, `shell-1920.png`, `shell-3440.png` in this dir.

---

## 3. Migration — five steps, in this order

Do not mass-migrate. Each step lands and is looked at.

**Step 1 — the clips (17 sites, 1 afternoon).** `height: "26em"` → `min: "26em"` on the 16 configs plus the 1 inline. Needs `demo.tree`/`demo.layout` to accept `min:` (5 lines) and `app.css` to stop forcing `overflow: auto` when there is no height. **Independent of everything else** and it is the loudest complaint. Do this first even if the rest is rejected.

**Step 2 — the expando (22 sites + every exhibit).** `demo.exhibit()` renders `demo.source(def).attr("open","")` — a `<details>` that is always open, which is the worst of both. Replace with the shell's peer column. Deletes `demo.source` (19) and `demo.source.file` (3).
*Breaks:* nothing visual; the copy button lives on the `<summary>` and has to move to the column header.

**Step 3 — the dead and the split (25 sites).** Delete `twin()` (0 calls, a dead import in `layout.js`), `demo.stage.two()` (2), `two.js` (25 via `twin: true`). Keep `twin.js`'s `pane()` — `ext/Panel/Workspace/viewports.js` imports it.
*Breaks:* 23 `demo.layout({ twin: true })` pages lose their two-up stage and get the width buttons instead — the same comparison, one mechanism, and the mobile/mega presets already say it. Their **cards** never used the twin anyway (`layout.js` says so in a comment).

**Step 4 — the sugars onto the shell (231 sites).** `demo.page` (101), `demo.tree` (52), `demo.exhibit` (47), `demo.layout` (31) become config over `page.demo()`. Keep the names as thin factories — they are page *shapes* (`children:` entries), not renders, and rewriting 231 call sites buys nothing. Only their `content()` changes, in four files.
*Breaks:* the layout bar and the Variants wall must become shell options (`bar:`, `variants:`) or those pages lose them. `demo.layout`'s `parts:` chips need the same.

**Step 5 — the bare stages (101 sites).** `demo.stage()` (56) → `page.demo({ code: false })` where the subject is a page; `demo.app()` (45) stops being called directly. This is the one that buys the 45 missing readouts.
*Breaks:* `demo.stage(fn)` takes a **function**, not a page — the 56 that show a fragment rather than a page keep it as an internal. Judge whether a fragment demo is `demo(fn).ac("stack")` instead.

**Kept, deliberately:** `demo(fn)` (223) — an inline quoted example in prose is a different object from a page demo, and merging them would put a path bar on a two-line snippet. `mini()` (5 calls, 29 pictures) — a preview picture, never a live render. `stage()` and `demo.app()` as engines.

### After

14 render variants → **6**: `demo(fn)`, `page.demo()`, `mini()`, and three engines (`stage`, `demo.app`, `layout.bar`). Two files deleted (`two.js`, `twin.js`'s row), one `<details>` gone, 17 clips gone, 45 readouts gained.

---

## 4. Open questions for the mastermind

1. **Step 1 alone?** It is 17 lines and fixes the loudest complaint. Everything else is a week.
2. **`demo(fn)`'s `<>` HTML pane** — 3 pages ask for it (`html: true`). Keep or cut? It is a third code surface.
3. **The layout bar** — every exhibit draws one. On the shell it wants to be `bar: true`, off by default. That is a visible change on ~230 pages.
4. **`quoted` (18 sites)** — the opt-out that keeps a demo on the reading measure. The shell is `bleed` by default; `quoted` has to survive as a class or an option.
5. **Naming.** `page.demo()` reads well. `demo.page()` already exists and means something else. One of them should be renamed before both are common.
