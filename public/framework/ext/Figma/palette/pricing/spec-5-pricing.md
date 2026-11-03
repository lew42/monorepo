# Spec 5 · Pricing & Dashboard (Figma node 115:2646, Page 7, The Palette)

Build `palette/pricing/page.js` + `palette/pricing/pricing.css`. Copy the pattern of `../features/page.js` and `features.css` (section 4, working): Page class, `View.stylesheet(import.meta, "pricing.css")`, CSS in `@layer theme` (restate `@layer base, theme, site, util;` on top), classes prefixed `prc-`.

**Framework facts (earlier sections broke on these):**
- `p.c("cls", "text")`, `div.c("cls", () => {...})`. `c()` takes ONE class string; a second argument is the text/children. Inline style: chain `.style("color", v)`; never `{style:...}`. Attributes: `.attr(name, value)`.
- Page `width: "full"`; the outer card needs CSS `grid-column: 1 / -1; max-width: none; box-sizing: border-box`.
- Rows of columns: `align-items: start`; columns `flex: 1 1 0; min-width: 0`.
- Use `p` for every text (not h4). Data-driven: arrays + loops. Explicit colour on every text element.
- "ONE TEXT ONLY" rule: write exactly the texts listed, nothing duplicated.

**Tokens:** prime `#72c4ff`; PRIME25 = `linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff`. Dark `#675f56`. Label = 14px/700 uppercase, letter-spacing .07em, line-height 1.4. Body = 16px/500 line-height 1.8. Title = 24px/600 lh 1.4. Price = Montserrat 900 48px, line-height normal.

**Section card:** white, radius 16, padding 56px 48px, flex column, gap 32. Header centered, gap 8: "PRICING & DASHBOARD" 900 48px `rgba(0,0,0,.8)`; "Multi-column compositions using the approved solid bases." 16px/500 lh 1.8 `rgba(0,0,0,.8)`.

**Row 1: three pricing cards**, equal columns (gap 24, align start), radius 16, padding 32, flex column, gap 16. Each card in order: Label plan name; price (48/900); "per month" (body); 1px divider full width; check rows; FULL-WIDTH button (padding 12px 24px, radius 8, bg PRIME25, text Label white, centred).
Check row = flex, gap 10, align center, full width: "✓" in Label style + text in body.
- **STARTER (white):** bg `#fff`, border 1px `rgba(0,0,0,.1)`. Name `#72c4ff`. Price "$9" `rgba(0,0,0,.8)`. "per month" `rgba(0,0,0,.55)`. Divider `#000`. Check marks `#72c4ff`; texts `rgba(0,0,0,.8)`: "5 projects", "10GB storage", "Email support". Button "CHOOSE PLAN".
- **PRO (dark):** bg `#675f56`. Name `#72c4ff`. Price "$29" `#fff`. "per month" `rgba(255,255,255,.7)`. Divider `#fff`. Check marks `#72c4ff`; texts `#fff`: "Unlimited projects", "100GB storage", "Priority support", "Custom domains", "API access". Button "CHOOSE PLAN".
- **ENTERPRISE (prime):** bg PRIME25, no border. Name `#fff`. Price "$99" `#fff`. "per month" `#fff`. Divider `#000`. Check marks `#fff`; texts `#fff`: "Everything in Pro", "SSO & SAML", "Dedicated support". Button "CONTACT US" (PRIME25 on a PRIME25 card, so it blends in: correct).

**Row 2: dashboard**, one flex row, radius 16, `overflow: hidden`, `align-items: start`, full width.
- **Sidebar:** width 280px (no shrink), bg `#675f56`, padding 32px 24px, flex column, gap 24. Items in order:
  1. "Dashboard" title (24/600 `#fff`).
  2. Nav items "Overview", "Analytics", "Settings", "Team", "Billing": each full width, padding 8px 12px, radius 6, body text. "Overview" is active: bg `linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.1)), #675f56`, text `#fff`. The other four: no bg, text `rgba(255,255,255,.7)`.
  3. User box: full width, padding 12, radius 8, flex row, gap 10, align center, bg `linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #675f56`. A 32x32 round avatar (bg PRIME25), then a column (flex 1, gap 2): "JANE COOPER" Label `#fff`, "Admin" body `rgba(255,255,255,.7)`.
- **Main:** flex 1 (min-width 0), bg `#fff`, padding 32, flex column, gap 20.
  1. "Overview" 36px/700 line-height 1.5 `rgba(0,0,0,.8)`.
  2. KPI row: flex, gap 12, three equal tiles, each padding 16, radius 10, flex column, gap 6, bg `linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff`. Each tile: Label `rgba(0,0,0,.8)` then value 24px/600 `rgba(0,0,0,.8)`, line-height 1.4. Tiles: "REVENUE" / "$12,450", "USERS" / "1,247", "GROWTH" / "+18.2%".
  3. Activity panel: full width, padding 16, radius 10, flex column, gap 10, same bg as the KPI tiles. Label "RECENT ACTIVITY" `rgba(0,0,0,.8)`, then three full-width rows (bg `#fff`, radius 6, padding 10px 12px, flex, gap 8, align center): a 4x20 bar (radius 2, bg PRIME25) + body text `rgba(0,0,0,.8)`: "New signup: alex@demo.com", "Payment received: $299", "Team invite accepted".

Page: `new Page({meta: import.meta, title: "Pricing & Dashboard", icon: "payments", width: "full", description: "Pricing cards and a dashboard on the approved solid bases.", content(){...}})`. Touch only `palette/pricing/`. No commit. Report in 5 lines: what you built, what you were unsure of.
