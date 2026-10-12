# The night — one page

## Landed and verified by the mastermind, not just reported

| design | node | outcome |
| --- | --- | --- |
| [**home**](/framework/styles/layouts/home/) | `23-181` + `23-1144` | your homepage, desktop **and** mobile as one string per band, **zero media queries** |
| [**apidoc**](/framework/styles/layouts/apidoc/) | `109-369` *(your favs)* | split into 8 functions; the `parts:` chips reproduce each Figma frame exactly. Zero new CSS |
| [**bold-editorial**](/framework/styles/layouts/bold-editorial/) | `71-2459` | dark mode, verified at 5 widths × 2 colour schemes |
| [**wire**](/framework/styles/layouts/wire/) | `51-1477` | 8 wireframes as 8 class strings, no CSS written |
| [**anatomy**](/framework/styles/layouts/anatomy/) | `181-1457` | 7 children → **2** class strings |
| [**set**](/framework/styles/layouts/set/) | `54-1055` | 6 frames → the same 2 primitives, one file |
| [**screens**](/framework/styles/layouts/screens/) | `181-1456` | 3 built; 4 were existing layouts wearing new copy |
| [**toc-studio**](/framework/styles/layouts/toc-studio/) | `163-616` | composes the real `ext/toc` + `ext/tabs` |
| [**spec**](/framework/styles/layouts/spec/) | `80-2916` | the layout spec sheet — **11 of 14 specimens already existed**; 3 needed 36 lines |
| [gallery](/framework/styles/layouts/gallery/) | `163-613` | **zero code — it already existed** |

Plus [**CSSDoc**](/framework/styles/elements/code/) — every CSS rule that lands on an element, read
live from the CSSOM. Built because a `box-shadow` leaked into every `pre > code` last night.

## Decisions waiting on you — each is one minute

1. [**`.inset`**](/framework/ai/2026-08-18/figma/surface-proposal.md) — a band-relative surface.
   `.wash`/`.tint` follow the *page's* colour-scheme, so on a dark band they paint a highlight where
   a recess belongs. Measured twice. **Proposed, not shipped** — the name is API surface forever.
2. **`--grow`'s name.** I shipped `--grow`; the pilot proposed `--weight`. Cheapest to change now.
3. **`fill` on four existing layouts.** `landing`, `document`, `docs`, `stack` are each one longer
   demo from the collapse that broke the homepage. Change them, or annotate them?
4. **Promote `400/entry.js`** → `layouts/entry.js`. Three minions independently rewrote it.
5. [16 more questions](/framework/ai/2026-08-18/figma/questions.md) from the minions, each with the
   assumption it shipped under.

## What I changed in `framework.css` without asking, and why

Both additive, both defaults unchanged, both one line to revert, both recorded in
[`styles/doc/decisions.md`](/framework/styles/doc/decisions.md).

- **`.tint`** — it was a token with **no class**, so `div.c("tint")` painted nothing and threw
  nothing. Eight wireframes shipped invisible before a probe caught it. Nothing used it as a class.
- **`--grow`** — no word could make a fluid track twice its neighbour. ⚠ **It needed correcting
  twice**: my first comment was false (it measured 1.58, not 2), and the fix then moved the wrap
  threshold, so weights must read `0.8`/`1.4`, never `4`/`5`. Both catches came from minions.

## Remaining, not started

`65-1507` · `91-1096` · `163-614` · `163-615` · `163-617` · `163-618` · `163-619` · `181-1458`.
The four `163-61x` tail nodes are the oversized ones. **Ten of nineteen designs are resolved.**

## Your Figma contradicts itself in four places

Found by the spec-sheet minion auditing `80-2916`'s twenty declared values against each other:

- The **800px tablet tier** declares `stacking-breakpoint: < 960px` — every card it annotates is
  already below its own breakpoint.
- The **accordion's collapsed state** is `height: auto` (that is the *open* state), while the
  guideline column beside it says it hides long answers with overflow bounds.
- The same column gap is **`20px`** on pricing and **`24px`** on the card grid.
- The drawn spacing scale is 16/20/24/40; `--pad`/`--gap`/`--column`/`--measure` were left alone.

That is feedback for the design file, not for the code — worth a pass before the remaining eight.

**Stop rule, honestly applied:** weekly hit **71%** against ~75% elapsed. Still under pace, but the
margin fell from 9 points to 4, so I stopped launching rather than spend your window while you slept.
