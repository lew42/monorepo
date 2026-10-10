# Spec 9 · Hero & Navigation (Figma node 115:3038, Page 7, The Palette)

Build `palette/hero/page.js` + `palette/hero/hero.css`. Copy the pattern of `../collab/page.js` and `collab.css` (section 8, working): Page class, `View.stylesheet(import.meta, "hero.css")`, CSS in `@layer theme` (restate `@layer base, theme, site, util;` on top), classes prefixed `hro-`.

**Framework facts (earlier sections broke on these):**
- `p.c("cls", "text")`, `div.c("cls", () => {...})`. `c()` takes ONE class string; a second argument is the text/children. Inline style: chain `.style(prop, val)`; never `{style:...}`.
- Page `width: "full"`; the outer card needs CSS `grid-column: 1 / -1; max-width: none; box-sizing: border-box`.
- Use `p` for every text (never h4). Explicit colour on every text element.
- ONE TEXT ONLY: exactly the texts listed. NO WRAPPERS: children go directly in their parent.
- SHAPES are empty `div`s with a size, background and radius, never text glyphs.
- Write per-corner radii as the CSS shorthand. Items that "HUG" get `align-self: flex-start`.
- Put every colour/size in CSS classes (hro-*), not inline, unless data-driven.

**Tokens:** prime `#72c4ff`; PRIME25 = `linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff`. WHITE10 = `linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff`. BROWN = `#675f56`. BROWN10 = `linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.1)), #675f56`. Label = 14px/700 uppercase, letter-spacing .07em, line-height 1.4 (write text as given; `text-transform: uppercase` does the rest). Body = 16px/500 lh 1.8. Ink = `rgba(0,0,0,.8)`, soft = `rgba(0,0,0,.55)`, line = `rgba(0,0,0,.1)`. "On-dark" text: white `#fff`, and white70 = `rgba(255,255,255,.7)`.

**Section card:** white, radius 16, padding 56px 48px, flex column, gap 32, align-items center. Header (flex column, centred, gap 8): "HERO LAYOUTS" 900 48px ink, line-height normal; "Nav, hero content, and footer. Three bases in composition." Body ink. Below, FOUR demo blocks, each exactly **1000px wide** (the settings block is 1040px: 220 + 600 plus its paddings is fine, see below), centred in the card, `flex-shrink: 0`.

**Block A: Nav + hero + footer** (width 1000, radius 12, overflow hidden, flex column, three stacked parts, no gaps):
1. **Nav bar:** bg `#fff`, border-bottom 1px line, padding 14px 28px, flex, space-between, align center. Left: Label "ACME" ink. Right: a flex row gap 24 holding three Labels, soft: "Products", "Pricing", "Docs".
2. **Hero:** bg `#fff`, padding 40px 48px, flex column, gap 16, align-items flex-start. In order:
   - A 900 48px ink title in TWO lines, line-height normal: "One system." / "Every context." (two `p`s directly in the hero, no wrapper; the second line follows the first with no gap: set the hero's gap 0 between them using margin-top:-16px on the second, or simply make the title ONE `p` with a `<br>`-free approach: two `p`s with `margin: 0`, and the second `.style("margin-top","-16px")` to cancel the gap).
   - Body soft, two lines (two `p`s, 16px lh 1.8): "Your variables adapt automatically. Set the mode on a parent frame" and "and every child resolves through your scheme — no manual overrides." Put 16px between them (the gap already gives it).
   - A stats row (flex, gap 16, hug): three stat cards, each width 140, padding 16, radius 8, bg WHITE10, flex column, gap 4. Each: a 900 48px ink number, line-height normal, then a Label soft. Data: ["3","Bases"], ["6","Styles"], ["∞","Combos"].
3. **Footer bar:** bg BROWN, padding 16px 28px, flex, space-between, align center. Left: Body text white70 "© 2026 Acme Inc.". Right: Label prime `#72c4ff` "Privacy · Terms · Status".

**Block B: Split hero** (width 1000, height 360, radius 12, overflow hidden, flex row, align stretch, no gap). Two panels, each `flex: 1 1 0; min-width: 0`, padding 36px 32px, flex column, gap 16, `justify-content: center`, align-items flex-start:
- **Left panel** bg BROWN. In order: a 700 36px white `p`, line-height 1.5, "Built for the night."; Body white70 `p` (stretches the panel width) "A color system that adapts. Switch bases in one decision — your entire UI follows."; a buttons row (flex, gap 16, full width) of two HUG buttons, each a `div` with padding 16px 26px, radius 4, holding one Label `p` white: "GET STARTED" bg PRIME25; "LEARN MORE" bg BROWN10.
- **Right panel** bg `#fff`. A Label prime "WHAT YOU GET"; then three rows (flex, gap 16, align center, full width, padding 16px 26px, radius 4, bg WHITE10), each: an 8x8 round shape (radius 12, bg PRIME25, no shrink) then a Body ink `p`. Data: "Adaptive tokens", "Explicit solid bases", "Approved tint stacks".

**Block C: Settings layout** (hugs content: width 820 = 220 + 600, radius 12, overflow hidden, flex row, align start). Two columns:
- **Sidebar:** width 220, bg `#fff`, border-right 1px line, padding 24px 20px, flex column, gap 4, align-items flex-start. In order: a Label ink "SETTINGS"; a 12px-high empty spacer `div` (width 180); then five nav items, each a `div` width 180, padding 8px 12px, radius 6, holding one text. Active item "Appearance" bg WHITE10, text is a Label ink "Appearance". The others ("General", "Billing", "Team", "API") have no bg, text is Body soft (16px/500, NOT uppercase).
- **Content:** width 600, bg `#fff`, padding 24px 32px, flex column, gap 20, align-items flex-start. In order: a 600 24px ink `p` "Appearance" (line-height 1.4, NOT uppercase); Body soft "Customize how your workspace looks and feels."; a swatch row (flex, gap 12, hug) of three swatches, each width 120, padding 12, radius 8, flex column, gap 6, align-items flex-start: a Label then a bar (an empty `div`, 96x3, radius 2).
  - "White": bg `#fff`, border 1px line; Label ink "White"; bar PRIME25.
  - "Dark": bg BROWN, border 2px solid `#72c4ff`; Label white "Dark"; bar PRIME25.
  - "Prime": bg PRIME25, border 1px line; Label white "Prime"; bar bg `#fff`.
  Use box-sizing border-box on swatches so they stay 120 wide.

(Block B and A and C are the only blocks: do NOT invent a fourth.) Block C is centred in the card like the others.

Page: `new Page({meta: import.meta, title: "Hero & Navigation", icon: "web", width: "full", description: "Nav, hero content and footer in three compositions: nav+hero+footer, split hero and a settings layout.", content(){...}})`. Touch only `palette/hero/`. No commit. Report in 5 lines: what you built, what you were unsure of.
