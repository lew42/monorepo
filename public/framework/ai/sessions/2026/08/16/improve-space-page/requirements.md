# Improve `/framework/styles/layouts/space/`

## The ask, verbatim (Mike, 2026-08-16)

> the framework/styles/layouts/space/ page needs a better layout.
>
> the 5 layouts aren't all visible at once, and they should be, make them fit in
> a single row, so we can see all 5 on screen at once. move the controls above
>
> make a note about the layout text syntax
>
> can you make a control for complexity? or level of detail? can you make a doc
> tab that shows a full list of possible layout words, and what they look like?
>
> maybe add any important/useful layouts that are missing?

## Reading the ask

Six things, and one of them is the reason for the other five: **the ruler is the
instrument and it is currently a sidebar.** `.space` is a wrapping row with the
text panel at `flex: 1 1 22em` and the shots at `flex: 1 1 26em`, so at any real
width the five screens stack two-up in a column ~26em wide and you scroll a
`max-height: 82vh` box to see the curve. The curve is the whole point.

1. **One row, five shots, all visible.** Controls (stepper, textarea, presets)
   move **above** the ruler; the ruler goes full-bleed underneath as a
   non-wrapping row.
2. **A note about the syntax** — `notes:` on the Doc, so it earns a Docs tab and
   a url.
3. **A complexity / level-of-detail control** on the generator.
4. **A Words tab** — every layout word the format accepts, each one live.
5. **Presets** — four today (`docs mail landing wall`); the rail has twelve
   worked layouts and several of the important shapes are unreachable.

## Scope

Owned by this task:

```
public/framework/styles/layouts/space/page.js
public/framework/styles/layouts/space/ruler.js
public/framework/styles/layouts/space/gen.js
public/framework/styles/layouts/space/spec.js
public/framework/styles/layouts/space/space.css
public/framework/styles/layouts/space/presets.js      (new)
public/framework/styles/layouts/space/words/page.js   (new)
public/framework/styles/layouts/space/doc/syntax.md   (new)
public/framework/styles/layouts/space/readme.md
```

Not touched: `framework.css`, `web.js`, `ext/demo`, any sibling layout
directory. If the work wants a new utility class, that is a proposal in the
readme, not a commit (RULE#6, and `space/readme.md`'s own standing decision
about `scroll`/`stick`/`fluid`).

## Proposal — the steps

1. Scope: read the page, the ruler, the generator, the word vocabulary.
2. Rebuild the lab — controls above, ruler as one non-wrapping row of five.
3. Complexity control: `gen(seed, level)`, wired to a slider.
4. Presets: add the important shapes that are missing.
5. Words tab: every layout word, live, at `space/words/`.
6. Syntax note: `doc/syntax.md`, `notes:` on the Doc.
7. Verify headless at 1280 / 1920 / 3440; update `readme.md`.
