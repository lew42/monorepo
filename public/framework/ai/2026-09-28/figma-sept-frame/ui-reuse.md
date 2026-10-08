# Review finding 2 — why card 6 hand-builds its controls

Checked `ui/badge`, `ui/progress`, `ui/tags` against the Figma "UI Controls" section (`sections/6-ui-controls.png`, its metadata.xml frame):

- **ui/badge** — its pill has fixed padding/radius tokens (not `em`), so inside `.ui-scale-body` it doesn't shrink with the rest of the panel; at the card's narrow width it reads oversized next to the scaled text beside it. Card 6 keeps its own `.figma-ctrl-badge` (all sizes `em`, same colours as `ui/badge`'s `.accent`/`.dark` pair) so the whole panel scales as one piece — the point of `ui/scale`.
- **ui/progress** — same fixed-size issue, and its track/fill colours don't expose the light/dark pair the Figma section shows side by side. `.figma-ctrl-bar-track`/`-fill` reuse the site's `--darken-2`/`--prim` tokens directly instead of inventing new colours.
- **ui/tags** — closest match for the chip row; not swapped in because it renders as a `<button>` group with its own click/select state, which this section doesn't need (the chips are static labels in the mock), and pulling it in would add another fixed-size component fighting the scale wrapper.

No existing `ui/` component is built to live inside a `container-type: inline-size` scale wrapper with every length in `em`, so hand-built pieces stayed. That gap is real reuse debt — worth a follow-up (an `em`-sized variant of `ui/badge`/`ui/progress`), not this task's scope.
