# Figma pages keep Figma's palette (scoped `.figma-scheme`)

Decided 2026-10-12 after the style-system fold painted every rebuilt page in the site's orange `--prime` and `#42404B` `--dark`. The Sept-2026 file's `prime` is `#72c4ff` and its `dark` `#675f56`; text the design calls prime is that blue.

- `scheme.css` sets `--prime` and `--dark` on `.figma-scheme` only; every page below `ext/Figma/` declares `classes: "figma-scheme"` and loads it. Nothing is mapped to another token: a ground, label or bar the design calls prime uses `--prime`.
- Ink on the Figma prime ground is **white**, as drawn (about 2:1 on `#72c4ff`; the site's `.bg-prime` keeps dark ink, [architecture.md](/framework/styles/doc/architecture.md)). This is a fidelity choice for design rebuilds only.
- The site's tokens are untouched, `--bg` and `--prim` still alias `--dark` and `--prime`.
- Compare shots: [the fix task](/framework/ai/sessions/2026/10/12/session-87bec773/figma-colors-fix/compare.md).
