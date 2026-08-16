The rail's look: the fixed panel, its header, every section's typography, the
size/status rows, the thread pills, the layout readout's rows and findings, and
the one x-ray outline rule. Almost no layout logic lives here — the tokens are
declared once at the top (`--dev-rail` on `:root`, `--devbar` the shell
reservation reads) and the only geometry is the hide transform below.

## Hiding slides by `100%` — and that is only safe because the grip is inside

```css
transform: translateX(100%);
```

A percentage translate measures the element's own box, so `100%` clears the
rail and *whatever lives inside it* — the grip included, since 2026-08-16.
Anything hanging outside that box survives the slide: the grip used to be
centred on this edge, and half of it stayed on screen as an invisible
`ew-resize` strip down every page's right edge that pointer-captured whole
gestures. The stopgap was `translateX(calc(100% + var(--dev-grip)))`; the
`--dev-grip` token existed for that term alone and went with it when the grip
moved inside. History and measurements: `grip.css`, beside this in the Files
tab.

## It names no colour

`color-scheme: dark` on `.dev-bar` is the entire dark theme: every token in
`framework.css` is a `light-dark()` pair resolved against the element using
it, so one declaration retunes ink, surface, line, wash and subtle together.
Full reasoning: [docking](/framework/dev/DevBar/docs/docking/).

## The layer statement, restated in full

```css
@layer base, theme, site, util;
```

Per `CLAUDE.md`: the first `@layer` statement anywhere fixes the order for
the whole page, and a short list here would silently push `site` past
`util` for every other stylesheet that loads after this one. Every rule below
is inside `@layer theme`.

## Two things sized in `rem`, not `em`, on purpose

`.dev-size .icon` and comments elsewhere in this file call out `rem` over
`em` — the rail's own text is `0.8rem`, so an icon or pill sized in `em`
would inherit that shrink and measure smaller than intended. A grab target or
an icon should not scale with the type beside it.

## The layout readout is a handful of short rules

`.dev-layout`, `.dev-layout-out` and `.dev-layout-acts` are gaps; `.dev-issue`
is a rule and a gap; `.dev-target` sizes the two halves of the target line;
`.dev-val.bad` adds the one status colour the rail was missing (`--error`,
beside the existing `ok`/`warn`/`off`). The readout is otherwise built entirely
from `row()` and `.dev-val`, which is why a whole LayoutTool section cost almost
no CSS. The hover ring on a finding is not here at all — that class
(`.lt-aim`) belongs to `ext/LayoutTool/highlight.js` and ships with it. See
[measuring](/framework/dev/DevBar/docs/measuring/).

## The tab strip is a pinned flex row of three equal buttons

`.dev-tabs` sits between the head and the body, both `flex: 0 0 auto`, so what
scrolls is only the tab's own content. `.dev-tab` is `flex: 1 1 0` with
`min-width: 0` — three tabs divide the rail rather than wrapping, and they hold
at 80px each in a 200px rail (the `MIN`). `.on` is the same
`--prim` border the size presets use, so "the tab you are on" and "the width you
are at" read as one idiom.

## Improvements

1. **`.dev-bar .chat-list { max-height: 14em; }`, `.chat-form` and
   `.dev-bar .lt-report` reach into `ext/Ask`'s and `ext/LayoutTool`'s own
   class names from outside those modules.** Correct today, and commented as
   deliberate ("the rail is a column, not a page"), but it means a rename
   there silently breaks this file with no compiler to catch it. *(medium,
   useful — the general risk of any cross-module class override.)*
