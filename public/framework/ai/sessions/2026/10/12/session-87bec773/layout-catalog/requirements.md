# Layout catalog: rank our layouts, match them to content, and use the Figma designs (mastermind brief)

**Owner (2026-10-12, dictated):** use what Figma made: it looked much better, especially with our prime token. We want to rank our layouts, document what each is good for, and match the right layout to the right kind of content. Examples: a data grid, an inbox rail with preview → detail, steps, left-nav navigation ("very intuitive, jump around quickly"), and a properties rail when you want to chat about an item. Work on them as general solutions other pages reuse. No major overhaul of existing pages yet: that comes once the layout and page systems work, so agents make the right choices.

## Done when (tick each with proof)
- [ ] **Past work first** (the `past-work` skill or a Haiku minion under 60k): `styles/layouts`, `/layouts/`, `/imagine/paging/`, `ext/Playground`, column pages, Figma pages. Check what is live; don't trust old verdicts.
- [ ] **Census by script:** for each layout or section pattern, how many pages use it (a node count, not a guess).
- [ ] **Catalog page** (one screen, shown not told, on the styles or layouts page; the name is @mastermind-style-system's call). For each layout:
  - a screenshot;
  - its use count;
  - a usefulness score with one line why;
  - what content it suits (how many items, how much info each, what you do with them);
  - when not to use it.

  Include the **Figma palette page's big full-width white card**: even spacing, simple to scroll, a bit big. It is one to document, not to use everywhere.
- [ ] **Colour schemes rule** (one short doc beside the tokens; send it to @mastermind-style-system to apply):
  - Default to one simple scheme everywhere: white, light and dark stack freely. A light card goes on white, white on light, either on dark. Dark stacked with better contrast in Figma.
  - Upgraded schemes are used sparingly and on purpose. An inbox rail of twelve schemes is exhausting.
  - A **prime background** is a special callout, not a default. It needs darkening or tinting chosen for contrast with light or dark text, so check the contrast ratio. Name the schemes so "dark" can't mean either text or background.
- [ ] **Matching guide:** a short "content → layout" table that agents read before building a page. Linked from the `layout` skill and the Page readme.
- [ ] Screenshots at 400/1200/1920/3440; smoke clean; commit each step; merge.

Sonnet 5.5 (Opus for the scoring judgement if needed), Haiku for scans. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open.
