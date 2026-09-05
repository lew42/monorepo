# paging-core — build brief (Opus)

Less is more · clarity is the exception · prioritize. Read [`../paging/requirements.md`](../paging/requirements.md) (the program: plan, THE VOCABULARY, the owner's ask verbatim) and [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; both are mandatory. Skills, in order and every time they apply: `new-task` (this dir, group `paging`), `code`, `layout` (the five questions, per page — this program IS the five questions), `new-page`, `css` before the first CSS line, `new-css-class` before the first class name (prefix `paging-`), `ui-test` for every mechanism you claim works, `documentation`, `finish-task`.

**You own the heart of the program:** the hub, the shared class, and the five factor trees. Other minions build `rightnav/`, `explorer/`, `inventory/`, `critique/` beside you and never touch your files; the mastermind wires their names into your hub's `children:` when they land — leave a comment where.

## Read first

`public/framework/core/Page/readme.md`, `doc/columns.md` (the width words — `launch` is a child column, `takeover` is `full`; do not reimplement columns), `doc/roles.md`, `doc/method/store.md`, `doc/panels.md`; `public/framework/ext/layout/readme.md` (toolbar, push drawer), `ext/tabs/readme.md`; `public/imagine/page.js` (the host you sit in), `public/imagine/shells/` and `public/imagine/screens/` (the two paging patterns the owner names — read `screen.js`), `public/imagine/design/layout/approved/page.js` (the closed set), `public/imagine/design/color/` and the stacks lab for the colour tokens (`--shade/--paper/--fill-aNN`, `--surface`, `--prim`, colour-scheme islands); `public/framework/framework.css` (the `css` skill has you read it).

## Deliverables (closed list; cut from the bottom)

1. **`public/imagine/paging/paging.js`** — one class, `Paging extends Page`, parts as static subclasses: `Paging.Toolbar` (the MODE TOOLBAR: chips for style · content size · layout size · mechanism, switching the page live, remembered with `store()`), `Paging.Item` (a child link carrying its mechanism's icon at the end — `chevron_right` / `expand_more` / `swap_horiz` / `open_in_full`, Material Icons classic), `Paging.Code` (the `code` dynamic child via `route("code")`: the page's own source from `import.meta.url` + the `this.style("card")`-shaped calls the toolbar clicks would be, appended live). Every method a seam. ⚠ `classify()` stamps constructor names as classes: `Paging`, not `Page`-like words; no method named `render`, `card`, `label`, `icon`, `description`, `topic`, `width`, `index`.
2. **`paging.css`** — as little as possible, every rule in a layer, `paging-` prefix; the five styles as one class each on the page's box (`paging-plain` … `paging-dark`), tokens not hex; the `card` style makes nav cards inside it light grey.
3. **`public/imagine/paging/page.js`** (replace the stub) — THE STAGE: three lines of what this is; then the walk — a sequence the reader can run from one page to the next feeling each mechanism (center → launch → expand → swap → takeover) across styles; then `previews()`. Answer `layout`'s five questions in the file's head comment: the hub is a column in `/imagine/`'s row; say what `takeover` does to that row (`full` collapses ancestors to the crumb strip — that IS the takeover; prove it).
4. **`mechanisms/`** — one page with the SAME small content and all four items, one per mechanism, so the four feel different from one place; `mechanisms/<word>/` one page each, a tree (`children:`), each carrying the toolbar.
5. **`styles/`** — one page, toolbar switches style; `styles/<word>/` one page each so each style has a url.
6. **`sizes/`** — one page whose toolbar runs content `xs`–`xl` × layout `center`–`full`; `sizes/<layout>/` one page per layout size. Not twenty pages.
7. **`center/`** — the vertically centred column system: a small amount of content floats centre-centre in its area; each item `launch`es right, `swap`s, or `takeover`s; the toolbar switches which. This is the owner's named idea — make it the best page of the set.
8. **`transitions/`** — from any style to any style by any mechanism: pick from, to, mechanism, run it. Cut this first if the budget bites; say so.

## Prove it

`ui-test` plans for each mechanism: click the item → the expected change (a new column appears / the item grows below / the box's content changes and the box does not move / the row collapses to one full page), screenshots at 1280 and 3440 in your task links; zero console errors at 400/1280/1920/3440 on the hub and the four factor pages. The three x-invariants from the `layout` skill on every page.

## Fences

Write only: `public/imagine/paging/page.js`, `paging.js`, `paging.css`, `mechanisms/`, `styles/`, `sizes/`, `center/`, `transitions/`, `public/framework/styles/css-scopes.txt` (via the skill), this task dir. Never `core/`, `ext/`, `framework.css`, or a sibling's dir — a core/ext change you need is a PROPOSAL in your task log with the diff written out, not an edit. Budget ~450k tokens; cut transitions, then sizes' per-layout pages, before anything else.
