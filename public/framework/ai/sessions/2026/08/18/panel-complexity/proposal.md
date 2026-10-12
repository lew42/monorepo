# ext/Panel — the complexity, and the simplest thing that meets the north star

> *"a simple, easy to use Panel system that allows me to explore flex and grid responsive layouts quickly and easily"*

**It did not sprawl in the direction you think.** 3,807 lines — and the north star's own subject, the
flex and grid words, is **two hardcoded CSS declarations** in `display.css`: flex is always a row with a
0.5em gap, grid is always `repeat(auto-fit, minmax(8em, 1fr))`. No `gap`, `wrap`, `justify-content`,
`align-items`, track count, `auto-fill`, `span` or areas exists as a panel word, in any control or in
`data`. It is not too big for what it does; it spent its size on *arranging* and almost none on *the
words you wanted to explore*. And **responsive is absent** — the site's one width simulator is `ext/demo/stage.js`.

## 1. The map

| surface | lines | what it does | callers | serves the north star |
|---|---|---|---|---|
| `Panel.js` | 153 | the class: `divide split close absorb mirror bequeath` | every file | **yes** — the core |
| `workspace.js` `paint.js` `panel.css` | 371 | the two doors, the redraw, the recursive `view()`, one panel's DOM | 5 external mounts | **yes** — the core |
| `toolbar.js` `toolbar.css` | 376 | the hover bar: 10 controls, 7 popovers, the narrow fold | `workspace.js` | partly — largest group, all chrome |
| `text.js` `persist.js` `text.css` | 481 | click/type/style text runs, saved as overlays on `data.text` | `overlays` `paint` `tools` | **no** — page editing |
| `templates.js` `templates.css` | 458 | the `T` vocabulary: 28 pictures (8 scenes, 15 bands, 3 furniture, +2) | `vocab` `paint` | partly — content to test *with* |
| `size.js` `size.css` | 239 | per-axis `fill\|hug\|fixed`, `self`, `position` | toolbar, properties, paint | **yes** |
| `grip.js` `grip.css` `seam.js` | 235 | the divider: drag writes grow fractions; click opens hug/fill | `workspace.js` | **yes** |
| `tools.js` `tools.css` | 190 | the 3×3 align overlay (**off**), the zoom scrub, the drawer wiring | `workspace` `overlays` | split — see verdicts |
| `repeat.js` `repeat.css` | 166 | a `+` that clones a repeating run a template drew | `overlays` `paint` | **no** — page editing |
| `random.js` `generate.js` | 152 | seeding: `scatter()` rolls chaos; `structure(seed)`/`sow()` translate a spec | workspace, page, compose | **yes** (`generate` only) |
| `display.js` `display.css` | 149 | `block\|flex\|grid` on a body + an overlay drawing axis/tracks | `vocab` `overlays` `size` | **yes** — and 2 lines deep |
| `properties.js` | 144 | the inspector rail: 9 word-rows on the focused panel | lazy from `tools`/`templates` | **yes** |
| `insert.js` `insert.css` | 129 | a `+` riding a split's gaps, dropping a panel there | `workspace.js` | **no** — duplicate |
| `PanelDrag.js` | 117 | drag a panel; edge/centre drop zones; alt-drop = live duplicate | `workspace.js` | partly |
| `split.js` `split.css` | 115 | click an edge → ghost preview follows the pointer → commit | `workspace.js` | **yes** |
| `page.js` | 109 | the Doc page, 12 gestures, 5 demos | the site | **yes** |
| `glyphs.js` | 85 | the shared picture vocabulary the three control surfaces read | 6 files | **yes** — support |
| `focus.js` | 61 | the selection, and the three ways it is lost | `workspace` `tools` | **yes** — support |
| `overlays.js` | 49 | the four body surfaces, and the disposer registry | `workspace.js` | **yes** — support |
| `vocab.js` | 28 | what a document was opened with: its templates, its tool flags | 7 files | **yes** — support |

**3,807** by `wc`; **3,807** summed. Real external consumers: `ext/editor` (the only `workspace()` customer), `ext/files/panels.js`, `framework/page.js`'s clock, `space/compose`.

## 2. Verdicts

**KEEP — ~2,380 lines.** The class, the doors, sizing, the grip, the edge split, drag, focus, overlays,
vocab, glyphs, `generate.js`, the page, the bar — the minimum that lets a person split, resize, nest,
set words and swap content. Everything except *see it at several widths*.

**PARK — 647 lines, behind two words.** `text.js` + `persist.js` + `repeat.js` are page *editing*, not
layout *exploring*, and both already sit behind flags: `TEXT.on = false`, `REPEAT.on = false` parks
them today, nothing deleted, `workspace({ tools: { text: true } })` restores. Park the four decorative
scenes too (`aurora drift depth haze`, ~80 lines of `templates.css`) — they test nothing about layout.
Keep the 15 section adapters: 4 lines each, and real content is what you need to squeeze.

**DELETE — ~300 lines.**
- `tools.js`'s `align_grid` + `.panel-align`. Dead by your own word (*"they look bad, and they don't do
  anything without an explicit height"*), and the bar's Alignment pop sets the same key. Keep the word.
- `insert.js` + `insert.css`. **Six gestures already add a panel**: two divide icons, the `panel-quick`
  splitscreen, the edge preview, this `+`, PanelDrag's edge and centre drops. `insert.js`'s own header
  says the edge "already means something better."
- `tools.js`'s `zoom_scrub` — its header admits it was lifted from `ext/demo`'s `magnifier()`.
- `random.js`'s `scatter()` **as the default seed**: a new workspace rolling twelve random content
  panels is the opposite of "a handful of preconfigured basic layouts."

**MERGE — inside the module first.** `toolbar.js` (7 popovers) and `properties.js` (9 rows) draw the
**same six word-sets twice** — `template tone display align w h` — 311 lines for one vocabulary. One
`WORDS` table read by both hosts (bar folded, rail open) makes step 1 one edit instead of two.

**MERGE — with `demo`.** Composition, not code: `demo.stage()` owns the viewport and width presets,
`panel()` owns the arrangement, `demo.stage(() => panel(seed))` is the whole merge. `grip.js`'s
`coalesce()` admits it was lifted from `stage.js`, `dev/DevBar/grip.js` is a third copy — one shared `drag()`.

## 3. Variants

**Stage — a call-site composition, not a class.** `panel.stage(seed)` = three lines wrapping
`demo.stage(() => panel(seed))`. The stage is the *only* width simulator on the site, and duplicating
it inside Panel is what already produced `zoom_scrub` — this delivers the missing responsive half for ~3 lines.

**Full-screen page-as-panel — a route, and it already exists.** `/framework/ext/Panel/full/` is
`full(this, () => workspace())`, two lines of `page.js`. Generalize `styles/layouts/full.js` with a `nav`
option so the sidebar can stay. Nothing about it is a *different* Panel — the same workspace at `--panel-height: 100%`.

**Panel hosts a mini app — a `T` entry, three lines.** `app: { icon: "apps", draw($body){
$body.append(demo.app(tree)); } }`. The `T` vocabulary already *is* the "a panel can BE or HAVE X"
mechanism: `properties` (an inspector) and `space` (a generator) are two non-content entries in it today.

**The handful of preconfigured layouts — already written, nine of them.**
`styles/layouts/space/presets.js` holds nine named spec strings (`document docs shell split mail
dashboard landing gallery masonry`) and `generate.js`'s `structure()` already turns spec text into a
Panel tree. Give `structure()` a **text** door beside its seed door (~10 lines) and every preset becomes
a starting arrangement; the bar's dice becomes *pick a preset · then dice*. Fill and hug come free —
the grammar already says `fill`, `flex-1`, `--basis:15em`, and `share()` maps them onto `grow`.
Yesterday's Figma-derived layouts (`wire/ home/ anatomy/ screens/ apidoc/ spec/`, ~1,635 lines) are
**pages, not specs** — ~6 lines of spec text each to join. Do that only for shapes the nine lack.

## 4. Panel-flow — the smallest recorder

Hook the **root Item's events**, not the Panel verbs: `divide/split/close/absorb/sow/move` are six
mutation paths and a drag misses most of them, but `root.on("change"|"add"|"remove")` catches every
one — `workspace.js`'s `mount()` binds all three today for save + redraw.
A step is `{ at, snapshot }`, `snapshot = root.toJSON()`. Not a diff: Panel already serializes losslessly
(it is what the saver writes), so replay is `Item.hydrate(snapshot)` + a redraw, no inverse-operation
table to get wrong. 50 panels ≈ 4KB; 200 steps ≈ 800KB in memory, nothing on disk.
**~25 lines, one `flow.js`, plus a scrubber in the bar. Build it — third.** A recorder of a vocabulary
you are about to change records the wrong thing, so the words land first; then the flex and grid
guides stop being pages and become recorded flows, which is what both test-drive minions are asking for.

## 5. The strategy

1. **S — the flex and grid words.** One `WORDS` table read by bar and rail; add `gap wrap justify
   align-items` (flex) and `columns gap dense` (grid) as panel keys. ~60 lines, no new file. **This is the
   north star and it is currently 2 lines.** Everything waits behind it.
2. **S — park text + repeat + the four scenes.** Two words and a template list. 647 lines stop running.
3. **S — delete the four duplicates** (align overlay, `insert.js`, `zoom_scrub`, `scatter` as seed). ~300 lines.
4. **M — the preset door.** `structure(text)` beside `structure(seed)`; nine layouts, some fill some hug, free.
5. **M — Stage composition.** `panel.stage()`, and the width dial becomes the responsive half.
6. **M — panel-flow.** `flow.js` + a scrubber; then rebuild the flex and grid guides as flows.
7. **L — the mini-app `T` entry.** Three lines of code that waits on the mini-app trees existing.

**Never:** a `Stage`/`PagePanel`/`MiniAppPanel` class — every variant you named is a composition of
things that exist (a stage wrapping a workspace, a route, a `T` entry), and a fourth Panel subclass is
how 3,800 lines becomes 6,000. A second sizing currency — `doc/decisions.md` already measured it:
sharing two hugs in one row needs slot ÷ hugs beside `grow`, for an arrangement nobody asked for.
A seventh gesture for "add a panel here" — six is already four too many.
