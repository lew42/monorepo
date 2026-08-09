# What surprised me in `framework.css`

Recorded, not fixed — a doc page is not a licence to change the thing being documented.
Each is a candidate for the eviction list in `styles/readme.md` or for a one-line
addition.

**The two form `:not()` lists deliberately differ, and it isn't obvious.** `@layer base`
excludes `submit`, `button` and `reset` from `width: 100%`; `@layer theme` does *not*
exclude them from `padding` and `border`. So a submit input is full-width-exempt but
border-and-padding-included. The comment beside the theme rule (*"adding a border affects
input[type=submit] height and bg + hover, for some reason"*) says someone already hit
this. Correct as written, and worth documenting rather than tidying.

**Types in neither list get the text treatment.** `range`, `file` and `date` take
`width: 100%`, `padding: 0.25em 0.6em` and `border: 1px solid var(--subtle)`. A 1px
border around a slider is very unlikely to be intended. **Eviction candidate:** add
`[type="range"]` to the theme rule's `:not()`.

**`audio` and `iframe` have factories and are missing from the reset's replaced list.**
`img, picture, video, canvas, svg { display: block; max-width: 100% }` misses both, so
both keep the inline baseline gap that rule exists to remove, and an `iframe` can
overflow its column. **Two-word fix**, deliberately not applied: nothing on this site
embeds either, and an unexercised rule is a guess.

**`kbd` and `samp` are missing from `pre, code, .code { font-family: var(--mono) }`.**
They fall back to the browser's generic `monospace`, so they render at a different
apparent size from a `code` in the same sentence. Open, because *"looks like code"* and
*"is code"* are not the same claim — `samp` is program output, and a theme might
reasonably want it plainer.

**Nothing gives a `table` a scroller.** `pre` got `overflow-x: auto` in the reset;
`table` didn't, so a wide table overflows the page. **Not fixable in the base** — the fix
is a wrapper element, and a stylesheet cannot wrap. Documented at the call site instead.

**`dl` has no factory and no reset.** `dd` keeps the UA's `margin-left: 40px`, the exact
bug `ul, ol { padding-left: 1.2em }` exists to fix. Left as found: a definition list is
nearly always a two-column table or a grid in disguise, and adding a factory plus a rule
for an element the site never uses buys API surface and no readers.

**`figure` keeps `margin: 1em 40px`.** The flow rules zero `margin-block` only, so the
*inline* 40px survives and every `figure` sits indented. Visible in the media demo.
Arguably a reset gap; left alone because a figure genuinely is a set-apart block and the
base cannot know how far apart.

**`a` has no *unscoped* rule** — `a * { cursor: pointer }`, plus a prose-scoped
`:where(p, li, td, th, dd, blockquote, .md) a` carrying the underline. A link outside
prose gets its look from a component class (`.page-link`, `.tab`, `.nav-link`,
`.sidebar-link`). Worth stating loudly in both halves, because "the framework styles
links" is the natural assumption and it is only true inside a sentence. (This used to say
"no rule at all", which read as a stronger claim than the code ever made.)

**`hr` has no margin**, and `theme/page.js`'s rule table claims `hr { margin: 3em 0 }`.
The file says `border: none; border-top: 1px solid var(--line)` and nothing else —
spacing comes from the `--flow` rules. **The theme page is stale, not the element page.**

**`:focus-visible`'s `outline-width: 2px` genuinely does nothing**, and the file has a
comment wondering why. Answer: no `outline-style` is set, so the UA's `outline-style:
auto` draws the ring, and `auto` ignores `outline-width` by design. That is also why the
commented-out `outline: 2px solid var(--prim)` above it *"messes with the border
radius"* — a `solid` outline doesn't follow `border-radius`; an `auto` one does. Losing
`outline-width` is the price of rounded rings, which is the right trade and now has a
reason written next to it.

## Rejected while writing these pages

A `compare(without, with_)` helper like `base/page.js` has. It earns its place there,
where the whole subject is *what one reset declaration buys*. Here the subject is the
element, and reverting a declaration inline would double every demo for no gain.
