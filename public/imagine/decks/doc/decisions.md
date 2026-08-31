# Decisions — decks

The ask (the owner, 2026-08-30): *"I want to stress the need for presentational layouts (think
slide deck designs), that utilize the space better. try slicing the 3440 in various ratios, and
trying to figure out what kind of content (content as navigation) works in each region. for
navigation, we want to explore persistent navigation (the navigation stays, a different region
switches) vs switching/swapping: when you click, the whole area swaps."*

Seven cuts built, one cut. Nine pages, 24 urls.

## What this stands on, and what it does not repeat

[`/imagine/screens/`](/imagine/screens/) already found the two words a whole screen is made of
(`full` replaces, `fill` joins), that a display word must be sized by the **block** it composes
into rather than by however much screen was left over, and the three keyboard traps a deck
hits. None of that is re-argued; `deck.js` reuses the `arrows` mixin with its ⚠s intact and
`decks.css` reuses screens' `full` re-tune with its reason.

**The new question is one rung in.** Screens divided the row by *opening columns*, so every
region cost a hop. A slide shows all its regions at once — so a region here is not a column, it
is a share of one screen, and the question becomes which content kind survives which share.

## A share is a BASIS, not a grow weight — and the first version was wrong

`flex: 61.8 1 0` beside `flex: 38.2 1 0` looks like the golden section and is not. Measured at
1920: **1159 / 759 = 1.527**, where the page said 1.618.

A zero basis is a zero *border* box, so a padded region cannot go below its own padding. Both
regions floored at 56 + 56, the grow factors then divided only what was left, and the error is
2.3% — small enough to pass a screenshot and large enough to make a lab about ratios lie about
its own ratios. A **percentage** basis includes the padding, and flex shrink is proportional to
the basis, so the 1px seams cannot skew it either:

| | grow weights | percentage basis |
|---|---|---|
| 1920 | 1159 / 759 = 1.527 | **1185 / 733 = 1.618** |
| 3440 | (same error, smaller) | **2125 / 1313 = 1.618** |

This is [`/imagine/screens/uneven/`](/imagine/screens/uneven/)'s own finding — *a basis is a
share* — arriving a second time from the other direction, on regions instead of columns.

⚠ **A vertical share is not available and is not faked.** A percentage basis inside a `col`
would be a percentage of a height the flex algorithm is still deciding; regions inside a col
are equal bands, said out loud in the sheet rather than left to be discovered.

## Persistent vs swap — the head to head

Both decks show the **same four slides**, written once in `slides.js`, so nothing about the
comparison can be about the content.

**Persistent needs no mechanism at all.** The rail is the *parent column* and the slides are
its children, so the row already replaces one child at a time and keeps the ancestor open.
"The navigation stays and a different region switches" is two token overrides in a stylesheet.
**Swap** is `full` on every slide, which is screens' deck grain.

The verdict is not "one is better" — it is that **the content kind decides**, and it decides on
the same axis the content-kind map already runs on:

| the slide | persist (16em rail) | swap (whole screen) | costs |
|---|---|---|---|
| Statement, 1920 | 869 block → **113px** title | 1012 block → **132px** title | the rail costs 14% of the word |
| Statement, 3440 | 1702 block → **221px** | 1863 block → **240px** | 8% — the cost shrinks as the screen grows |
| Wall, 1920 | **6 columns** | **6 columns** | nothing |
| Wall, 3440 | **6 columns** | **6 columns** | nothing |

**So: the kinds that CAP want the rail, and the kinds that SCALE want the swap.** A wall, a
list and a caption were never going to use those 256px — the rail comes out of the gutter they
were already leaving. A statement and a stage use every pixel they are given, so every pixel
the rail keeps is one they would have spent.

**And a third answer, which is what the real deck ships.** `swap/` puts the four labels in a
**strip under the slide**, redrawn identically on every slide. It reads as persistent, it
cannot go stale (it is rebuilt each time), and it costs a 2.5em band instead of a 16em column.
The pitch deck uses exactly that: every slide is `full`, and the strip makes six swaps feel
like one deck.

Two things persist genuinely wins that no strip can buy: **you keep your place** (the rail
shows where you are in a list of everything), and **the second lines** — a rail row can carry a
description, a chip cannot.

### Measured and rejected: a 22% rail

The first `persist/` gave the rail a *share*, 22%. At 3440 that is **757px holding a 416px
list**, with 170px of nothing on each side — this lab's own map says a list does not scale, so
a rail should never be a fraction. A fixed 16em costs the stage 288px at 3440 instead of 757,
and 256 at 1920 instead of 422. `full` is still the word (the ancestors have to collapse); only
its three tokens are re-tuned.

## 2026-08-31 — Space joins arrows, and all nine pages answer both

`arrows.activated()` bound `ArrowRight`/`ArrowLeft` only; the owner's brief asked for
"arrows/space" and only half existed. Space now advances too, guarded off
`input, textarea, select, button, a, [contenteditable]` — a focused link keeps its own Space
behaviour (native click), and the browser's own page-scroll is only pre-empted on the keys we
actually act on. One change to the shared mixin, so `pitch/`, `persist/` and `swap/` all picked
it up for free.

**The six standalone cuts (`half golden aside triptych poster four`) never had arrow paging at
all** — they carry `ring: slices` for the click-through footer, but no `prev`/`next`, so the
keyboard did nothing. `neighbor(name)` reads their own position out of the existing `slices`
array (the same order the readme table and the index grid already use), so wiring one in is
`...arrows, ...neighbor("golden")` — one line, never a hand-kept url pair. Verified with real
key presses: `half` →Right→ `golden` →Space→ `aside` →Left→ `golden`, and the same chain
through `triptych` → `poster`; zero console errors.

## 2026-08-31 — the N/M numeral

Roadmapped the same day the Space fix landed, then built: `foot(items, here)` now draws a
`.decks-foot-n` label ahead of the chips — `(index + 1) + " / " + items.length`, found by
matching `here` against the same `items` array the chips already map over, so it can never
say something the strip beside it does not. `flex: 0 0 auto`, never a chip: it links
nowhere and must not take a share of the grow the ring earns by being clickable.

Verified against all three ring shapes the lab has — the six standalone cuts' `slices`
(`2 / 6` on `golden`), `pitch`'s own six-slide ring (`1 / 6` on the default slide), and
`swap`'s four-slide nested-children ring (`1 / 4`) — and that it updates on `ArrowRight`,
`Space` and `ArrowLeft` alike, reading the *active* page's own footer: inactive sibling
cuts stay mounted (the framework's column-persistence pattern), so a query for
`.decks-foot-n` with no scope finds a stale one first.

## Cut: quarters, 25 × 4

Built, shot at both widths, and deleted — the evidence is in the task dir
(`ai/2026-08-30/decks-lab/shots/cut-quarters-1920.png` beside `kept-four-1920.png`).

At 3440 four equal columns look plausible: 859px each, an 80px word in every one. **At 1920
they are 479px and the title lands at 48px** — where the 2 × 2, from *the same four cells*,
gets 67px, because it spends the height instead of the width. A cut whose whole purpose is
display type and which cannot hold display type at the most common desktop width is not a
finding, it is a banner.

It says nothing the 2 × 2 does not say better, and the progressive division of a row is already
[`/imagine/screens/divide/`](/imagine/screens/divide/)'s. Two cuts for one idea, so one goes.

## Also rejected

- **A live px readout in each region.** It would prove the ratios on screen, and it is
  developer chrome on something that is supposed to be slide-grade. The numbers are here
  instead; the pages show the design.
- **A 90 / 10 spine.** [`/imagine/screens/read/`](/imagine/screens/read/) already owns the
  rotated strip and owns it better — it is the honest inverse of a cover, not a cut.
- **Importing screens' `frames()` for the card diagrams.** It is the right shape and it would
  drag `screens.css` into every page that imports `deck.js`. The local `diagram()` also tones
  each cell by content kind, which is the information the card exists to carry.
- **Flat white regions.** Shot first and it reads as a page that failed to render. One tone
  step down for supporting regions — the labs' own verdict
  ([`findings.md`](/framework/core/Page/doc/findings/)) — makes the cut visible with no second
  device. A cut of **peers** (50/50) deliberately wears none, which is what makes it say
  something different.

## Two things that had to be fixed as consequences

- **The rail marked nothing.** `mark_links()` writes `.active` for an exact url match and
  `.in-path` only for an *ancestor*, so a rail row pointing at the slide you are on wears
  `.active` and nothing else. Keyed on `.in-path` alone, four hops lit nothing. And the slide
  you see at `/persist/` is the `default` child — it has no url of its own, so nothing matched
  there either; the **host's** `.active-page` marks the first row, and stops the moment a real
  child opens.
- **The stage lost its paper.** `.decks-rail .decks-region` is a descendant selector, and a
  child column lives inside the rail page's own `.page-column-pages` — so the rule meant for
  the rail painted the whole slide grey. `>` down to the body.

## Measured (headless, 400 / 1920 / 3440, 24 urls, 72 loads, zero console errors)

Every screen is `scrollHeight === clientHeight` at 1920 and 3440. Exactly two scroll at 400 —
`triptych` and `poster`, the three-region cuts — and that is the band regime working: a phone
genuinely has no room for three regions, so the bands keep their content and the screen
scrolls. `min-height: auto` is what restores that; without it the bands clipped their own
content into the band below, silently.

Navigation, three hops each and the deck end to end: `persist/` keeps its rail and swaps only
the stage; `swap/` replaces the screen and re-marks its strip; `pitch/` walks cover → six on
clicks and arrows mixed, `ArrowRight` on the last slide is a no-op, `ArrowLeft` and Back both
step backwards, and a cold load on `/pitch/five/` lands on slide five.
