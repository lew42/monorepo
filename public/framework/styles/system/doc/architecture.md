# System architecture — three fitted lengths, four rungs, one size knob

The design system is the spacing vocabulary: every space on the site is one of a few lengths defined in `framework.css`, and the words you type (`.pad`, `.card`, `.gap-35`, `.size-large`) read them. Page: [/framework/styles/system/](/framework/styles/system/). Its tokens live in [`framework.css`](/framework/framework.css), in `:where(*)` and `@layer util`. No JavaScript is involved; the page only paints the tokens.

## Spacing scales with the window, clamped by width

**Decided:** `--gap`, `--flow` and `--pad` are `clamp()` values that grow with the container's width (`cqi`) between a floor and a ceiling, all multiplied by `--size`.
**Why:** a fixed pixel gap looked right on a laptop and empty on a 3440 screen. The fitted clamps grow with the page and stop at a ceiling.
**Instead:** fixed `px` tokens (wasted width on wide screens) or a multiplier per use (the census found 28 different ones).
**Detail:** [doc/census.md](./census.md)

## Four rungs under the gap, not two

**Decided:** `--gap-70`, `--gap-50`, `--gap-35` and `--gap-25` are `calc(var(--gap) * n)`, so each is a percent of the gap, never a length.
**Why:** a census of 1,894 classified values fit five steps (`--gap` plus these four) to 83% coverage within 15%. Two steps cover 27.4%.
**Instead:** only `--gap` and `--flow`: it would move about 7 in 10 scaled values by more than 15%. It only wins for a new site with no existing spacing to fit.
**Detail:** [doc/census.md](./census.md)

## The gap's ceiling stays below the section step

**Decided:** `--gap` caps at `2.4em`, `--flow` at `2.5em`, so the row gap never overtakes the section gap at any width.
**Why:** at 3440 the row gap used to reach 43.19px against `--flow` at 45px, so stacked rows looked bigger than sections.
**Instead:** raise `--flow` to `2.7em` (undoes the 1.5× paragraph-gap verdict), or define `--flow` from `--gap` (welds two independently tuned tokens together).
**Detail:** [doc/census.md](./census.md#the-number-that-did-not-add-up-fixed-2026-09-18)

## A framed box takes `.card`, not `.pad`

**Decided:** `.card` uses its own `--pad-card` token, which scales with the card's own size; `.pad` (`padding: var(--pad)`) is for a page region.
**Why:** `--pad` has a 1em floor, which is right for a region and wrong for a card, which is nearly always narrow.
**Instead:** `.pad` on a card: the card gets the region's floor and looks cramped at small widths.
**Detail:** [readme.md — Watch out](./../readme.md)

## Scale a whole box with `--size`, one unitless knob

**Decided:** `.size-small` (0.75), `.size-regular` (1) and `.size-large` (1.5) set `--size`, and every spacing token and the font size multiply by it.
**Why:** a dense card and a hero need the same proportions at different sizes, and one knob keeps them in step.
**Instead:** a separate token per box type, which drifts apart over time.
**Detail:** [studies/size/](/framework/styles/system/studies/size/)

## Controls use `em` padding, not spacing tokens

**Decided:** a button, chip, pill, nav item or input sets its own padding, height and icon gap in `em`.
**Why:** a spacing token caps at 2.4–4em, which stands a nav item far too tall on a wide screen.
**Instead:** spacing tokens on controls: their height grows with the window and the nav looks bloated at 3440.
**Detail:** [studies/size/](/framework/styles/system/studies/size/)

⚠ The readme and the page's own rule text say the spacing clamp "caps at 2.6em". The code caps `--gap` at `2.4em`, `--flow` at `2.5em`, and `--pad` at `4em` (`framework.css` lines 263–265). The rule holds; the number in the text is stale.

## Never a multiplier or a raw number

**Decided:** a spacing value is a token or a rung. `calc(var(--gap) * 0.4)` and raw `px` are not used for space.
**Why:** a multiplier is a private rung nobody can see or retune from one place.
**Instead:** a multiplier is allowed only inside the token definitions themselves.
**Detail:** [doc/census.md](./census.md)
