# element-provenance — select an element, see how and where it is defined

**Shipped today, the first slice:** select anything and the drawer ends in a **css** group — one
row per rule the browser is actually applying, tagged with the **part** it comes from
(`drawer.png`). Below is what comes next.

## 1. Scope — EVERY element, read-only

`cssdoc.rules(el)` walks the live CSSOM, so it answers for any element with no registration and
nothing to configure. Per-panel and a `provenance:` config key are both rejected — a config key
is API forever and buys nothing. What *is* scoped is **selection** (`layout.bar()` → `region()`),
and that is the real gap (§5): widen selection, leave provenance universal. An element with no
words is not a blank panel — `div()` still takes `*, ::before, ::after { box-sizing }` from
framework base. Measured: bare `div.c("flow pad")` → 4 rules, `.sidebar` → 10.

## 2. The drawer's provenance section

```
  div.c("flow pad")                    ← the build line — source(), already there
  ▸ 4 css rules
      framework  base       🔒         ← part · layer · lock (§3)
      *, ::before, ::after   box-sizing: border-box;
      lew42      theme      🔒         ← the theme part → /framework/styles/layers/
      :where(h1, h2, h3)     line-height: 1.15;
      layout     theme                 ← a module's own sheet → /framework/ext/layout/
      .layout-bar            position: absolute; …
      inline     — written by JS       ← §2b, not built
                             --gap: 1em;

  cssdoc.part(href)      "framework" | "site" | the owning dir — "lew42", "layout", "Panel"
  cssdoc.rules(target)   a View or Element → [{ part, layer, file, path, selector, decls }]
```

`cssdoc()` already had `all_rules()`, `parts()` (the `:where` split), the matcher and
`decls()`. **The change was 24 lines, all inside `CSSDoc.js`** — cost **S**, done; and
`ext/layout/body.js` renders the rows in one 12-line `defined($el)`.

**The finding that shapes the rest: the `@layer` is not the part.** `.sidebar` returns `Page
theme`, `Sidebar theme` and `site site`; `.page-title` returns `framework theme` and `lew42
theme` — four parts, all reporting layer `theme`. Only the **file** answers "what else will
this affect", which is why `part` comes from the sheet's href.

### 2b. What the CSSOM cannot see — inline styles (next, cost S)

`css-audit/audit.md`: **905 inline `.style()` call sites, 41% custom properties** (`--gap` 273,
`--column` 76). Those live on `el.style`, not in a rule — invisible to `cssdoc.rules()` and
*stronger than every rule it finds*; the layout bar's own knobs write them. So the drawer is
missing the declarations most likely to be the answer. One row from `[...el.style]`, labelled
`inline — written by JS`, closes it — before anything in §3.

## 3. "What am I editing" — the lock and the core-component page

1. **A lock glyph is a LABEL, not a permission.** Nothing in the drawer edits CSS today: the
   chips write classes, the knobs write inline styles, both on one element. So the lock costs
   one predicate — `part is "framework" or "lew42"` — says *this is shared*, and stays honest
   the day an editor exists.
2. **The link is the click-through.** `framework` → `/framework/styles/`, `lew42` →
   `/framework/styles/layers/`, a module → `/framework/ext/<name>/`; those pages exist. A
   *separate* "THIS IS THE CORE COMPONENT" page is not worth building — let the module page
   wear the banner when it is reached from a locked rule.
3. **Usages: not yet.** Two numbers would have to agree: `.c("x")` occurrences across
   `public/**/*.js` (static — misses `` css(`…`) `` and every computed class string) and live
   elements matching the selector in *this* document (dynamic — sees only the page you are
   on). They never will, and a wrong count beside a lock is worse than no count.

## 4. Drawer resize — a shared part in `ext/`, not an import of `dev/`

`dev/DevBar/grip.js` is 25 lines welded to DevBar's `settings.js` (`rail()` writes `--dev-rail`
on `<html>`, `set()` persists it) and its `.dev-grip` CSS; and `ext/` importing `dev/` inverts
the dependency, since `dev/` is dev-only and `ext/drawer` ships. So extract **`ext/grip/`** —
`grip({ write, done })`, the pointer choreography plus the pill — and DevBar's becomes
`grip({ write: px => rail(innerWidth - px), done: width => set({ width }) })`. Two callers is
the bar and the second is here now. Cost **M**.

Three facts to carry, all verified. The grip must sit **wholly inside** the rail's box
(`inset-inline-start: 0`, no straddle) — the entire 2026-08-16 fix — which is also why a closed
drawer cannot linger: after `translateX(100%)` the box spans `[vw−devbar, vw−devbar+width]`, so
it is behind the DevBar (z 50 > 40) or off-screen. `html.dev-sizing { --rail-ease: 0s }` must
travel too, or the rail trails the pointer. ⚠ And **one new token**: `drawer.close()` clears
`--drawer`, so a resized drawer springs back to 19rem the moment it shuts — width and
open/closed are one variable today. Persist the width as `--drawer-w` and have `drawer()` write
`--drawer: var(--drawer-w, 19rem)`; `framework.css` needs no change.

## 5. The two-up defect — `ext/demo/layout.js:71-72`

```js
const { $stage, $views, redraw } = two(() => this.frame(), { narrow: 390, level: true });
steer($views[0]);                  // ← 71
this.toggles($views[0], redraw);   // ← 72
```

**Cause:** `layout.bar()` is the *only* caller of `region()` (`ext/layout/layout.js:37`), so
selectability is welded to the toolbar — and a two-up wants one bar over two selectable panes.
Measured on `/framework/styles/layouts/docs/`: 2 `.demo-sim`, **1 `.layout-region`, on pane 0**
(the wide left one). Clicking the right pane selects nothing *and deselects*, because
`panel.js:81` finds no `.layout-region` ancestor.
**Fix, cost S:** export `region` as `layout.selectable($el)` (2 lines in `layout.js`), then
`$views.forEach(layout.selectable)` and `this.toggles($stage, redraw)` — `$stage` covers both
panes because `host_of()` walks up. Reading either pane is safe; *editing* the right one is
per-pane and `redraw()` wipes it — one more reason provenance stays read-only.

## 6. The DevBar AI context contract

`panel.js`'s `$sel` is module-private, so the contract is the class it writes:
**`.layout-selected`** — exactly one per document, set by `select()`, cleared by `deselect()`.
`ask-tab-binding` should read `layout.selected()`, a one-line accessor to export from `panel.js`,
and turn it into text with `source($el)` + `cssdoc.rules(el)`. No event, no registry.

## 7. Order

| | | |
|---|---|---|
| 1 | inline styles as a row (§2b) — without it the drawer lies by omission | S |
| 2 | two-up: `layout.selectable()` over both panes (§5) | S |
| 3 | `layout.selected()` for the AI context (§6) | S |
| 4 | lock glyph + part link (§3.1–2) | S |
| 5 | `ext/grip/` extracted, drawer resizes, `--drawer-w` (§4) | M |
| 6 | styling — the css group overflows a 19rem rail today | S |
| — | usage census · unlock toggle · CSS write-back · per-rule specificity · a `doc/style/<name>.md` per selector | **not yet** |
