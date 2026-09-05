# Two core proposals — not applied, `core/` is outside this task's fence

Both were found by measuring, both are one rule, and both are live and proven in
`public/imagine/paging/navigation/navigation.css` under a `paging-nav-` name.

---

## 1 · `--page-column-*` inherit into a nested columns row  (a bug, not a feature)

**What happens.** The three width tokens are declared on a column BODY and custom properties
inherit, so a `demo.app()` columns row built *inside* a column takes that column's tokens.
Measured 2026-09-05 on `/imagine/paging/navigation/columns/` while it was a `full` page: the
demo's default-width column computed `flex: 1 0 100%` and `max-width: none` — inherited from
the `full` ancestor — and rendered **1202px wide inside a 1202px row**. A column with a width
word of its own (`small`) was unaffected, because it redeclares all three.

Nothing throws, and the only symptom is a demo that silently shows the wrong thing.

**The fix**, in `core/Page/Page.css`, `@layer theme`, beside `.page.columns .page-column-body`:

```diff
   .page.column,
   .page-column-pages { display: contents; }
+
+  /* ⚠ THE THREE WIDTH TOKENS INHERIT, and a columns row nested inside a COLUMN of
+     another row would otherwise take that column's own three — a demo row inside a
+     `full` column gave every wordless column `1 0 100%` / `max-width: none` and one
+     of them rendered 1202px wide in a 1202px row (2026-09-05). A host starts from
+     the defaults. `initial` on a custom property is the guaranteed-invalid value,
+     which is exactly what makes `var(--x, fallback)` fall back. */
+  .page.columns {
+  	--page-column-flex: initial;
+  	--page-column-min: initial;
+  	--page-column-max: initial;
+  }
```

**Blast radius:** only a columns host that has a columns *column* above it — today that is
`demo.app()` rows inside a column, which is the one blessed way to put a real row inside one
(`doc/columns.md`). A top-level host inherits nothing, so nothing else changes.

---

## 2 · `fixed` — a width word for the HOST, so a new column costs nothing

**What it buys.** The measured worst sideways case on the site is a link that opens two
columns at once: **194px at 1280**, because the column you were reading drops from its 64em
ceiling (963px) to its 28em floor (421px) in one click. One column costs 126px. With fixed
widths both are **0px**.

**The rule**, in `core/Page/Page.css`, after the width words:

```diff
   .page-column-full  { --page-column-flex: 1 0 100%; --page-column-min: 100%; --page-column-max: none; }
+
+  /* `columns({ fixed: true })` — the host stamps `fixed` on its own `.page.columns`.
+     Every column takes the width its word FLOORS at and neither grows nor shrinks, so
+     a new column is APPENDED rather than paid for by its neighbours. `small` already
+     worked this way, which is why a rail is the one column that has never moved.
+     ⚠ THE FLOOR, NOT THE CEILING. Elastic columns fill the row exactly, so pinning
+       them at their widest overflows the row as soon as a second one opens — and
+       `reveal_column()` then scrolls the row to show it, which moves what you were
+       reading after all. Measured both ways: ceiling 9px at 1280, floor 0px at 1280
+       and 3440 (ai/2026-09-05/nav-stability/).
+     ⚠ `fill`, `full` and `hug` are exempt: the first two exist to take the leftover,
+       and `hug` is `0 0 auto` already — fixing it at its 6em floor would stop it
+       hugging. */
+  .page.columns.fixed .page-column-body:not(.page-column-fill, .page-column-full, .page-column-hug) {
+  	--page-column-flex: 0 0 var(--page-column-min, 16em);
+  	--page-column-max: var(--page-column-min, 16em);
+  }
```

and one line in `Page.class.js`:

```diff
-  columns(){ this.columnar = true; return this; }
+  columns(options){ this.columnar = true; return this.assign(options); }
```

with `render_column()` already appending `this.classes` to the host's view, so a host says
`columns({ classes: "fixed" })` — or `classes: "fixed"` in its own declaration — and nothing
new is needed. (`fixed` is a bare word: check it against `css-scopes.txt` before taking it.
`page-fixed` is the safe alternative.)

**The trade, stated:** a fixed column is as wide as its word's FLOOR — 16em for the default
track, 28em for `large` — which is narrower than the elastic version at the same width. The
existing answer to "I want this one wider" is already there and already the same mechanism:
**drag the seam.** A dragged column is `--page-column-flex: 0 0 <px>`.

**Not proposed:** freezing each column at whatever width it happened to have when it opened.
That is the truest reading of "keep your width" and it needs JS in `reveal_column()`; it is
worth doing only if the floor version is judged too narrow in use.

---

## 3 · A note for `ext/tabs`, not a diff

`.tab-panel` cannot wear the reserved-height rule as things stand: the set mounts **one page
at a time**, so an unopened tab has nothing to measure. Reserving means mounting every tab's
page up front — right for four small panels, wrong for a forty-member rail — so it wants to
be an opt-in word on the set (`this.tabs("a b c").ac("reserved")`), never a change to every
tab set on the site. The measured cost of not having it: the panel on `/framework/ext/tabs/`
is **4247px on Overview and 2527px on API at 1280** (5010 → 3077 at 3440), so anything below
it moves by that much on every press.

The cheap fix that needs no new machinery is a floor — `min-height` on `.tab-panel` — which
caps the jump rather than removing it.
