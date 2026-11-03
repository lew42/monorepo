verdict: fix
1. [fix] The doc page /imagine/lines/doc/ is a whole column holding one link (page 9, layout 7). layout.json reports `big_empty: true` and empty 87% at 400. Opening it also squeezes the tool to its left: at 1200 the slider labels wrap and both images shrink to thumbnails (shots/…-imagine-lines-doc/sheet.png, 1200). Either render filter.md directly as the doc page, or route the "How the filter works" link straight to /doc/filter/.
2. [note] Hue gets twice the weight of saturation and brightness. In lines.js, `hx`/`hy` are a full difference `circular(r − l)`, but `sx`, `vx` and the others are halved `(r − l) / 2`. If the double weight is deliberate, say so in filter.md; otherwise halve hue too.
3. [note] At 400 the line-art result sits below the fold, and the four sliders come before it (flow 25; shots/…-imagine-lines/400.png). The result is the point of the page. Showing the two images before the controls, or putting the result first, would show the result before the knobs.
4. [note] Nothing is routed (page 6). The chosen sample and the slider values are not in the URL, so a reload always returns to "Box" at the default settings.
5. [note] One output has three names: "Line art" (the title), "Line confidence" (the caption) and "line map" (the readme and blog). Content 7 asks for one name, used every time.
6. [note] lines.css restates the layer order with `@layer base, theme, site, util;`, which lives once in framework.css. It also switches layouts with a fixed `@media (max-width: 800px)` and gives the tool its own grid, where a layout word or a container query would do (page 7, css 42).
7. [note] "Drop an image" has no visible drop target. The whole tool accepts a drop, but nothing on screen says so or highlights while a file is dragged over it.

Widths: all four (400, 1200, 1920, 3440). The change is a page layout: two image panes sit beside each other when wide and stack when narrow, inside the Imagine column row.

## Requirements
- 1 "Input: any image (drop a file, or pick a sample)" — yes — tool.js accepts a file input, a drop and a sample select; shots/…-imagine-lines/1200.png, top band
- 2 "mostly WHITE grayscale … DARKER the more confident" — yes — 1200.png, right pane: white ground, black box edges; grey = 255 × (1 − c^γ)
- 3 "Change, in every channel … hue (circular), saturation and brightness" — yes — lines.js computes `circular()` hue × min sat, plus sat and val differences (hue weighted 2×, finding 2)
- 4 "structure tensor … coherence (λ1−λ2)/(λ1+λ2)" — yes — lines.js: averaged tensor with summed-area tables, `gap / trace` = (λ1−λ2)/(λ1+λ2)
- 5 "Consistency along the line … normalise by local noise" — yes — samples ±length steps along (−sin, cos) weighted by alignment and coherence; response = mag / (mag + floor + √(2λ2))
- 6 "Line confidence = coherence × consistency × relative size; gamma slider" — yes — `result = coherence × response × support`, and gamma only repaints
- 7 "Original and line art side by side (stacked on mobile)" — yes — 1200/1920/3440 side by side, 400 stacked
- 8 "Sliders: window size, line length, noise floor, gamma. Live updates" — yes — four labelled ranges with live values; 60 ms debounce
- 9 "3 or 4 samples: synthetic box (8 corners, 12 edges) + 1–2 real photos" — yes — box, faint seam, room, plus the seagul.jpeg photo already in the repo
- 10 "Plain JS on canvas, pure `lines(imageData, opts) → Float32Array` in its own file" — yes — lines.js has no DOM, and test.mjs runs it in node
- 11 "Link from the blog post's Next section, and from /imagine/" — yes — post.md "Next" is rewritten with the link; GROUPS Tools leads with `lines` (…-imagine/sheet.png, first card)
- 12 "Do the line map FIRST; no 3D yet" — yes — no corner, SVG or 3D code; filter.md says so

## Page structure
- page 1 — yes — 1200.png: title "Line art", then "Darker means more likely to be a line. Drop an image or try a sample."
- page 2 — n/a
- page 3 — yes — what it is, then the inputs, then the result; at 400 the result falls below the fold (finding 3)
- page 4 — n/a
- page 5 — yes — imagine/page.js GROUPS names `lines`
- page 6 — no — the sample and slider state have no URL (finding 4)
- page 7 — no — the tool has its own grid and media query in lines.css rather than a layout word (finding 6)
- page 8 — yes — Sample, Choose image, Save PNG and the slider names are self-evident
- page 9 — no — the doc page is one link in a full column (finding 1)
- page 10 — yes — the result is shown as an image, and the slider values as numbers
- page 11 — yes — "Original" and "Line confidence" caption the panes
- page 12 — n/a

## Navigation
- nav 1 — a rail (the Imagine sidebar), columns, a bottom rail at 400
- nav 5 — yes — 3440.png: the rail sits beside the tool, which is centred at max 90em; at 400 it folds into the "⋯" bottom rail
- nav 6 — yes — selecting a sample repaints the canvases in place, and they keep their size
- nav 7 — yes — 400.png: the bottom rail sits below the column body, and the column scrolls
- nav 10 — no — the doc opens as a column that squeezes the tool (finding 1)

## Layout
- layout 1 — yes — 3440.png: the rail beside a centred tool; 63% empty, but the tool is capped at 90em
- layout 2 — yes — Columns (Imagine's row)
- layout 3 — yes — the panes are 50/50 from 1200, full width at 400; the doc column is the exception (finding 1)
- layout 4 — yes — no extra padding inside the tool
- layout 5 — yes — figcaptions and controls clear the edges in every shot
- layout 6 — n/a
- layout 7 — no — lines page bands are fine (ink 0.56 at 1200), but the doc page has `big_empty: true` at 400
- layout 8 — yes — the two panes are equal size
- layout 9 — yes
- layout 10 — yes — at 3440 each pane is about 450 px wide and still readable
- layout 11 — yes — the /imagine/ Tools wall gains one card and stays balanced (…-imagine/sheet.png)
- layout 12 — n/a

## Sizing
- sizing 13 — yes — canvases are `height: auto`
- sizing 14 — yes
- sizing 15 — n/a
- sizing 16 — yes — no stray scrollers
- sizing 17 — n/a
- sizing 18 — yes — overflow_x false at every width; the grid tracks use minmax(0, 1fr)
- sizing 19 — yes — em is used for control padding and the 90em cap

## Wrapping
- wrap 20 — yes — layout.json wraps lists only the framework's drawer buttons, none from this diff
- wrap 21 — no — with the doc column open, the slider labels go to two lines at 1200 but not at 1920 (finding 1)
- wrap 22 — yes — `.lines-inputs` is flex-wrap by design; at 400 it wraps cleanly to three rows
- wrap 23 — yes — 400.png: sliders form 2 columns, images 1
- wrap 24 — yes — the Line art card text is intact on /imagine/

## Spacing and padding
- spacing 33 — yes — left_stack p 11 px at 400
- spacing 34 — yes — one layer (page-column-prose)
- spacing 35 — yes
- spacing 36 — yes
- spacing 37 — yes — `--gap` and `--gap-50`
- spacing 38 — yes — the Save button has .5em .8em
- spacing 39 — n/a
- spacing 40 — n/a
- spacing 41 — yes — all rules sit in `@layer site`; the order is restated (finding 6)
- spacing 42 — no — page-specific grid and media query (finding 6)

## Colour and contrast
- colour 1 — yes — dark ink on the light ground; the status line is `.muted`
- colour 2 — yes — the link uses default link blue on light grey
- colour 3 — yes — CSS uses `var(--ink)`; the literal colours are canvas sample pixels, which is correct
- colour 4 — yes — the canvas grounds differ from the page
- colour 5 — not measured — no dark shots; the canvases are white by design
- colour 6 — yes
- colour 7 — n/a
- colour 8 — yes — `lines-status muted`

## Flow
- flow 25 — no — at 400 the result is below the controls and the fold (finding 3)
- flow 26 — yes — overflow_x false
- flow 27 — yes — one grid gap
- flow 28 — yes — each caption sits above its own canvas
- flow 29 — n/a
- flow 30 — yes — widest_text 567 at 3440
- flow 31 — n/a
- flow 32 — yes

## Words
- words 1 — yes — the page shows the result live
- words 2 — yes
- words 3 — yes — filter.md's longest paragraph is about 55 words
- words 4 — yes
- words 5 — yes
- words 6 — yes — one-word captions
- words 7 — no — line art / line confidence / line map (finding 5)
- words 8 — yes — readme and filter.md link the tool, the blog and the photo
- words 9 — yes — filter.md opens with "Try it", which links to the live tool
- words 10 — yes
- words 11 — yes — the readme and filter.md are plain sentences, and the tensor is explained in plain words
