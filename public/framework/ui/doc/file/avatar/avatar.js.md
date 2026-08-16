A sized circle (`.ui-avatar`, `--avatar` token) plus a stacked-group variant
(`.ui-avatars`) whose ring and overlap are the two declarations a template
genuinely couldn't carry.

## The ring, and why it's CSS and not markup

`border: 2px solid var(--surface)` plus a negative `margin-inline-start` on
every avatar after the first — the ring reads as a hole onto whatever the
stack sits on because it's the **surface** color, and it retints with the
theme automatically. Before this file existed, both were inline declarations
applied per-circle with an `i ? … : 0` on the margin; the `+` selector says it
once and can't disagree with itself.

## Improvements

Nothing ranked: 31 lines, and the fill color (`var(--ink)`/`var(--surface)`,
inverted from a hardcoded `white`) is already the pair the theme guarantees
contrast between in both modes.
