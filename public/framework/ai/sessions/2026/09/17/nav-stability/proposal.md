# Proposal for core — a column that is open stops paying for the next one

**One declaration in `public/framework/core/Page/Page.css`.** Today a column's width is a
function of how many columns are open. Change it to a function of the column itself and the
navigation stops moving. Shown side by side, with the numbers, at
[/imagine/design/navigation/](/imagine/design/navigation/).

## What it replaces

`public/framework/core/Page/Page.css`, **line 300** — the one line in the whole file that
makes a column elastic:

```css
	/* line 299-306, as it is today */
	.page.columns .page-column-body {
		flex: var(--page-column-flex, 1 1 0);          /* ← line 300 */
		min-width: var(--page-column-min, 16em);
		max-width: var(--page-column-max, clamp(40em, 42cqi, 46em));
		…
	}
```

`1 1 0` means *grow and shrink to share the row equally*. Two columns each take half the
leftover; a third arrives and all three take a third. Every open column gets narrower, its
prose rewraps into more lines, and every nav link below that prose moves down the page. That
is the whole defect, and it is this one value.

## The change

```css
	/* Page.css, replacing the fallback on line 300. A column's width becomes a
	   function of ITSELF: the same number `max-width` on line 305 already caps it at.
	   Nothing else in the file moves. */
	.page.columns .page-column-body {
		flex: var(--page-column-flex, 0 0 clamp(40em, 42cqi, 46em));
		…
	}
```

The lab ships it as an opt-in class so it can be seen beside today's behaviour, and the
selector is the only difference — `public/imagine/design/navigation/navigation.css`:

```css
	.dn-stable .page.columns .page-column-body:not(.page-column-fill, .page-column-full, .page-column-hug) {
		--page-column-flex: 0 0 var(--page-column-max, clamp(40em, 42cqi, 46em));
	}

	/* The second half of "persistent navigation": once the row scrolls, a rail that
	   scrolls away with it is not persistent. NOT on a phone — under 32em of row core
	   already pages one column at a time, and a pinned rail there would sit on top of
	   the column you just opened. */
	@container page-columns (width >= 32em) {
		.dn-stable .page.columns .page-column-small {
			position: sticky; inset-inline-start: 0; z-index: 2;
		}
	}
```

In core the `:not()` is unnecessary — `fill`, `full` and `hug` all set
`--page-column-flex` themselves (lines 342, 344, 345), so the new fallback never reaches
them. In the lab the class sits *outside* the cascade core uses, so it has to say so.

## The rule, in one sentence

> A column that is already open never changes width when a column opens to its right; the
> new column takes what is left over, and when nothing is left the row scrolls sideways —
> the Finder way — instead of squeezing what is open.

The second clause needs one honest footnote. `0 0 <own width>` does not measure the
leftover: the new column takes its own width, which is *at most* what it would have been
given anyway, and the remainder stays leftover. Page.css already draws that leftover as the
column slots it is (the `repeating-linear-gradient` on `.page-columns-row`, line 254), so
the row says "more opens here" rather than showing a grey field.

## What the six width words become

| word | today (lines 341-345) | under the rule | changes? |
|---|---|---|---|
| `small` | `flex: 0 0 clamp(14em, 16cqi, 24em)` | unchanged | **no** — it already sets its own `--page-column-flex`. This is why a rail is the one column on this site that never moved; the rule generalises what `small` already does. |
| `hug` | `flex: 0 0 auto`, 6em-24em | unchanged | **no** — sets its own flex, and it is already sibling-blind. |
| (none) | `flex: 1 1 0`, floor 16em, ceiling `clamp(40em, 42cqi, 46em)` | `flex: 0 0 clamp(40em, 42cqi, 46em)` | **yes.** Takes its reading width and keeps it. 640px up to a ~110em row, 736px above. |
| `large` | `flex: 1 1 0`, floor 28em, ceiling 64em | `flex: 0 0 clamp(28em, 50cqi, 64em)` | **yes**, and it needs a `cqi` term it does not have today: `0 0 64em` alone would be 1024px at every width, so two of them scroll a 1920 screen. The clamp is the same shape the default and `small` already use. |
| `fill` | `flex: 1 1 100%`, no ceiling | unchanged | **no** — `fill` exists to take the leftover, and it already yields to an open child (line 360, added 2026-09-05). |
| `full` | `flex: 1 0 100%`, min 100% | unchanged | **no** — `full` claims the host and collapses its ancestors into the crumb strip. |

The `< 32em` phone regime (line 571-573) is untouched and cannot be disturbed: it sets
`flex` directly at the same specificity, later in the file, so it still wins. Measured: at
400 the lab reads 0 and 0 on both halves, exactly as it does today.

The drag seam is untouched too. A dragged column is `--page-column-flex: 0 0 <px>`, which is
this rule applied by hand to one column — same mechanism, no second idea.

## The before/after this replaces

Measured 2026-09-17, headless Chromium, one fresh context per page and width. Arrive, then
click nav links one at a time. Each cell is the **largest shift of a column that was already
open** — *x on screen / its width / the top of one of its first five nav links* — in pixels.
Raw numbers: [`measurements.json`](measurements.json). Browsable:
[/imagine/design/navigation/numbers/](/imagine/design/navigation/numbers/).

| page | 1280 | 1920 | 3440 | 400 |
|---|---|---|---|---|
| `/imagine/` | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 400 / 0 / 0 |
| `…/columns/finder/` | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 400 / 0 / 0 |
| `…/columns/uses/docs/` | **181 / 181 / 170** | 0 / 0 / 0 | 0 / 0 / 26 | 400 / 0 / 0 |
| `…/columns/uses/workbench/` | **242 / 181 / 146** | **235 / 235 / 52** | 0 / 0 / 0 | 400 / 0 / 0 |

And the same click in the lab, today's row against the stable row, at four widths:

| width | today: nav moved / widths changed | stable: nav moved / widths changed |
|---|---|---|
| 400 | 0px / 0px | 0px / 0px |
| 1280 | **129px / 225px** | **0px / 0px** |
| 1920 | **129px / 225px** | **0px / 0px** |
| 3440 | **129px / 236px** | **0px / 0px** |

The page's own readout and an independent headless measurement of the same click agree
exactly at every width.

## What this costs, and the two tunings that trade it the other way

The cost is the scroll. At a 1056px row a rail plus two 40em reading columns is 1504px, so
opening the third column scrolls the row by 448px and most of the middle column goes under
the pinned rail. Nothing resized — but something did move off screen. Two variants trade
that away, and **both are the owner's call, not mine**:

- **Freeze at the floor** (`0 0 var(--page-column-min, 16em)`). Four columns fit a 1280 row
  with nothing scrolling and nothing moving. Reading columns become 16em — a note's width,
  not a page's. This is already shipped, as `.paging-nav-fixed` in
  `public/imagine/paging/navigation/navigation.css`, from the 2026-09-05 pass.
- **Freeze at a third of the row** (`0 0 clamp(var(--page-column-min, 16em), 34cqi, var(--page-column-max, 46em))`).
  Three columns fit at 1280, four at 3440, and the reading column is ~22em at 1280 and 46em
  at 3440. Sibling-blind like the other two, and the only one that both stays still and
  keeps a 3440 screen full. It costs a number — `34cqi`, "about a third of the row" — that
  the other two do not.

The proposal above is the literal reading of the sentence this task was given ("the row
scrolls sideways instead of squeezing what is open"), which is why it is the one built.
