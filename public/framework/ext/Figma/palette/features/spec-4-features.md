# Spec 4 · Feature Cards & Lists (Figma node 115:2568, Page 7, The Palette)

Build `palette/features/page.js` + `palette/features/features.css`. Copy the pattern of `../controls/page.js` and `controls.css` (section 3, working): Page class, `View.stylesheet(import.meta, "features.css")`, CSS in `@layer theme` (restate `@layer base, theme, site, util;` on top), classes prefixed `fea-`.

**Framework facts (earlier sections broke on these):**
- `p.c("cls", "text")`, `div.c("cls", () => {...})`. `c()` takes ONE class string (`c("a b")`); a second argument is the text/children. Inline style: chain `.style("color", v)`; never pass `{style:...}`. Attributes: `.attr(name, value)`.
- Page `width: "full"`; the outer card needs CSS `grid-column: 1 / -1; max-width: none; box-sizing: border-box`.
- Rows of columns: `align-items: start`; columns `flex: 1 1 0; min-width: 0`.
- Data-driven: arrays + loops. Put an explicit colour on every text element.
- NOTE: in THIS section the buttons are NOT hugging: they stretch the full width of the card (`align-self: stretch`, width 100%).

**Tokens:** prime `#72c4ff`; PRIME25 = `linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff`. Dark `#675f56`. Label style = 14px/700 uppercase, letter-spacing .07em, line-height 1.4. Body = 16px/500 line-height 1.8. Title = 24px/600 line-height 1.4 (use `p`, not `h4`).

**Section card:** white, radius 16, padding 120px 48px, flex column, gap 32. Header centered, gap 8: h1 "FEATURE CARDS & LISTS" Montserrat 900 48px `rgba(0,0,0,.8)`; "Building blocks demonstrated across all three approved bases." 16px/500 lh 1.8.

**Row 1: three feature cards**, equal columns (gap 16, align start), radius 12, padding 28px 32px, flex column, gap 16.
Each card, in order:
1. Eyebrow row (flex, gap 8, align center): an 8x8 round dot + Label text. Texts: "FEATURE · WHITE", "FEATURE · DARK", "FEATURE · PRIME".
2. Title "Adaptive Tokens" (24px/600).
3. Body "Colors shift with context. One variable, many expressions." (16px/500).
4. A 1px divider, full width.
5. A FULL-WIDTH button: padding 16px 26px, radius 6, bg PRIME25, text "LEARN MORE" (Label style, white), text left aligned.

Per card:
- **White:** bg `#fff`, border 1px `rgba(0,0,0,.1)`. Dot `#72c4ff`; eyebrow text `#72c4ff`. Title `rgba(0,0,0,.8)`. Body `rgba(0,0,0,.55)`. Divider `rgba(0,0,0,.1)` over white (`linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff`).
- **Dark:** bg `#675f56`, no border. Dot `#72c4ff`; eyebrow `#72c4ff`. Title `#fff`. Body `rgba(255,255,255,.7)`. Divider `linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.1)), #675f56`.
- **Prime:** bg PRIME25, no border. Dot `#fff`; eyebrow `#fff`. Title `#fff`. Body `#fff`. Divider PRIME25 (invisible, still 1px). Button PRIME25 too (so it blends into the card: that is correct).

**Row 2: three list panels**, equal columns (gap 16, align start), radius 12, padding 36px 32px, flex column, gap 16. Each has a Label heading, then a column (gap 16) of four rows; each row = flex, gap 16, align center, full width: a marker (Label style, does not shrink) + text (body, flex 1, min-width 0).
1. **FEATURES** — bg `linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff`, no border. All text `rgba(0,0,0,.8)`. Markers "●". Rows: "Adaptive color schemes", "Three explicit solid bases", "Variable-bound tokens", "Approved tint stacks only".
2. **STEPS** — same bg and colours. Markers "1" "2" "3" "4". Rows: "Pick an approved solid base", "Apply only approved tint insets", "Bind variables to layers", "Switch base — everything follows".
3. **FEATURES · DARK** — bg `#675f56`. Heading colour `#72c4ff`. Markers "●" colour `#72c4ff`. Rows: "Adaptive color schemes" white, "Three explicit solid bases" white, "Approved tint stacks only" `rgba(255,255,255,.7)`, and a fourth row where marker AND text are Label style `#72c4ff`: "PRIME LABEL ON DARK". (Only 4 rows: the third list item is "Approved tint stacks only"; there is no "Variable-bound tokens" here.)

Page: `new Page({meta: import.meta, title: "Feature Cards & Lists", icon: "view_agenda", width: "full", description: "Feature cards and lists on each of the three approved bases.", content(){...}})`. Touch only `palette/features/`. No commit. Report in 5 lines: what you built, what you were unsure of.
