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
Full reasoning: [docking](/framework/dev/DevBar/doc/docking/).

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

`.dev-layout`, `.dev-layout-acts`, `.dev-stats` and `.dev-findings` are gaps;
`.dev-issue` is a rule and a gap; `.dev-target` sizes the halves of the target
line; `.dev-val.bad` adds the one status colour the rail was missing (`--error`,
beside the existing `ok`/`warn`/`off`). The ring on a finding is not here at all
— that class (`.dt-aim`) belongs to `ext/DesignTool/highlight.js` and ships with
it. See [measuring](/framework/dev/DevBar/doc/measuring/).

Three rules carry real decisions:

- `.dev-layout-out > * { flex: 1 1 20em; min-width: 0 }` — one column in a 17rem
  rail, two in one dragged wide, no breakpoint.
- `.dev-issue.dt-aimed .dev-more { display: flex }` — **the selected finding is
  the expanded one**, and the class is ext/DesignTool's, set by the same click
  that holds the ring. ⚠ `display` is written here rather than as a `flex`
  utility class in the JS: the utilities live in `@layer util`, which beats every
  rule in this file, so `display: none` written against one would never take.
- `.dev-suspect` — a dotted `--warn` underline on a reading that is knowingly
  uncalibrated (`measure`, `contrast`), so it cannot read as a peer of the
  measured numbers beside it.

## ⚠ Below 34em the rail is a bottom sheet

```css
.dev-bar { inset: auto 0 0 0; width: auto; height: 45dvh; transform: translateY(100%); }
```

A side rail there does not squeeze the page, it **covers** it: 17rem is 70% of a
390px window, and `.app` declines to push at that width (the `--rail-floor` guard
in `settings.js`), so the tool sat on top of 70% of what it was measuring and
every ring it drew landed underneath itself. `html.dev-open { --devbar: 0px }`
goes with it — a preset click clears `--rail-floor` for the rest of the session,
so without that line the page would be squeezed by a rail no longer beside it.
`grip.css` hides the resize strip at the same threshold, and `highlight.js`
scrolls a held target to `start` rather than `center`.

## The tab strip is a pinned flex row of three equal buttons

`.dev-tabs` sits between the head and the body, both `flex: 0 0 auto`, so what
scrolls is only the tab's own content. `.dev-tab` is `flex: 1 1 0` with
`min-width: 0` — three tabs divide the rail rather than wrapping, and they hold
at 80px each in a 200px rail (the `MIN`). `.on` is the same
`--prim` border the size presets use, so "the tab you are on" and "the width you
are at" read as one idiom.

## Improvements

1. **`.dev-bar .chat-list { max-height: 14em; }`, `.chat-form` and
   `.dev-issue.dt-aimed` reach into `ext/Ask`'s and `ext/DesignTool`'s own class
   names from outside those modules.** Correct today, and commented as deliberate
   ("the rail is a column, not a page"), but it means a rename there silently
   breaks this file with no compiler to catch it. *(medium, useful — the general
   risk of any cross-module class override.)* ⚠ `.dev-bar .dt-report` is gone
   with the full report, which is one fewer of these.
