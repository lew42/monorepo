## What this file is

The design record for this directory: why the rules live in the site rather
than only in the `css-strategy` skill ("skill = what to do, page = why, and
proof"), the enforcement seam that pairs each rule with a named
`ext/LayoutTool` check, and one open decision for Mike.

## The one decision waiting

`.measure` centres by default (`margin-inline: auto`); `Page.css`'s own rule
is "no auto margins, one left edge." Three layouts built from the Figma spec
hit the collision and worked around it with an inline `max-width`. Shipped as
additive (`.measure.start`), with the harder question — which way the
*default* should point — left open and named as Mike's call, not a default
this audit should override.

## Improvements

1. **The waiting decision is now over three months old** (recorded
   2026-08-something, this audit dated 2026-08-15) and the workaround
   (`.measure.start`) has presumably accreted more call sites since. Worth a
   ping rather than a re-litigation. *(simple, useful)*
