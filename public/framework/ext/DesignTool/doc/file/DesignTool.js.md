The front door. `analyze()` is the whole tool — every other file in this module
is a way of calling it somewhere else (an iframe, a width sweep, a saved
capture). Everything downstream (`report.js`, `live.js`, the audit and tests
pages) imports from here, never straight from `rules.js` or `polish.js`.

## `analyze()` accepts an element OR an already-probed model

`target?.nodes ? target : probe(target, opts)` — the one line that makes
`sweep.js` and a saved JSON capture possible: a report can be recomputed with
no browser at all, because nothing downstream of `probe()` ever touches the
DOM.

## `roll_up()` is two passes: siblings, then structures

`siblings()` collapses children of one parent — eight paragraphs each running 96
characters is one mistake, the container that never bounded them, not eight.
`FLOCK = 2`, deliberately not 3: two siblings sharing a rule already read as
"the same problem twice," and reporting them separately both doubled the
apparent problem count and pointed at the wrong element.

`repeats()` then collapses by **rule × selector**, wherever it repeats. The
sibling pass structurally cannot see a row drawn three hundred times, because
each offender is the only child of its own row: `div.ai-line` × 300 on one
dashboard, `span.sidebar-label` × 2504 site-wide from one `Sidebar`
declaration, `alignment` firing 20,924 times across the site. The surviving
finding carries `count`, and `report.js` sums it rather than counting rows.

⚠ Order matters. Siblings first, so a rolled parent enters the second pass under
*its* selector — twenty cards each rolling up their own children then collapse
as twenty cards.

## ⚠ A roll-up carries TWO addresses, and confusing them rang the whole page

```js
sel: parent.sel, path: parent.path,          // where the FIX goes
spot: { path: worst.path, sel: worst.sel },  // where to LOOK
```

The attribution is the container's and should be — `max-width` on eight
paragraphs is eight rules to unset later, on their parent it is one. The
**location** is not: the parent of a page's direct children is the page
container, so a single `path` meant the ring covered `div.md.flow` at 390×25731
while the detail line beside it read "worst is `p`". Measured 2026-08-17: 32 of
47 rings covering ≥60% of the viewport were roll-ups, and 7 of 7 in any top-3.

`spot` is issue-shaped (`{ path, sel }`) so `highlight.js` can write
`i.spot ?? i` — a finding is its own address when it has no exemplar — and so the
ring's caption names the box it is actually drawn around. Nothing else reads it:
`mirror.js` deliberately keeps `path`, because the before/after you want to see
is the fix applied to the **container**.

## `frame()` needs `max-width: none` and a timeout, and neither is optional

`framework.css`'s base reset is `iframe { max-width: 100% }`, so `frame(url,
3440)` from a 1920 window laid out at 1920 and labelled itself 3440 — identical
rows for the two widths, nothing thrown. And a url whose `onload` never fires
hangs the caller forever; three site sweeps did exactly that. Both are in the
`cssText`/options here as well as in `DesignTool.css`, because a caller that
never loads the stylesheet is the case that breaks silently.

## `parent_fix()` special-cases one rule by name

When a flock's fix is rolled up to the parent, `measure` gets a different
declaration (`--measure: 52em; max-width: var(--measure)`) than every other
rule (whose child-level `fix.decl` is reused verbatim). That is a hard-coded
`rule === "measure"` check living in the shared front door rather than beside
`rules.js`'s own `measure` rule — see Improvements.

## Improvements

1. **`parent_fix()`'s `rule === "measure"` branch is the one place a rule's
   identity leaks out of `rules.js`/`polish.js` and into the shared roll-up
   logic.** A second rule that wants a different parent-level fix has nowhere
   obvious to add its own case without extending this same `if`/`?:` chain.
   Letting a rule optionally declare its own `parent_fix(worst)` alongside its
   `scan()` would keep that knowledge where the rule is defined. *(medium,
   useful — no second caller yet, so this is speculative until one shows up.)*
2. **`FLOCK`'s "two, not three" reasoning lives only in a comment here**, and
   is exactly the kind of calibration decision `knowledge/*.md` exists to
   collect — it currently isn't cross-referenced from there. *(simple,
   speculative.)*
