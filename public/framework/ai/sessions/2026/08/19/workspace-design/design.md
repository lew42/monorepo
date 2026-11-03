# Workspace — the parent of a Panel tree. Design, 2026-08-19.

**In one line:** the Workspace is a class that **holds** a Panel root (never a Panel subclass), `workspace()` stays as its thin door so no caller changes — and the one thing that must land *first* is deleting `container-type` from the sizing path, because that is what makes `hug` mean **auto**.

## 1. The tree

```
ext/Panel/Workspace/    Workspace.js · documents.js · viewports.js · workspace.css · readme.md · doc/ · page.js
ext/Panel/playground/   page.js · doc/        ← ext/Panel/page.js gets `children: ["playground"]` (a Doc takes children as tabs)
ext/Panel/workspace.js  keeps panel(seed); workspace(o) → new Workspace(o).$view; the module-level `saver` const MOVES to documents.js
```

`Workspace` is a **class** because it holds state across redraws (mode, zoom, viewport set, the open document), and **not** `extends Panel`: it would inherit `divide/split/close/mirror`, and `toJSON()` would write workspace chrome into the document file. The accepted proposal's *"Never: a fourth Panel subclass"* stands. Classes go under the reserved `panel-` prefix (`css-scopes.txt:73`) — no new scope.

**Deliberately NOT moved:**
- `vocab.js` — untouched. The Workspace writes `root.templates` / `root.tools` exactly as `workspace()` does today.
- `size.js` / `glyphs.js` — `mode` stays `root.data.mode`: it must persist, and the document file *is* the root's JSON. `item.document()` and `.panel-mode-document` keep working; the Workspace bar is simply a second writer of the same key.
- `--panel-height` — keep. With no size containers it is still the only height source for an in-page panel.

**Dies:** `page.js`'s `route(name)` + its `full` import — the `/full/` url. The playground replaces it *with a real way out*. `styles/layouts/full.js` itself stays (`styles/sections/page.js` and an ai page use it).

## 2. Sizing with no containers — `hug` means AUTO

Every `.panel-body` is `container-type: size` today, and **a size container may not be sized by its contents** — so a hugging panel measures 0 and needs a declared extent, which is the whole reason `hug` is 16em. Delete the containment and `hug` = `flex: 0 0 auto; flex-basis: auto`, and the box measures its content. Nothing else is needed.

`--panel-hug` survives in exactly **one** place, renamed `--panel-section`: `mode: document`'s `min-block-size` floor (landed today — keep it). It stops being a width.
A **scene** still declares its own minimum, because `blank/word/wall/clock` have no content to measure — that is the scene's floor in `templates.css`, not `hug`'s meaning.

### Every `cq` in `ext/Panel/*.css` — 61 lines

`grep -cE 'container-type|container-name|container:|[0-9]cq[bwhi]|cqmin|cqmax|@container' *.css` → panel 10 · size 2 · templates 39 · toolbar 6 · tools 4 = **61**.

| file | grep -c | comment lines | delete | replace |
|---|---|---|---|---|
| `panel.css` | 10 | 4 | 3 — `:21` `:72` `:74` (all three `container-type`) | 3 — `:31` floor → drop (auto basis already fits) · `:73` scene body → `min-block-size: var(--panel-section)` · `:135` → drop the `container-type`, keep `flex: 1 0 auto` |
| `size.css` | 2 | 0 | 0 | 2 — `:29` `:38` `min(--panel-hug, 100cqi/b)` floors → drop; cap on `.panel` itself with `max-inline-size: 100%` (`%` resolves against the slot — the file says so at `:44`) |
| `templates.css` | 39 | 6 | 18 | 15 |
| `toolbar.css` | 6 | 1 | 4 | 1 |
| `tools.css` | 4 | 1 | 3 | 0 |
| **total** | **61** | **12** | **28** | **21** |

- **templates.css, 33 live.** 16 go with `haze aurora drift depth` — the accepted proposal already parks them. 2 more are `wall`'s `@container` column count → **`wall` is 2 columns, full stop** (`doc/templates.md` already says 3 reads ragged; 1 and 4 were the container's job). Of the 15 replaced: every cq that **paints** (gaps, padding, radii, `background-size`, `max-inline-size`) becomes `%` — exact, against the same box. Every cq that **types** keeps its `clamp()` with the middle term dropped to `em` (`word clock wall rail toc brand`). `.panel-t` `:19` `100cqh` → `100%` plus `.panel-body:has(> .panel-t) { grid-template-rows: 100%; }`, which `.panel-t-screen` already proves works (`:184`).
- **`.panel-t-screen`'s `font-size: 1.5cqw` → `1em`.** Scaling a whole page down to fit a box is now **`zoom` on a viewport, done once for everything** — which is precisely why the Workspace exists. This is the design's best argument that dropping cq costs nothing.
- **toolbar.css, 5 live** — the bar's narrow fold. Replace by **folding unconditionally**: handle · `more_horiz` · close always visible, everything else in the popover it already is. Less code than three `@container` blocks, no measurement; `100cqi` → `100%`.
- **tools.css, 3 live** — go with `align_grid`, already on the accepted delete list.

### Scrollbars are a decision, never a side effect

A rolled layout in a document today is **twelve 16em boxes each scrolling its own content** — the exact symptom of the containment above: `doc/words.md` states *"a section does not grow with its content, ever"* because its body is a size container, so a section that overflows can only scroll. **Deleting the containment fixes it with no new rule** — `min-block-size: var(--panel-section)` is a *floor*, not a height, so a section hugs what it holds and grows past 16em, and `.panel-body`'s `overflow: auto` (`panel.css:47`) then engages only where a size was genuinely chosen (`h: fixed`, or `fill` mode where the screen is finite). **The workspace scrolls; a region scrolls only when it was meant to.** Task A does not land until every `scrollHeight > clientHeight` box inside a rolled document is one somebody asked for.

⚠ For a later task to weigh: **only `container-type: size` ever bit** (a 0px column holding 963px of sections, `doc/words.md`; a 0px hug, `doc/templates.md`). `inline-size` never did. Both go here because you asked for none.

## 3. Fill vs Fit — the handle and zoom

- **Fill (default).** Zoom 100%, the viewport *is* the available width. The responsive handle is **`ext/drawer`'s own `ext/grip`, already built** — the drawer pushes the page, so the Workspace simply lives in the pushed area and dragging the rail reflows everything. **Zero new code.** ⚠ One line owed: `.page.layout-full` opts out of the push and restates the reservation itself (`ext/drawer/readme.md`) — this is the task that applies the `--rail-push` token that readme calls *"proposed, not applied"*.
- **Fit.** One / all / twin at fixed device widths, each `zoom`ed to fit its cell. Reuse **by import, not by wrapping**: `stage.js`'s `simulate($view, width, room)` (6 lines: `flex: 0 0 auto; width; zoom`) and `watch(el, fn)` (a width-only ResizeObserver). Do **not** reuse `stage()` — it builds `.demo-stage/.demo-tools/.demo-screen/.demo-render`, its own handle and strip, and its `tools()` closure is private.
- **twin.** `twin.js`'s `pane()` is the real prize: `aspect-ratio` on the pane with the render out of flow, so both devices land on one height with no second measured pass. Reuse it — but it hardcodes `PHONE`/`MONITOR`, so export `pane` (or `twin(fn, devices)`) and "all viewports" is the same function over `WIDTHS`.
- **Zoom + px readout.** `magnifier()` and `ruler()` are private inside `stage.js`'s `tools()`. Lift both to exports; the Workspace bar draws them, `demo`'s strip is unchanged, and `tools.js`'s `zoom_scrub` (a confessed copy) deletes.
- ⚠ **N viewports = N views of ONE root.** `mount(root, $root)` closes over a single box today. Give it `$roots[]` and empty them all in `draw()`. Two independent mounts of one document is the readme's *"three live mounts share one document — the last writer wins"* trap.
- **Fit contradicts the handle, and that's fine** (your words): in Fit the handle sizes the *cells*, not the layout.

## 4. Documents are files

`/data/panels/<name>.json`, one Saver each, owned by the Workspace. The **listing is an index the Workspace writes itself** — `/data/panels/index.json` (`{ names: [] }`), the same `Saver` mechanism in dev and static, no server route, one code path.
⚠ Not the directory listing: **`Server/plugins/Directory.js:21` ignores every `.json`**, so a new document never rebuilds `directory.json` and the list would be stale with nothing thrown.
Static: `LocalStorageSaver({ key: "panels/<name>" })` + `panels/index`.
**"+"** mints `untitled`, `untitled-2`…, makes `new Panel({ saver })` with `mode: document`, appends to the index, saves both, selects it.
**Today's `/data/panels.json` does not move** — seed the index with `default` pointing at that path. Zero migration, and Panel's own page keeps its inline workspace working throughout.
**Delete** is 3 lines (`FileSaver.delete()` exists) — take it. **Rename** is a file move; defer.

## 5. Split vs add — two verbs, two gestures

`divide(dir, made, before)` is already the seam: `made` is the hook, and the even 50% is free.

- **split** — the struck panel's *look*, empty. `new Panel({ data: { grow: item.get("grow") } }).restyle(item)`, where `restyle` copies `Panel.shared` **minus `template seed text`** — a list that already exists, so the method is one line. Not `mirror()`: that shares live; this copies once.
- **add** — from scratch. `item.divide(dir, new Panel(), before)`, which is *literally what `split.js:57` does today*. **So `add` is already built and `split` is the new verb.**
- **A roll is neither verb, and it needs one branch.** `sow(item)` replaces `item`'s data and children **in place** (`generate.js:129`). On a *section* that is right — that section becomes the layout. On the **root of a document** it is wrong: the layout's top-level rows become twelve sections, which is the twelve-mini-panels report. In `document` mode a root roll must `sow` into **one fresh child** instead: a layout is a *page*, a document is a stack of pages' worth of band, so **one roll = one section**. One `if (item.document())` in `workspace.js`'s `sow:` factory.
- **Gestures.** Edge click = **split** (you struck *that* panel, you get its twin) — a one-line change at `split.js:57`. The Workspace bar's `+` = **add**, picker open; in `mode: document` it appends a section at the end. Two verbs, two gestures — and `insert.js`'s seam `+` still deletes, so the gesture count *falls*.

## 6. The playground

```
┌──────────────┬──────────────────────────────────────────────┬─────────┐
│  ▣  LEW42    │ fill·document │ 1 all twin │ fit │ 100% │ ⊕  │         │
│  Framework › │──────────────────────────────────────────────│  props  │
├──────────────┤   ┌────────────────────────────────────┐     │  rail   │
│  default     │   │▔▔▔▔▔▔▔ header (off) ▔▔▔▔▔▔▔▔▔▔▔▔▔▔ │     │         │
│  landing   ● │   │┌───────┬──────────────────────────┐│     │ (ext/   │
│  dashboard   │   ││ left  │     the Panel tree       ││     │ drawer) │
│              │   ││ (off) │                          ││     │         │
│  +  new      │   │└───────┴──────────────────────────┘│     │    ║ ←  │
│              │   │▁▁▁▁▁▁▁ footer (off) ▁▁▁▁▁▁▁▁▁▁▁▁▁▁ │     │    ║ the│
│              │   └──────────── 1440 px ───────────────┘     │    ║ grip
└──────────────┴──────────────────────────────────────────────┴─────────┘
  core/Sidebar        one viewport, 1em medium-gray frame, px width          the drawer's
  logo + "Framework"  on the frame · zoom about its centre                   own grip IS
  = the way out.      "all" tiles them · "twin" is 390 beside 3440.          the handle.
  No ✕.
```

**Shell = four booleans, no new class.** `header · left · right · footer` are optional named region **Panels** in the root split — `ext/editor` already proves the pattern with five. Hidden by default. They belong to the document because *the shell is what you are designing*.

## 7. Build order

```
A — sizing with no containers                              M · Opus · blocks everything
   ext/Panel/panel.css size.css templates.css toolbar.css tools.css templates.js tools.js
   ext/Panel/doc/templates.md doc/words.md readme.md
```
Opus: one wrong line blanks every panel, and the count in §2 must come back green.
```
B — the Workspace module + documents                       M · Sonnet · after A
   ext/Panel/Workspace/**  ext/Panel/workspace.js  ext/Panel/page.js (route dies)
```
```
C — the playground + the viewport set                      M · Sonnet · after B
   ext/Panel/playground/**  ext/demo/stage.js (export magnifier ruler)  ext/demo/twin.js (devices)
   ext/Panel/page.js (children:)  ext/drawer/drawer.css (--rail-push)
```
```
D — the two verbs + the sweep                              S · Sonnet · after B, ∥ C
   ext/Panel/Panel.js (restyle) split.js workspace.js (the sow branch) insert.js insert.css tools.js toolbar.js properties.js glyphs.js
```

## 8. Delete at the end

`/full/` route + its `full` import + the two `/full/` links in `page.js`/`readme.md` · `insert.js` + `insert.css` (129 lines; six gestures already added a panel) · `tools.js`'s `align_grid` + `.panel-align` + `tools.css`'s block · `tools.js`'s `zoom_scrub` · the four scenes `haze aurora drift depth` (~80 lines of `templates.css` + 16 cq lines) · `toolbar.css`'s three `@container` fold blocks · `--panel-hug` **as a width** · the `root:` word machinery in `toolbar.js`'s `word_pops()` and `properties.js`'s split branch, once the Workspace bar owns `mode` — `doc/words.md` says that predicate *is* the whole cost of `root`.
**Not deleted:** `--panel-height` (still the only height an in-page panel has) and `styles/layouts/full.js` (other callers).
