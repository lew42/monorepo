# Wireframes — decisions and record

*Written 2026-08-18, the Figma pilot. Conclusive, not current guidance.*

The tier already had 28 layouts, six of which cover a Figma frame on this list. So the
question this directory answers is **not** "build eight more layouts" — it is the owner's
actual one: *can our class strings produce these outcomes?* The output is eight strings and
one honest no.

## Why one directory and not eight

Six of the eight already exist here as better, content-bearing pages: `Holy Grail` is
[`shell`](/framework/styles/layouts/shell/) (which this tier **already deleted a
`holy-grail` in favour of** — see `../doc/decisions.md`), `Dashboard` is
[`dashboard`](/framework/styles/layouts/dashboard/), `Left/Right Sidebar` are
[`sidebar`](/framework/styles/layouts/sidebar/) and [`docs`](/framework/styles/layouts/docs/),
`Hero + Grid` is [`hero`](/framework/styles/layouts/hero/) plus
[`landing`](/framework/styles/layouts/landing/), `Header + 3 Col + Footer` is
[`document`](/framework/styles/layouts/document/) with a wider middle.

Eight new sibling directories would have re-run exactly the merge this tier already did once.
**Verdict: one `Reference` card, eight inline children** — the shape `400/` already uses, for
the same reason: these teach a *string*, not a screen. Nothing was renamed, nothing moved, and
the whole footprint is one new directory plus one word in `BANDS`.

## `.tint` is a token and not a class, and typing it throws nothing

The first build used three tones — `wash`, `tint`, bare — to match the Figma's three greys
(`#e5e5e5` / `#f4f4f4` / `#fff`). `framework.css` defines `--tint` as a token (used by `th`
and `.checkered`) and defines **`.surface` and `.wash` as the only two surface classes.**
`div.c("… tint")` therefore painted nothing, threw nothing, and rendered a page of invisible
boxes that looked plausibly like a wireframe until the computed styles were read:
`backgroundColor: rgba(0, 0, 0, 0)` on every one of them, and no `.tint` rule in any
stylesheet on the document.

**Verdict: two tones, `wash` and bare.** Two is enough for the alternation to read, and the
missing third is a finding rather than something to work around — it is in `questions.md` for
the owner, since a `.tint` class is a `framework.css` edit and this task does not own that
file.

## A ground, on the layout root

With two tones and no ground, `wash` sat on the app's own grey and the alternation was
invisible at `/full/`. `demo.layout`'s `frame()` already declares
`background: var(--surface)` for the *card* — "a simulated SCREEN has a ground, a browser
paints one behind every page". The `/full/` url is the other half of that same statement, so
each `layout()` sets it on its own root. Inline, because it is per-layout state on a page
whose module forbids a stylesheet.

## `align-content: start`, but only where the lines are uneven

`../doc/decisions.md` records this trap twice — a wrapping row hands its slack to its LINES,
so at 400 a short rail on its own line stretches to half the viewport. The correction is
`align-content: start`, and the tempting move is to put it on every wrapping row here.

**It is wrong on peers.** `bento`'s two stacks and `columns`' three columns are siblings of
similar height; `start` makes them hug and the page loses the full-height look the Figma has,
for no benefit. So `ragged` (`start`) is on `left`, `right` and `grail` — rail beside wall —
and deliberately absent from `bento`, `board` and `columns`.

**The rule: `start` when the wrapped lines are uneven, the default when they are peers.**
There is no class for "stretch one line, hug many", which is the second thing the vocabulary
cannot say. Unlike the bento seam it has not cost anything yet, so it is recorded rather than
proposed.

## `entry` is imported from `400/`, not copied

`400/entry.js` turns one spec into a twin card wired for a bare `/full/` url. It is eight
lines and entirely generic, and this is its **second caller** — which is precisely the bar
this tier states for promoting a helper (`../doc/decisions.md` on `masonry.js`: *"`util/`'s
own bar is two callers that must agree"*).

**Not promoted, deliberately.** Moving `400/entry.js` up to `layouts/entry.js` is a rename
with a live caller in a directory this task does not own, and CLAUDE.md says ask first. It is
imported across the seam for now and the promotion is a question for the owner.

## Two spacing values, and one of them is the default

The owner's test: *a `div.card.pad` with an `h2` should look the same in any one of these.*
It does, because **`--pad` is never set** — every box is a plain `.pad` at its `1em` default —
and the only other value in `specs.js` is `--gap: 0.4em` between a label and its line, declared
once in `region()`.

Every remaining number in the file is a `--column`: `20em` (bands), `24em` (left/right walls),
`18em` (hero), `16em` (columns), `15em` (board), `14em`/`11em` (`--basis` on rails). Those are
**wrap thresholds** — the layout decision itself — and collapsing them to one value would
collapse the eight layouts into one. Spacing converged; thresholds did not, and should not.

## The Figma's own numbers, and what happened to them

`get_design_context` returned Montserrat ExtraBold 32px / Medium 20px, `#e5e5e5` / `#f4f4f4` /
`#f0f0f0` / `#fff`, and `p-[50px]` on every frame. **All of it was discarded** under the
standing reuse rule: a region label is `h3` (the existing 1em/700 rung), its line is
`p.muted`, and the greys are `wash` and bare. The one number worth keeping was the observation
behind it — the Figma uses a **single** padding value, 50px, on all 60-odd frames, which is
the same claim `--pad` makes.
