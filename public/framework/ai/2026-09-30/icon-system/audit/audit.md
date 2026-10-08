# Icon audit — every icon use, and the CSS that lays it out

Every icon on the site is the same call: `icon(name)` in
[`core/View/View.js`](/framework/core/View/View.js) (line 469) — it just returns
`<span class="material-icons icon">name</span>`. It sets no size, no padding, no
alignment. **All layout is left to each caller's own CSS** — which is exactly why there
are so many different answers to the same small question. Read the measured facts first:
[`facts.md`](facts.md) (are icons fixed-width? when does an icon need a frame?).

**How this was found:** grep for `icon(` (188 JS files call it), `.icon` as a CSS
selector (~95 rules across ~60 stylesheets), and `material-icons`. Skipped every
`public/framework/ai/` dated task folder per the brief (that's log/report noise, not
site code). What follows groups those ~95 rules into the small number of *shapes* they
actually draw.

## Pattern table — one row per shape, most common first

| Pattern | What it looks like | Count (rules seen) | Example |
|---|---|---|---|
| **Inline with text** — icon sits beside a label or heading, sized by `font-size` alone, no frame, no background | A breadcrumb, a menu label, a card title, a nav link | ~55 — the large majority | `.page-crumbs .icon { font-size: 1em; }` (`core/Page/Page.css:770`) |
| **Icon-only frame** — a fixed square em-box, glyph centred both ways, used as a click target | `ui/item`'s row icon/caret, Panel's icon-only toolbar button | 3 | `.item-caret, .item-icon { width: 1.3em; aspect-ratio: 1; display: grid; place-items: center; }` (`ui/item/item.js`) |
| **Toggle / state colour** — no size change, just `color` swapping on `.on`/`.active`/hover | A selected page-column row, a dropdown's chosen option, a lit toolbar tool | 6 | `.dropdown-list > .dropdown-option.on { color: var(--prim); background: color-mix(...) }` (`ext/Dropdown/dropdown.css:74`) |
| **Rotating disclosure glyph** — same icon, `transform: rotate()` on open/close, no resize | A file-tree folder arrow, a switcher chevron | 2 | `.file-dir.open > .file-dir-name .icon { transform: rotate(90deg); }` (`ext/files/files.css:74`) |
| **Floating round pill button** — `position: fixed`, padding, border, its own background always on | The mode switch pill (bottom corner of every page) | 1 | `.mode-btn { padding: 0.5em; border-radius: 999px; background: var(--surface); }` (`core/App/mode.css`) |
| **Icon card** — a big centred icon over a label, 3 named sizes | The `ux/Content` icon-card grid | 1 (3 size variants) | `.ux-content-icard.w2 .icon { font-size: 2.75rem; }` (`ux/Content/content.css:174`) |

The by-far dominant pattern (55 of ~95 rules) is the simplest one — an icon riding
beside text, sized once. That part of the system is fine as-is; `framework.css:562`
(`.icon { font-size: 1.25em; line-height: 1; }`) already gives every caller a sane
default and most callers just tweak the size. **The trouble the owner is describing
lives in the other 40 rules** — the one-off buttons, rails and toggles below, where
each module invented its own frame, padding and hover shape instead of sharing one.

## One-off implementations — worst first

Ranked by how much custom layout it re-invents (not just a `font-size` tweak) and how
visible the seam is.

| # | File : line | Selector | What's custom | Why it's a one-off |
|---|---|---|---|---|
| 1 | `imagine/paging/paging.css:1020` | `.paging-expand-head .icon` | `vertical-align: -0.15em` hand-tuned nudge, marked `/* control */` | This is a **hand patch for the exact vertical-alignment bug in `facts.md` §3** — proof the default (icon inline, no frame, no nudge) really does sit visibly high. Every other inline-icon caller on the site has this same bug and just hasn't been nudged. |
| 2 | `ext/Panel/toolbar.css:94-123` + `ext/Panel/controls.css:110-130` (duplicated) | `.panel-btn:hover`, `.panel-btn.on`, `.panel-btn:has(> .icon,...)`, `.panel-workspace .icon` | Its own hover tint, its own `.on` lit state, its own `:has()`-based square-frame detection (`inline-size: 1.7em; padding: 0`), its own icon-overflow guard against a missing-ligature blowout | The **exact toggle/frame/hover system the owner is asking for already exists here** — flush by default, hover tint, `.on` = lit background, icon-only rows auto-detected as squares — but it's scoped to Panel alone and **copy-pasted verbatim into a second file** (`controls.css`), so a fix to one won't reach the other. Best candidate to promote to the shared system rather than rebuild from scratch. |
| 3 | `core/App/mode.css` | `.mode-btn` | `position: fixed`, its own border-radius pill, its own shadow, its own background always-on | A one-of-a-kind floating icon button with no flush/background choice — it's always backed. Small, but it's a second, different "icon button" shape from Panel's. |
| 4 | `core/Search/Search.css:45-60,160-175` (`Omnibox`) | `.omnibox-bar > .icon`, `.omnibox-card .icon` | Icon dropped into a pill with hand-set padding (`0.45em 0.7em`) and no frame; relies on the parent's `display:flex` (unverified from CSS alone) to avoid the fact-3 vertical bug | Another bespoke "icon in a rounded bar" shape, not obviously checked against the vertical-alignment default. |
| 5 | `imagine/scenes/scenes.css:67-68` | `.scene-bar .icon` | `font-size: 0; width: auto;` then a `::after { content: "/"; }` — the icon glyph is hidden and a literal slash character stands in for it | The strangest one-off found: it suppresses the real icon entirely and fakes a divider glyph with CSS content instead of just using a different icon name. Not screenshotted (the control that uses `.scene-bar` wasn't visible on the page's default view — see below), but worth a direct look before the system is built, since "fix" here may just be "use `icon(\"chevron_right\")` like everywhere else." |
| 6 | `ext/AITask/nested.css:64` / `ai2/content.css` icon-card variants | `.ai-tree-then .icon { font-size: 2.4em; }`, `ux-content-icard.w1/.w2/.w3` | Each defines its own big display size for a "hero" icon rather than sharing one scale | Minor — three near-identical size-variant blocks that could be one shared `--icon-hero` token, but low risk since each is visually intentional, not a bug. |

**Duplication flag:** #2's Panel rules are **byte-for-byte copied** between
`toolbar.css` and `controls.css` — that's the single biggest "too many custom
implementations" finding, worse than any individual bad rule: the site already
built the toggle/frame/hover system the owner wants, twice, in the same module.

## Screenshots

Six pages shot at 1920px with `node Server/layout-check.mjs ... --widths 1920`
(full-page screenshots and per-page layout numbers in [`shots/`](shots/)):

- [`shots/monorepo-localhost-framework/1920.png`](shots/monorepo-localhost-framework/1920.png) — home page: the floating mode pill (pattern 5) and the dev bar's icon buttons, both flush and backed styles visible together.
- [`shots/monorepo-localhost-imagine-paging/1920.png`](shots/monorepo-localhost-imagine-paging/1920.png) — the left rail and the six-block cards: icon+label rows using the dominant "inline" pattern; look closely at the block headings ("Stage", "Room", ...) for the subtle high-sitting icon described in `facts.md` §3 — it's the *already-patched* one (one-off #1), so it reads fine here; unpatched siblings elsewhere won't.
- [`shots/monorepo-localhost-framework-ext-files/1920.png`](shots/monorepo-localhost-framework-ext-files/1920.png) — the file tree: rotating folder-open glyphs and a left nav using icon-item rows.
- [`shots/monorepo-localhost-framework-ui-item/1920.png`](shots/monorepo-localhost-framework-ui-item/1920.png) — `ui/item`'s own doc page: the cleanest example of the frame pattern (one-off #2's alternative — this one should probably become the shared system, not Panel's).
- [`shots/monorepo-localhost-framework-ext-Panel-playground/1920.png`](shots/monorepo-localhost-framework-ext-Panel-playground/1920.png) — Panel's own icon-only toolbar buttons (one-off #2) live.
- [`shots/monorepo-localhost-imagine-scenes/1920.png`](shots/monorepo-localhost-imagine-scenes/1920.png) — shot for one-off #5 (`.scene-bar`); that control isn't on the page's default view (it's inside one of the five 3D rooms), so this screenshot doesn't actually show the bug — flagging that gap rather than guessing.

None of the six pages threw a console error or layout overflow at 1920px (see each
`layout.json` next to its screenshot) — the misalignment this audit found is a few
pixels of vertical drift and copy-pasted CSS, not a broken page.

