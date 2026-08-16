The box: the bar, the two panes (code and HTML), the caption strip, the `stack`
and `quoted` opt-outs. Everything about the *stage* inside a `demo()` box lives
in `stage.css` instead — this file only styles the chrome around it.

## No margin, on purpose

`.demo` used to carry `margin: 1.75em 0`, which at specificity (0,1,0)
out-ranked `Page.css`'s flow spacing and gave every demo a rhythm nothing else
on the page had. Deleted rather than matched, because the flow already spaces a
block in a flow — see `core/Page/readme.md`'s "Rhythm" section for the doctrine
this follows.

## `quoted` beats `wide` on specificity, not load order

`.page.standard > .demo.quoted` is written four selector-classes deep so it
out-ranks `.page.standard > .wide` (three deep) regardless of which stylesheet
the browser happens to link last. A tie decided by load order is a tie decided
by accident.

## The caption's padding only resolves inside `.demo`

`.demo-note` reads `padding: var(--demo-pad)`, and only `.demo` declares that
custom property. Used standalone (as `demo.exhibit()`'s caption is), the padding
resolves to nothing and the note is unstyled by design — that's `.demo >
.demo-note`'s job, scoped so a caption outside a box never accidentally inherits
box chrome it isn't wearing.

## Improvements

1. **`.demo-copy`'s `inline-flex` ordering trap is a real footgun for the next
   person who reorders rules in this file.** The comment above it says the rule
   must come *after* `.demo-btn` or a flex button inside a `<summary>` drops its
   label — worth a lint or at least keeping the two rules adjacent rather than
   trusting the comment alone. *(simple, useful.)*
2. **`.checkered`'s history note (born here, promoted to `framework.css`) is the
   only piece of "used to be" commentary in the file** — everything else states
   the current rule. Consistent with "comments near zero," but this one line
   could move to the readme's design record instead of living in the
   stylesheet. *(simple, speculative.)*
