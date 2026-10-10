# Cards and prose: one measure, one margin; and a background/colour system that adapts

## The ask (owner, 2026-10-03, dictated; transcription was partly scrambled mid-paragraph, so this is close to their words)
**Widths.** At 3440 the Now card's sections run the full width. I don't want to just restrain them, because then you can't easily have full-width pages. But with our bleed system we should have control over card widths, and maybe putting the measure on them is the way: the whole card hits the measure. Try putting a paragraph of text outside one of these cards, just in the flow: we won't always want cards. Flowing text and cards should share the same margin, and we should be able to explore the options: centred, restrained, or full width.

**Padding rule.** Default padding on everything unless otherwise asked. If something needs padding, slap the `pad` class on it. A `card` class automatically has padding, a little border radius, and a default background that might depend on the parent's background. Don't double-pad: a padded child inside a padded parent wastes space.

**Backgrounds.** In Figma I experimented with white, light gray, primary, dark gray, maybe black backgrounds, layered with tinting: a transparent white or transparent black that naturally tints whatever is behind it. A `lighten` class (better: `bg-lighten`, `bg-darken`) whose amount varies with the container it's on: white, light, dark or primary each need a different amount. Stacking lighten on darken and vice versa was another test, and contrast ratios become moving targets.

**Text colour.** Typography themes: a text colour token (`--color-text`?) that's dark on white/light, light on dark, and on primary either, chosen by testing the contrast ratio, going to black or white if needed. An accent token. What worked before: calling the primary colour the ACCENT; `--prim` still exists and maps to the accent on the light and dark schemes; on primary, the accent is set separately. There were two primary schemes (primary 1 and 2). Confusing part: a scheme is named after its background. Naming: `dark` is a theme's dynamic dark colour; `bg` is the ADAPTIVE token that maps to dark, primary, white, light, a lighten, whatever the usage needs.

**A lab.** We need a place to explore this. The inbox and these cards are actually the UI I've been looking for.

## What exists (read first; extend, don't rebuild)
- `framework.css`: `--surface`, `--wash`, `--tint`, `--line`, `--ink`, `--prim`, `--prim-ink`, `--bg` (the sidebar's dark), `--pad`, `--pad-card`, `.card`, `.surface`, `--measure`.
- `core/Page/Page.css`: `.page-content-list` (light-gray well, `--pad-well`) and `.page-content-row.card`.
- Memory of an earlier pass: a lighten/darken + box rule from the 2026-09-17 layout-browser run (grep `lighten` in framework.css and styles/).
- Bleed / width words on pages (`page-w-*`, `bleed`, `full`).

## Do (small, shown, in this order)
1. **Widths lab, as a page** under `styles/` (a real page with a `page.js`, linked from its parent's `children:`): the Now card's content repeated in four arrangements: full width; cards at `--measure`, start-aligned; cards at `--measure`, centred; mixed flowing paragraphs + cards sharing one left edge and margin. Screenshots at 1920 and 3440 on the page. Recommend one as the default for a card's content list; apply it to `.page-content-list` only if it's clearly better, and say what the alternative was.
2. **Padding rule:** one line in `.claude/skills/css/` (or the css reference skill) and `public/framework/design/content/readme.md`: default padding everywhere (`pad` class / `.card`), never a one-off value, never double padding. Check a `.pad` class exists; if not, add it beside `.card`.
3. **Background/colour lab, as a page** under `styles/`: a grid of the five grounds (white, light, primary, dark, black) × children (`.card`, `bg-lighten`, `bg-darken`, a lighten inside a darken and back), each cell showing its text and accent with the measured contrast ratio, red under 4.5:1. Build `bg-lighten`/`bg-darken` so the amount comes from a per-ground variable. Propose the token names (`--color-text`, `--accent`, `--dark`, `--bg`) on the page, with the owner's naming notes above, as a proposal: don't rename existing tokens site-wide.
4. Post both lab links on the Now card's "Landed" list when done (page_add to `/framework/ai/2026/10/03/now/`).

## Fence
Write: two new pages under `public/framework/styles/`, framework.css (only `.pad`, `bg-lighten`, `bg-darken` and their variables), Page.css's content-list rules, the css skill + content readme lines, this task dir. Hold reloads.
Model: Sonnet. Budget $12. Over pace: no reviewer spawn.
