# Home — decisions and record

Built 2026-08-18 from Figma `23-181` (desktop) and `23-1144` (mobile), file
`0rZv3Z6Hnqkxa2UQJ5xOOG`. Conclusive, not current guidance — the guidance is
[`../readme.md`](../readme.md).

## Built as ten pieces, then assembled

Eleven bands were surveyed; ten shipped. Each was written and measured on its own before the
page existed, which is why the class strings converged — the third band that wanted a
two-track row reused the first one's string instead of inventing a second.

`Navigation-Header · Hero · Trust-Logos · Services · Philosophy · Portfolio · Highlight ·
Testimonials · Contact · Footer`

## The eleventh band was not built, deliberately

The desktop file has a **second `Services-Section`** (`32:1277`) — the same three cards, with
the header on the left and the cards stacked in a column on the right. The mobile file has only
one. Two readings, and the mobile file settles it: it is an **alternate**, not a second band.
Building it would put the same three cards on the page twice, which is the one thing the
`layout` skill's fourth question forbids.

**And it is one word.** The shipped Services band is a header over `grid auto gap`; the
alternate is the header and the wall as the two tracks of a `flex auto gap` row, with the wall
switched to `--column: 100%`. Demonstrating the string beats adding a duplicate band — the same
call the pilot made about the six wireframes that were already layouts.
[questions.md](/framework/ai/2026-08-18/figma/questions.md) #8 asks whether the owner wants it
as a toggleable `parts:` chip instead.

## Home is `styles/layouts/`, not `styles/sections/`

`sections/` is fifteen tone-switchable marketing bands that compose into a page, and it was the
real alternative. **`layouts/` won on the instrument.** The question this task exists to answer
is a *viewport* question, and `demo.layout({ twin: true })` puts a live 390 beside a live 3440
on one stage — the only surface on the site that shows both drawings at once. `sections/` has
no twin and no `/full/` url.

`sections/tone.js` is still reused: `band("dark")` is where the two dark bands get their
colours, so nothing here names one.

## Text is the Figma's, verbatim

Standing rule 8 encourages rewriting copy to say something true about the framework, and
`../web.js`'s Aurora prose is exactly that. **This page declines it.** It is the owner's own
homepage, and the question it answers is *does my design survive your vocabulary* — swapping
the words answers a different question and makes the comparison with the comp unreadable.
Rewritten copy belongs on the generic mockups (`181-1456`), where the owner asked for it.

## Two values for padding, three for gap

The whole spacing budget, per standing rule 2:

| | |
|---|---|
| band | `clamp(2.5em, 5vw, 5em) clamp(1em, 4vw, 3em)` — the only clamp on the page |
| card | `--pad: 2em` (a pill is `0.3em 0.7em`, which is a pill, not padding) |
| gap | `0.4em` inside a label · `1em` inside a card · `2em`–`3em` between bands and tracks |
| column | `16em` portfolio · `18em` the `--grow` header · `22em` the two walls · `24em` every two-track row |

**A `--column` is a wrap threshold, not spacing** — the pilot's phrasing, and it is why four
different values here are not four different opinions about rhythm.

⚠ All four of these tokens **inherit**. `--pad: 2em` on a card reaches every `.pad` inside it,
so each nested pill re-declares its own; `--grow` on a track would reach a nested `.flex.auto`.
Set them on the box that uses them, never on an ancestor for convenience.

## `/full/` is wired here, and that makes three callers

`demo.layout()` does not wire a `/full/` url; `400/entry.js` and `wire/` each add
`route(name){ return name === "full" && full(this, …) }`. This is the **third** copy of that
line, which is this tier's own stated bar for promoting a helper — see
[questions.md](/framework/ai/2026-08-18/figma/questions.md) #3, still open.

It is not optional here: the card is `zoom-25` and the stage simulates its widths, and **media
queries do not follow `zoom`**. A claim about viewport behaviour has to be read in a viewport.

## REVERSED — the footer is not pinned, and `fill` is gone (same night)

This first shipped as `page full fill flex v` with the footer outside a `flex-1` scroller —
`landing/`'s shape, kept because the whole tier shares it and it is what makes the `56em` card
show a footer on the bottom edge. The entry here said it was *"worth revisiting only if this
page ever stops being a specimen."*

**It never was one.** At 1440 the middle region got 284px and held 4549px — seven of ten bands
in the DOM and unreachable, with no horizontal symptom and nothing thrown. `fill` is a claim
that a layout fits one screen; this one is a document. Now `page full flex v`, no inner
scroller, document scroll — verified at 400 / 1280 / 1440 / 1920 / 3440.

The cost is the card, which now shows the masthead instead of a pinned footer. Weighed: the
alternative re-creates the porthole in miniature (at 56em the middle would be ~440px holding
4500px). Full record, including the rule for the rest of the tier and the check that catches
it: [transition.md](./transition.md) §4.

## Placeholders left in, on purpose

- **Pictures** — five `.wash`-equivalent boxes with an `image` glyph. Standing rule 6.
- **Social marks** — Material Icons ships no brand logos, so four generic glyphs stand in.
  A real site drops `img.c("icon")` into the same row and nothing else changes.
