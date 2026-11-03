## What this file is

Every class the module draws, in one `@layer theme` block: the box, the hovering
bar, its buttons/select/range/knob, the hot/selected outlines, and the push
drawer. No palette colours anywhere — every colour is a `framework.css` token, so
the whole thing retunes for free in dark mode. Twenty-two rules for eight files'
worth of JS is proportionate; nothing here looks over-built.

## The bar hides by default, and the two things that make it not

`.layout > .layout-bar` starts at `opacity: 0`, `bottom: 100%` (not `top: 0` —
the comment explains why: over the corner it would cover any box shorter than
the bar itself, which is most of them). Three things bring it to `opacity: 1`:
`:hover`/`:focus-within` on either the box or the bar, and a `(hover: none)`
media query that forces it visible outright — a touch screen has no hover to
reveal it with, so hiding it there would hide it permanently.

## The drawer's two `⚠`-marked declarations

`inset-inline-end: var(--devbar, 0px)` — docks beside the dev rail, not under
it, because both rails reserve space at the same edge and `.app` already sums
the two. `width: min(var(--drawer, 19rem), 100%)` is the self-limiting clamp
described in [The drawer](/framework/ext/layout/doc/drawer/) — `100%` here, not
the more precise `100% - 24em` that `framework.css`'s own reservation uses,
because the panel only needs to never overflow its own edge, not to preserve a
reading column on the page behind it.

## Scoped selectors carry real meaning here

`.layout-panel .layout-knob` overrides the bar's shrink-to-fit `.layout-knob`
with a three-column grid — the same class means two different layouts depending
on which ancestor it is under, which is unusual for this codebase's
utility-first style and is called out explicitly in the CSS comment rather than
left implicit.

## Improvements

1. **The layer-order comment at the top (`@layer base, theme, site, util;`) is
   correct today**, matching the constraint in the root `CLAUDE.md` — flagged
   here only as the one line in this file where a silent drop (`site` past
   `util`) would be invisible until something in `site` or `util` failed to
   override a rule here. No action needed unless the list is ever shortened.
   *(simple, speculative)*
2. **`.layout-panel`'s `z-index: 40` is a bare magic number**, explained only in
   a comment naming its neighbours (`.demo.max` at 30, the mode button at 60).
   A shared `--z-drawer` custom property (or a short table in `framework.css`
   naming every z-index in the site by name) would make the *next* new
   fixed-position layer's number a lookup instead of an archaeology exercise
   across three files. Cross-module, so noted rather than owned here. *(medium,
   useful)*
3. **`@media (hover: none)` appears twice** — once for the bar, once for the
   region outlines — with no shared name tying the two together as "the
   touch-device story for this widget." A code comment cross-referencing the
   two blocks (there is already one on each independently) would be enough;
   consolidating them is not worth the indirection at this file's size. *(simple,
   speculative)*
