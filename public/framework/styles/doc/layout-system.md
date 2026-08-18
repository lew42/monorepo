# The layout system — five words

Landed 2026-08-17. Measured cause and evidence: [`ai/2026-08-17/layout-system/proposal.md`](/framework/ai/2026-08-17/layout-system/proposal.md); the before/after screen is [Five layout words](/framework/ai/2026-08-17/layout-primitives/).

All five live in `core/Page/Page.css`. **A page is the first one with no class at all.**

## 1 · the page — one grid, three tracks

```css
.page {
	--measure: 40em; --gutter-x: clamp(2em, 4%, 5em); --pad-y: clamp(1.5em, 4%, 3em);
	display: grid;
	grid-template-columns:
		[bleed-start]           var(--gutter-x)
		[wide-start main-start] min(var(--measure), 100% - var(--gutter-x) * 2) [main-end]
		                        minmax(0, 1fr) [wide-end]
		                        var(--gutter-x) [bleed-end];
	align-content: start;
}
```

`main` is prose (40em ≈ 80 characters). **`wide` is all the leftover** — a wall, a table, a rail-beside-region. `bleed` is edge to edge and *spends the gutter tracks*, so anything on it owes the inset back by hand; that payback rule existed four times before `wide` was real. Prefer `wide`.

No guard selector: `@layer util` beats `@layer theme`, so a page wearing `.flex`/`.grid` keeps its own `display` for free.

## 2 · `.rail` — a side region, sized by its row

```css
:has(> .rail) { container: page / inline-size; }

.rail { display: flex; flex-direction: column; gap: var(--gap, 0.8em);
        flex: 0 0 clamp(14em, 26%, 22em); min-width: 0;
        position: sticky; top: 0; align-self: start;
        max-height: 100dvh; overflow-y: auto; }

@container page (width < 38em) {
	.rail { min-width: 100%; order: -1;
	        position: static; max-height: none; overflow: visible; }

	.rail:has(> .page-preview) { flex-direction: row; overflow-x: auto; }
}
```

⚠ **The container goes on the rail's PARENT, never the page** — a rail is a child of the row it shares with the region, and a container query that matches nothing looks exactly like one that works. ⚠ Below the threshold every rail takes its **own line** and stops being a scrollport — the region scrolls down there, never a short band inside it. ⚠ Its row must be `flex wrap`.

**A rail of cards turns sideways; a rail of controls stacks.** Flipping every rail put `/framework/ui/`'s five filters off the scrollport behind a 2px sliver at 390 — a search box wants a line, not an 11em column. `:has(> .page-preview)` is the question the flip asks.

⚠ `min-width: 100%`, not `flex-basis`. A component's own basis (`browse.css`'s `.browse-rail { flex-basis: 12em }`) is the same specificity in the same layer and loads later, so a `flex-basis` written here loses — silently, at one width, on one page.

## 3 · `.wall` · 4 · `.stage` · 5 · `.solo`

```css
.wall  { display: grid; align-items: start; gap: var(--gap, 1em);
         grid-template-columns: repeat(auto-fill, minmax(min(var(--column, 18em), 100%), 1fr)); }

.stage { container-type: inline-size; aspect-ratio: var(--stage, 16 / 10);
         max-height: var(--stage-max, 12em); overflow: hidden; pointer-events: none; }

.page.solo { align-self: stretch; overflow: auto; min-height: 100%; }
```

A stage needs **both** bounds: the aspect is right while a card is narrow, the ceiling once it is wide. `.solo` fills the *region*, so it never fights the drawer, the dev rail or the mode pill — and it is a route, so Back closes it.

## Watch out

- **`auto-fill`, never `auto-fit`, on `.wall`.** Measured 2026-08-17: `auto-fit` made `/web/`'s two cards 583px each at 1280 and **1,623px each at 3440**. It is right only where a wall is guaranteed a full row — `browse.css` scopes it to `.browse-band`. An empty track is what a `--column`-sized wall is.
- **`wide` is one level deep.** `.page > .wide` is a child combinator, so a grouping wrapper (`md()`, `AITask`, `.tab-panel`) hides it — the wrapper claims the track, not its contents. A subgrid pass-through was built and measured and moved zero pixels, because nothing inside those wrappers claims `wide` in the first place: [the write-up](/framework/ai/2026-08-17/layout-wave-3/proposal.md).
- **`.stage` goes on a box, never on an `<img>`** — it declares `container-type`, and size containment on a replaced element collapses it to nothing, silently.
- Never `--measure: none`. It removes the ceiling, not the width — the shells that did measured 104, 105 and 250 characters a line, and the topic shell (`/`, `/framework/`, `/michael/`) was the last one, fixed 2026-08-17. Claim `.wide` instead.
- **A shell that is not a `.page` has ONE max-width for everything in it.** `/framework/`'s landing is a `.default` block: it took `--measure: none` so the clock band could breathe, then hand-typed `max-width: 52em` back onto every prose block. The shape that works is the grid's, spelled in two rules — the block takes the region, its prose takes the token (`/styles.css`, `.page-framework > .pages > .default`).
- `--page-pad` is the opt-out for a non-grid shell only, and it **inherits** — declaring it on a region makes every page pay it twice.
- Old words (`standard full fill topic doc-page layout-full dt-page`) still work as aliases; the deletion list is on the accept page.
