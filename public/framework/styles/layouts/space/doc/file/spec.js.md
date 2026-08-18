## What this file is

Text → live view. A layout as a small indentation-based language: a line is
`<class tokens> > <part> [count]`, either half may be empty, and a token
holding a `:` is a declaration rather than a class (`_` reads as a space).
`render(text)` returns the real DOM the sixteen hand-written layout pages
would otherwise be typing by hand.

## Four words that fail silently, expanded here on purpose

`scroll`, `stick`, `fluid` and `tone` are declaration sets (`WORDS`), not
utilities in `framework.css` — the comment states why: they are this
format's vocabulary until promoting any of them to a real utility class is
made, which is explicitly the owner's call and not this file's. `fluid` is the
trap among the first three: `.flex-1` is `flex: 1 1 0%`, which shrinks to
nothing in a *wrapping* row instead of pushing siblings to a new line —
measured at 390px, where the naive substitution rendered an article one
letter wide.

## `tone` is a token reference now, not an invented hue

Until 2026-08-16 it was `oklch(0.72 0.15 var(--tone, 250) / 0.12)` — a random
hue every roll, so a retheme moved none of them. `WORDS.tone` now mixes
whatever `--tone` custom property is inherited (`model.js`'s `TONES`:
`--ink`, `--subtle`, `--prim`) at 9% with `color-mix(in oklab, …)`. The
translucency still does its original job — two boxes deep composites
visibly darker than one, so a random nesting reads at a glance — but every
colour on the page is now one the theme already owns, and it needs no
light/dark branch because the tokens it mixes are already `light-dark()`.

⚠ It still cannot be `wash`/`tint`/`surface` — that three-step ladder is
opaque by decision (`layers/theme/lew42/lew42.css`), so nesting it cannot
composite and ten levels look like one.

## Improvements

1. **`fluid`, `scroll`, `stick` and now `tone` are real proposals for
   `framework.css` utilities**, already argued for by this file and by
   `readme.md`, and already gated on a decision this audit has no standing
   to make. Restating here so the recommendation surfaces in one more place.
   *(medium, useful — inherited from the module's own record)*
