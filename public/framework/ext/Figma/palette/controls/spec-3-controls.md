# Spec 3 · Controls (Figma node 115:2441, Page 7, The Palette)

Build `palette/controls/page.js` + `palette/controls/controls.css`. Copy the pattern of `../typography/page.js` and `typography.css` (section 2, already working): Page class, `View.stylesheet(import.meta, "controls.css")`, CSS inside `@layer theme` (restate `@layer base, theme, site, util;` on top), classes prefixed `ctl-`.

**Framework facts you must follow (sections 1 and 2 broke on these):**
- Factories: `p.c("cls", "text")`, `div.c("cls", () => {...})`. Set inline style by chaining `.style("color", value)` AFTER the call; NEVER pass `{style:...}`.
- Page config `width: "full"`, and the outer card needs CSS `grid-column: 1 / -1; max-width: none; box-sizing: border-box`.
- Rows of columns need `align-items: start`. Columns: `flex: 1 1 0; min-width: 0`.
- HUG items (buttons, chips, badges, the toggle) must not stretch: `align-self: flex-start` inside column flex, and flex-wrap rows use `align-items: flex-start`.
- Data-driven: arrays + render loops. Only `p()`/`h1`-`h6` read backticks.
- Use inline `.style()` for per-scheme colours; the fix for lost colours is always explicit colour on every text element.

**Tokens:** prime `#72c4ff`; "prime button/chip" bg = `linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff` (call it PRIME25). Text on white `rgba(0,0,0,.8)`, muted `rgba(0,0,0,.55)`, border `rgba(0,0,0,.1)`. Dark `#675f56`, on dark text `#fff`, muted `rgba(255,255,255,.7)`, border `rgba(255,255,255,.1)`. "Label" style = 14px/700, uppercase, letter-spacing .07em, line-height 1.4. Body = 16px/500 line-height 1.8.

**Section card:** white, radius 16, padding 120px 48px, flex column, gap 32. Header (centered, gap 8): h1 "CONTROLS" Montserrat 900 48px `rgba(0,0,0,.8)`; "Forms, buttons, toggles, chips, badges — each base demonstrated." 16px/500.

**Row 1: three equal columns** (gap 16, align start). Each column radius 12, padding 36px 32px, flex column gap 36, border 1px.

1. **Form · White** — bg `#fff`, border `rgba(0,0,0,.1)`. Title "Form - White" 24px/600 lh 1.4 colour `#72c4ff` (NOT uppercase). Three fields, each = column gap 16 of: label (Label style, colour `rgba(0,0,0,.8)`) + input box (full width, padding 16px 26px, radius 8, border 1px `rgba(0,0,0,.1)`, bg `rgba(0,0,0,.1)` over white i.e. `linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff`, containing body text). Fields: "FULL NAME" / "Jane Cooper" (colour `rgba(0,0,0,.8)`); "EMAIL" / "you@example.com" (placeholder, `rgba(0,0,0,.55)`); "MESSAGE" / "Tell us about your project..." (`rgba(0,0,0,.55)`, min-height 80px, text at top). Then a row (gap 16): button "SUBMIT" (padding 16px 26px, radius 6, bg PRIME25, Label style white text) and button "CANCEL" (same size, radius 6, border 1px `rgba(0,0,0,.1)`, bg `rgba(0,0,0,.1)` over white, Label style `rgba(0,0,0,.8)`). Buttons are HUG width (do not stretch).
2. **Toggles etc · Prime** — bg `#72c4ff` (plain prime, NOT darkened), border 1px `rgba(0,0,0,.1)`. In order:
   - Label "TOGGLES · WHITE" colour `rgba(0,0,0,.8)`.
   - Three toggle rows (column, gap 16; each row flex, gap 16, align center): a 44x24 switch + body text `rgba(0,0,0,.8)`: "Dark mode" (off), "Notifications" (on), "Auto-save" (off). Switch = 44x24, radius 12, with a 18px circular knob inset 3px. Off: track `rgba(0,0,0,.1)` over white (`linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff`), knob on the left in `#72c4ff`-ish darkened PRIME25. On: track PRIME25 with a white knob on the right. Draw with CSS divs, no images.
   - Label "TAGS & CHIPS" colour `rgba(0,0,0,.8)`.
   - Wrapping row (gap 8px 16px, flex-wrap) of five chips: padding 6px 12px, radius 16, Label style. "Design" (PRIME25 bg, white text), "Tokens" (white-ish `linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff` bg, text `rgba(0,0,0,.8)`, border 1px `rgba(0,0,0,.1)`), "Variables" (PRIME25), "Themes" (white-ish), "Adaptive" (PRIME25). Chips HUG.
   - Label "BADGES & COUNTERS" colour `#72c4ff`.
   - Wrapping row (same gap) of three badges: each = flex row, gap 16, align center, padding 6px 12px, radius 8, bg white-ish (`linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff`), containing body text `rgba(0,0,0,.8)` ("Inbox" / "Updates" / "Tasks") and a counter pill (padding 6px 12px, radius 10, PRIME25 bg, Label style white: "12" / "3" / "28").
3. **Form · Dark** — bg `#675f56`, no border. Title/label "FORM · DARK" Label style colour `#72c4ff`. Same three fields and two buttons as column 1, but: field labels white; input bg `linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.1)), #675f56`, border `rgba(255,255,255,.1)`; text "Jane Cooper" white, placeholders `rgba(255,255,255,.7)`; SUBMIT is PRIME25 with white text; CANCEL has bg `rgba(255,255,255,.1)` over `#675f56`, border `rgba(255,255,255,.1)`, white text. (Note column 1's title is a 24px/600 heading; this one is a 14px Label.)

**Row 2: three equal columns** (gap 16, align start), radius 12, padding 36px 32px, flex column gap 16. Each has a Label then two progress items; each item = column gap 16: a row (space-between) of "Upload" / "72%" and "Processing" / "45%" in Label style; then a track (full width, height 8px, padding 2px, radius 4, overflow hidden) containing a fill (height 8, radius 4) of width 72% / 45% of the track (use percentages; Figma pixel widths 216 / 135 are 72% / 45% of 300).
1. **PROGRESS · WHITE** — bg `#fff`, border 1px `rgba(0,0,0,.1)`; label colour `#72c4ff`; row text `rgba(0,0,0,.8)`; track bg `linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff`; fill PRIME25.
2. **PROGRESS · DARK** — bg `#675f56`, no border; label `#72c4ff`; row text `#fff`; track `linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.1)), #675f56`; fill PRIME25.
3. **PROGRESS · PRIME** — bg PRIME25 (no border); label white; row text white; track PRIME25 bg; fill solid `#fff`.

Page: `new Page({meta: import.meta, title: "Controls", icon: "toggle_on", width: "full", description: "Forms, buttons, toggles, chips, badges and progress bars on each base.", content(){...}})`. Touch only `palette/controls/`. No commit. Report in 5 lines: what you built, what you were unsure of.
