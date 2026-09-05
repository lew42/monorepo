# Proposal — `ext/tabs` needs a variant whose panel you can see

**Status: proposed, not applied.** `ext/` is outside this task's fence, so the fix shipped as
four local classes in `/imagine/paging/paging.css` and this is the site-wide version, with the
exact diff. Nothing in `ext/tabs` was touched.

## The report

The owner, 2026-09-05:

> the current underline tabs (with underline becoming orange (--prim) when active..) don't
> really illustrate their tab content area, it's transparent, and so the link below the tab area
> stays, but there's no visual boundary between them.

He is right, and the general rule behind it is now written down in
[`/imagine/paging/doc/decisions.md`](/imagine/paging/doc/decisions/):

> **A click changes what is inside a rectangle you could already see; the rectangle stays.**

`ext/tabs` draws the strip beautifully and draws the *panel* not at all: `.tab-panel` sets
`padding-top`, `min-width` and two custom properties, and nothing else. So a tab opens onto
whatever the host page's background happens to be, and the reader cannot point at the box that
is about to change before clicking it.

`.tabs.block` already gets halfway — folder tabs, the selected one "a box open onto the page
below" — but the page below has no edges, so the box opens onto nothing.

## The proposal

One new variant, `.tabs.panel`, opt-in, composing with `block` or standing alone. Three ideas:

1. The panel is a real box — a surface, a 1px frame, a radius, its own padding.
2. Its **top edge is the strip**: the panel declares `border-top: none`, and the tabs' own
   bottom borders (plus a `::after` that carries the rule past the last tab) draw it.
3. The **selected tab paints its bottom border in the panel's colour** rather than in the rule,
   so the label and the box are visibly one thing with no line between them.

⚠ It must not be the default. Every tab set on the site would change look at once, and several
hosts (`ext/Doc`'s well, the vertical rail) tune the strip themselves. Opt-in, then adopt
deliberately.

## The diff

```diff
--- a/public/framework/ext/tabs/tabs.css
+++ b/public/framework/ext/tabs/tabs.css
@@ (inside @layer theme, after the `.tabs.block` block)
+
+	/* `panel` — a BOUNDED tab set: the strip and its panel are one box, and the
+	   selected tab is cut out of the box's top edge. Opt-in, and it composes with
+	   `block`; on its own it upgrades the default underline strip.
+
+	   Why: the default panel is transparent, so a tab does not visibly open onto
+	   anything — a reader cannot point at the rectangle that is about to change
+	   before they click it (the owner, 2026-09-05). Shipped locally first as
+	   `.paging-tabs` in /imagine/paging/paging.css; this is the same four rules.
+
+	   ⚠ `--tab-fill` already exists for a host that tints the strip. Here it is the
+	     PANEL's colour too, so a host retunes both with one declaration. */
+	.tabs.panel > .tab-bar { border-bottom: none; }
+
+	/* ⚠ The 2px top border is reserved on EVERY tab, transparent until selected: a
+	     mark that ADDS height would shift its own label by 1px on every click. */
+	.tabs.panel > .tab-bar > .tab {
+		border: 1px solid transparent;
+		border-top-width: 2px;
+		border-bottom: 1px solid var(--line);
+		border-radius: var(--radius) var(--radius) 0 0;
+		margin-bottom: 0;
+	}
+
+	/* carries the strip's rule past the last tab, so the panel's top edge is whole */
+	.tabs.panel > .tab-bar::after { content: ""; flex: 1; border-bottom: 1px solid var(--line); }
+
+	/* ⚠ The same three selectors the `block` variant uses, for the same reason: a set
+	     with nothing of its own in the url must still light its first tab. */
+	.tabs.panel > .tab-bar > .tab.active,
+	.tabs.panel > .tab-bar > .tab:is(.in-path, [aria-current]):not(.tab-default),
+	.tabs.panel > .tab-bar:not(:has(.tab.active, .tab:is(.in-path, [aria-current]):not(.tab-default))) > .tab:first-child {
+		color: var(--ink);
+		border-color: var(--line);
+		border-top-color: var(--prim);
+		background: var(--tab-fill, var(--surface));
+		border-bottom-color: var(--tab-fill, var(--surface));
+	}
+
+	/* ⚠ `border-top: none` is the whole idea: the strip above IS this box's top edge,
+	     with the selected tab cut out of it. */
+	.tabs.panel > .tab-panel {
+		padding: var(--pad, var(--pad-default));
+		background: var(--tab-fill, var(--surface));
+		border: 1px solid var(--line);
+		border-top: none;
+		border-radius: 0 var(--radius) var(--radius) var(--radius);
+	}
```

Specificity is checked: `.tabs.panel > .tab-panel` is (0,3,0) against the existing
`.tab-panel { padding-top: 3em }` at (0,1,0), and every selected-tab rule is (0,4,0) — the same
weight `.tabs.block`'s are, so a set wearing both `block` and `panel` takes whichever is later
in the file. Putting `panel` after `block` (as the diff does) is deliberate.

## Why the local version exists at all

`.tabs.block > .tab-bar > .tab.active` is (0,4,0) inside `@layer theme`, and `paging.css` is in
the same layer. Joining a panel to `ext/tabs`' strip from `paging.css` would mean
out-specifying another module's sheet from ours — every future edit in `ext/tabs` would then
land silently here. Four own classes (`.paging-tabs .paging-tab-bar .paging-tab
.paging-tab-panel`, ~40 lines) cost nothing and fight nothing; they are used in three places in
the realm, so the shape is still one thing.

**If this proposal lands, those four classes should be deleted** and the three call sites
(`demos.js`'s `swap_demo()`, `mechanisms/swap/swap.js`'s `tab_set()`, `make/tabs.js`'s
`tabs_items()`) should emit `class="tabs panel"` with `ext/tabs`' own class names instead.

## Where to see it

- [/imagine/paging/](/imagine/paging/) — the swap miniature at the top
- [/imagine/paging/mechanisms/swap/](/imagine/paging/mechanisms/swap/) — the `tabs` visual
- a made page whose children are tabs, e.g. [/imagine/paging/make/](/imagine/paging/make/) →
  set a row's fourth word to `tabs` and open it
