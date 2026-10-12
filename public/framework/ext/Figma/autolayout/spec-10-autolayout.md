# Spec 10 · Auto layout (Figma node 119:15240, Sept-2026 Page 8)

Build a framework page from this spec. Pattern: `../palette/hero/page.js` + `hero.css` (read them first). Files to write: `page.js`, `autolayout.css` in this folder. Prefix every class `aut-`. All CSS inside `@layer theme { ... }`. Factories: `div.c("one-class", () => {...})`, `p.c("cls", "text")`, `.style(prop, value)` chained; `c()` takes ONE class string; no wrappers beyond those listed. Page: `new Page({ meta: import.meta, title: "Auto layout", icon: "view_column", width: "full", description: "...", content(){...} })`. A wide section needs `grid-column: 1 / -1` on its root.

Figma shows four 16:9 slides (1920x1080 in Figma) side by side with a 78px gap. Stack them vertically on the page, each a `.aut-slide` with `aspect-ratio: 16/9`, `overflow: clip`, a soft shadow `0 8px 13px rgba(0,0,0,.2)`, margin between slides 2em, font-size `clamp(10px, .8vw, 22px)` on the slide so everything scales as em (1920 frame: 1em = 16px; use 100px = 6.25em etc).

Fonts: Montserrat. Big text = weight 900, black, `font-size: 3em` (48px). Small text = weight 500, `1em`, line-height 1.8, text "Omg, I’m so small." Between big and small text: gap .625em. Text is nowrap.

Slide 1 (white): one word "whoa", weight 900, 6.25em, centered both ways (absolute centre; the slide is a flex with centre/centre).

Slide 2 (white): a flex column, `justify-content: center; align-items: flex-start; gap .625em; padding 7.5em`. Big text "shift a = auto layout", then the small line.

Slide 3 (two columns): a flex row, no gap, two panes each `flex: 1 1 0; min-width: 0`, each pane exactly like slide 2's inner stack (flex column, centred vertically, padding 7.5em, gap .625em). Big text "50" in both. Pane 1 white, pane 2 background `rgba(0,0,0,.03)`.

Slide 4 (three columns): the same with three panes, big text "33", panes white / `rgba(0,0,0,.03)` / white.

Pitfalls (from earlier builds): `align-items` always written; per-pane flex written as `flex: 1 1 0`; text is a `p`, never a text glyph for shapes; list the slides in the order above; one data-driven helper `pane(big)` is fine.

Also put a one-line caption above each slide naming what Figma used: "no auto layout, absolute text", "vertical auto layout, gap 10, padding 120", "horizontal auto layout, two FIXED 960 panes", "horizontal auto layout, three FILL panes".
