# Haiku builds: what it got right and wrong (kept per section)

Method: I read the section with `get_design_context` (exact tokens), write a minimal spec (`palette/spec-N-*.md`), a Haiku 5.5 minion under 60k tokens builds it from the spec and the `colors/` demo as the pattern, I screenshot at 1920 and fix.

## 1 · The Approved Schemes ([/framework/ext/Figma/palette/](/framework/ext/Figma/palette/)), 52k tokens, about 2 minutes

**Right:** all text, colours and alpha overlays came out exactly as written; one data-driven array plus one render loop (as asked); `pal-` prefix, `@layer theme`, CSS in its own file.

**Wrong, and why:**
- It passed `{style: ...}` as an argument to `p.c(...)`/`div.c(...)`; the factory took the object as text and printed `color: rgba(...)` on the page. Fix: `.style("color", c)` chained. The spec showed no factory signature, so this is a spec gap; next specs name `.style(prop, value)`.
- The card stayed 640 px wide: `.page` is a grid whose main track is `--measure`; a wide section needs `grid-column: 1 / -1` (`width: "full"` alone did not do it). Haiku could not know; now in the colour/palette notes.
- Columns stretched to the tallest, so the Prime column's bottom looked bright. Figma aligns to start: `align-items: start`.
- Inset label colour was dropped (my spec gave it only for the first inset). Spec gap again.
- Padding "24/20 x 28" was ambiguous; it used 20 everywhere. My wording.

**Verdict:** with exact tokens in the spec Haiku builds the static look reliably; the misses are framework quirks (factory signature, grid tracks) that a spec must name. Cost is small enough to spend one spec round per section.
