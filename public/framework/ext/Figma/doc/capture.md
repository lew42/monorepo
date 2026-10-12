# Site page into Figma: `generate_figma_design` test (2026-10-10)

**Verdict (updated 2026-10-12, phase 2): it works, the picture is close, and flex layout survives as real Figma auto layout, but each capture is ONE responsive state, frozen at the viewport width you captured.** Phase 1 below said "no auto layout at all"; that was measured on a page of grids and inline text and is too strong. Structure round-trips; responsiveness does not.

## Phase 2: the same page at 400, 1200 and 1920 (scratch file, `selector: ".pal-card"`)

Page: [/framework/ext/Figma/palette/](/framework/ext/Figma/palette/) (the Approved Schemes). Scratch-file nodes: `3:11` (400), `5:11` (1200), `4:11` (1920).

- **`selector` fixes the shell problem.** Capturing `.pal-card` gives the content only, not the sidebar and menu.
- **Auto layout survives for flex.** `get_design_context` on the 1920 capture (`5:20`, the three-column row) returns `flex gap-[16.6px] items-start`, each column `flex-col`, children `flex-[259.7_0_0] min-w-px`, padding `p-[29.05px]` and `px/py`. Direction, gap, padding, align-items and flex-grow all come through. `get_metadata` still shows geometry only, so read structure with `get_design_context`.
- **Em becomes fractional px.** `1.75em` padding is `29.05px` at a 16.6px base: divide by the body size to get the em back.
- **Text is fixed width.** Paragraphs arrive as `w-[202px]` (the wrapped width at capture time), headings as `whitespace-nowrap`. Resizing the Figma frame resizes boxes, but text does not reflow.
- **The viewport sets the responsive state.** At 400 the columns had stacked; at 1200 and 1920 they sat in a row. One capture is one breakpoint: capture each width and name frames by width.
- **Playwright detail:** `captureForDesign(...)` never resolves in headless Chromium, yet the capture lands. Wrap it in a timeout and poll the tool until completed. A capture id is single-use.
- **Still lost:** inline `<strong>`/`<code>` runs, SVG logos, font weight fidelity.

What each Figma signal means for our layout words: [figma-to-framework.md](./figma-to-framework.md).

## Phase 1 (2026-10-10), kept for the record

**Verdict then: a frozen snapshot, no auto layout.**

Test: [/framework/ext/Figma/colors/](/framework/ext/Figma/colors/) from the local dev server, viewport **1200 x 900**, into the scratch file (`T5PuB8EhKhfyh0xtpIT1L0`, node `2:11`).

| Site (rendered) | Figma (after capture) |
|---|---|
| ![site](capture/colors-1200-site.png) | ![figma](capture/colors-1200-figma.png) |

## What happened

- The tool gives a capture id and a script. A local page needs that script injected and the page opened with the id in the URL hash; I used headless Chromium and `window.figma.captureForDesign({captureId, endpoint, selector: "body"})` (the Playwright route in the tool's own text). Then poll the tool with the id until it says completed. Took about two minutes in all, most of it the first load.
- **Only the viewport is captured (1200 x 900), not the full scrolling page.** The framework scrolls inside a container, so the capture ends at the fold. Capture a tall viewport (for example 1200 x 4000) to get the whole page.
- It captured the whole shell too (sidebar, menu button), 429 frames and 225 text nodes for one screen. Use `selector` to capture only the content.

## Fidelity

- Colours, spacing, text sizes, shadows, radii: match to the eye. Contrast numbers read the same.
- **Wrong:** a paragraph mixing plain text with `<strong>` and `<code>` came out as overlapping text (inline flow does not survive; it becomes absolutely placed pieces). The SVG logo became a flat orange square. Text weights look slightly different (not measured).
- **Layout is frozen:** every node has fixed x/y/width/height; `get_metadata` shows no auto layout. Resizing the Figma frame does not reflow anything.
- But `get_design_context` on one card returns a **grid**: `grid grid-cols-[537.14px] grid-rows-[18.28px 26.86px ...] gap 14.92px p-[29.84px]`. That is our `.fg-scheme` (`display:grid`, `gap:1em`, `padding:2em`, 1em = 14.92px), recovered with the original em values as pixels, but with fixed tracks. So the signal "this was a grid with this gap and padding" survives; the responsive part (`1fr`, `minmax`, `auto-fit`) does not.
- Output over about 90 KB comes back as a sparse tree only; ask `get_design_context` on sub-nodes.

Mapping Figma properties to framework words: [doc/mapping.md](./mapping.md).
