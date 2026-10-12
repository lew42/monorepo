# type-color-study — where two grounds meet, and the repeated colored anchor: two pages you can look at

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (two pages, each one screen, each showing one idea). Clear beats brief by far (a newcomer sees the effect before reading a word). Prioritize (the sections page first, the anchors page second).
**Length budget:** each page's level 1 is one screen with a one-sentence takeaway; the reasoning one click down. Your landing report is one screen.
**The reader is the overwhelmed newcomer.** Shown, not told. A demonstration page that needs its blockquote explained has failed.

## The owner's words (2026-09-17, 23:40)

> we need to thoroughly explore the permutations of color, how white interacts with light gray, how dark interacts with light. And it's not just... I'm thinking of entire sections like a light or white background versus a dark background, where they meet, whether one is nested inside the other creates a whole visual effect.

> the decisions about how to create good typography is about font, size, weight, color, and then relation to all of the other text around it. Creating lists and repetition is extremely strong. [...] a pre-heading, an eyebrow, with an underline. Then an H1, a paragraph, an H2 with a little bit of colored text after it [...] the H2 is bold and heavy and the colored text is very small, half the size, like a timestamp [...] it creates this little bit of color that's recognizable, it matches the theme, and it creates that repetition [...] a visual anchor. Any kind of visual repetition when you're creating layouts is really important.

The layout skill now carries both as rules ("Color meets color, and text meets text") — read that section; these pages are the detail it links to.

## Deliverables (each ticked against the sentences above at harvest)

1. **`/imagine/design/color/sections/`** — the seams. The site's grounds (white, light gray, mid gray, dark gray, black, and the accent as a band — read `framework.css`'s tokens and `/imagine/design/color/` for the names) as whole SECTIONS, each with real text (a heading, a paragraph, a small list): (a) every pairing side by side, stacked — light above dark, dark above light, white above light gray … — the seam between them full width; (b) every nesting — a dark card inside a light section, a light card inside a dark band, white inside light gray — with the nested box padded by the box rule; each cell labelled with the two tokens and the ink ratio on each. A one-sentence takeaway at the top, computed or judged and said plainly (which pairings read as one page, which as two; which nestings float and which sit). Level 1 is the grid; the reasoning one click down. Interactive if cheap: pick the accent hue and every band follows (the color page already has the sliders — reuse its code, do not fork it).
2. **`/imagine/design/type/anchors/`** — the repeated anchor. Three variants of the owner's mock-up, side by side, each a short "post": an eyebrow (small caps or small, above the h1, one with an underline), the h1, a paragraph, then three h2s each heavy with a very small colored line after it (half the h2's size: a date, a count, a tag — vary what it says across the three h2s to prove that what it says matters less than that it repeats), a paragraph under each. Variant A: the anchor in the accent; B: the anchor in a muted ink (no color); C: the anchor as an underline of the accent only. The takeaway sentence at the top says which reads as anchored and why (the eye finds the repeated color). Use only the site's six type levels (`styles/doc/theme.md`: never invent a font-size) and the theme's tokens; the anchor's size is a level, not a number.
3. **Both pages linked** from their parents (`/imagine/design/color/` and `/imagine/design/type/` — one `children:` word and one visible line each; count the anchor on the parent), and from the layout skill's new section (already there: the color page; add the anchors page as one link — that is the only `.claude/` write allowed).
4. **Docs:** each page's `decisions.md` (the record: what was measured, what was judged, the alternative), one paragraph each.

## Rules

- Load `code`, `layout` (all of it — especially the new "Color meets color" section, the box rule, "under a COLUMNS host there is no page grid"), `css` (the theme layer; the six levels), `new-css-class` (the design realm's prefix — read `css-scopes.txt`); `new-task` before the first edit (your dir exists: `ai/2026-09-17/type-color-study/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/imagine/design/color/sections/**` (new), `public/imagine/design/type/anchors/**` (new), one `children:` word + one line in `public/imagine/design/color/page.js` and `public/imagine/design/type/page.js`, one link in `.claude/skills/layout/SKILL.md`'s "Color meets color" section, your task dir. Nothing else — not framework.css, not the color page's existing content.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. The owner's server (port 80) is NOT running; start your own: `PORT=8109 node server.js` from the repo root, in the background; kill it by PID when you land. `ui-test` has the headless recipe; shots of both pages at 1280 and 3440 into your task dir.
- Every ratio said is computed from the rendered pixels (the color page shows how); two of them recomputed by hand must match.
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock.
- Landing: `outcome` = a headline, the two links, the two takeaway sentences, one screenshot each at 1280, what was left and why. One screen.
