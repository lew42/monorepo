## What this file is

The first of the five rule chapters: **constrain the container, never the
items.** The worked example (a `max-width` on every leaf vs. a token on the
container) is the same argument `css-strategy`'s skill file compresses into
one line — this page is the long form a human can push back on.

## The trap it names

`.page.full` zeroing both `--measure` and `--page-pad` at once, and a page
title rendering outside anything `content()` builds — so padding added to an
inner wrapper misses the `h1` entirely. This is the same trap
`layouts/fit/page.js` and the `robust.md` chapter both restate from their own
angle; three independent tellings of one bug is a sign it was expensive to
learn.

## Improvements

1. **Nothing ranked.** The prose, the CSS-strategy skill, and the live
   `DesignTool` `gutter` rule all agree, which is the thing §6d of the root
   `doc/audits.md` says is checkable and worth automating — not this file's
   job to build, but worth knowing it's covered elsewhere.
