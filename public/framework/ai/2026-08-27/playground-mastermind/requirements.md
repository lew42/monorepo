# Playground overhaul — mastermind run

The ask, verbatim (owner, 2026-08-27):

> you're going to work on the ext/Playground … you're fable, spawn minions. try to get them to ui-test the interactions, they're currently a bit off
>
> while hovering any box, we get a lot of "jumpy" behavior, we don't want any jumpy behavior.
>
> we want better labels. they don't need to stay, they should appear/disappear on hover, and their alignment is a bit off (they need to be a little higher or something).
>
> let's have a toggle for "pad" (toggle class). look into the .tc() and .toggle_class() methods on View, and implement the .tc("class", bool) variant for easier toggling. let's also have a toggle for "gap" (class toggle)
>
> are we sure we have the right logic for the height/width hug, fill, fixed variants, and for flex and grid? we want to generally revert back to default (i'm not sure "width: 100%" is necessary, isn't that default?) if we start adding non-defaults, we might get into a strange state where things don't work as they used to.
>
> the default document starts with fixed height boxes, let's start with a page with surface bg, and start with a holy grail layout, for new default documents. i don't feel like this helps me learn flex or grid…
>
> spawn some researchers to use the ui-test skill, and try to refine it, until we get some usable feedback. figure out how to compact this ext/Playground, in order to make it simpler, more intuitive. let's focus on exploring layout - any layout, in as few clicks as possible. one complaint: when you're hovering a container, and click the + to add an item, we get an item, and immediately a + button inside it. we don't have the ability to click several times. maybe you have to click to select, and then the + button (and resize handles) appear (but also only on hover, so selected + hover).
>
> when the minions are testing the ui, are they able to test hovering around? or even just fake a hover with `ac("hover")`? compute layouts before/after these hovers, and make sure we're not getting any jank. maybe the hover effects should be abs-pos only, so they'll never affect anything? the column + (vertical buttons) cause the whole layout to jump. for internal children, we want the blocky "+" button (similar to now). maybe this button DOES adjust the layout, and IS the "min-height" effect - the button only appears on select + hover, and might need opacity: 0, instead of display: none, so it keeps the parent block propped open. every container will have a bit more bottom padding than it would otherwise, but i think this is ok. it prevents any jank. however, this will not work for columns. and, it won't work for inserting between items. also, make the blocky button a little more button like (not the dashed border). give it a subtle hover effect.
>
> for insertion point, cursor-style, like the current hover based resize handles (which should also follow the select + hover to appear, not just hover). the columnar resizers sometimes appear in the wrong place. are these abs pos? try to get these to flow with the natural layout, rather than computing their position.
>
> when resizing vertically, occasionally we're getting some strange resizing of width?
>
> try to get the gap: 0 to be some sort of min(--gap, 0.25em), or however you did the padding.
>
> for these edge resizers, make them clickable (opposed to a drag), and have a small + icon button appear. this way, for any edge, we can click it, and then add an item. we want to be able to add anything (a row, column, child, sibling, section, whatever), where ever we want, simply by hovering.
>
> try to figure this out … you're the mastermind, you make decisions, work autonomously. make the ext/Playground exceptional, easy, intuitive, so that I can explore the flex and grid systems joyfully.

## Plan

- Wave 1 (parallel):
  - `view-tc` (Sonnet) — `View.tc(cls, force)` + doc updates. Fence: `core/View/`.
  - `pg-interactions` (Opus) — jank elimination, labels, select+hover gating, in-flow handles, the column-drag width bug. Fence: `ext/Playground/canvas.js`, `ext/Playground/playground.css`, own task dir.
  - `pg-ux-research` (Opus) — ui-test-driven jank harness + UX compaction proposal + edge-insertion design. Read-only on the module; writes its own task dir + skill improvements.
- Wave 2 (after wave 1): `pg-model` (Opus) — pad/gap toggles (uses new tc), gap floor, hug/fill/fixed audit (minimize written declarations), holy-grail default seed. Fence: `items.js`, `documents.js`, `toolbar.js`, `Playground.js`, `playground.css` (wave 1 landed).
- Wave 3: mastermind smoke-tests seams, documentation, finish-task.

## Known facts (mastermind's own read)

- Jank source: `.pg-add` is `display: none` → `display: block` on `:hover` (playground.css:108-112), in flow — every hover reflows the container.
- Column-drag width bug: `resize_handles` commit path always writes the `width` key (canvas.js:179,188-189) and `is_fixed_len` reads only `width` (canvas.js:108) — in a `column` flex the main axis is height, so a vertical drag writes width data → cross-axis `width: <len>` (items.js size_decls). This is the owner's "vertical resize changes width".
- Labels render always (canvas.js:81), abs-pos at -1.1em (playground.css:94).
- Pad floor prior art: items.js `pad_decl` (0.25em floor rendered in styles(), data untouched).
