# Style system: one card, few tokens, Figma designs folded in (mastermind brief)

**Owner (2026-10-12, dictated):** the [Figma](/framework/ext/Figma/) pages (color schemes, approved schemes, controls, pricing cards…) recreate most of our CSS per page and ignore our tokens (the scheme shows blue, not `--prim`). Move the good designs into our UI system, cutting CSS and new classes as far as possible, without clobbering what works unless it clearly makes sense. Reworking the whole style system is fine.
> "We want a simple, consistent system that just works everywhere."

## What the owner said, as decisions to make (decide each, record the alternative)
1. **Tokens: few, reusable.** `--prime` (rename from `--prim`, "like Optimus Prime"; keep `--prim` as an alias so nothing breaks, migrate callers by script), `--light` (a light gray or a tint), `--dark` (a dark gray or a shade). No `--white` token: `#fff` is as clear. Lighten/darken by one shared rule (a few fixed steps from these tokens), never a hand-picked tint per colour. The Figma file's token names are roughly what the owner wants; start from them.
2. **Utility classes:** whether `bg-white`, `bg-prime`, etc. exist (a `bg-` prefix only when a class sets a background). Decide; keep it tiny.
3. **Card vs section.** One card everywhere (pricing cards, control cards, scheme cards all use it): a background differing from its parent, default padding inside, breathing room outside (radius + shadow). A section: no required background, padding depends on context (three full-bleed columns need none outside). Define both, how they nest and mix, and whether a `card()` helper is worth it. Cards are our basic responsive tool.
4. **Which page is the card page.** The sidebar filter shows 13 "card" pages and none is clearly the main one; `/framework/ui/card/` does not show up at all (see the sibling brief [sidebar-index](../../../../../../2026-10-12/sidebar-index/requirements.md)). Pick the one home, link or fold the rest (never delete; move aside).
5. **Where styles live:** [`/framework/styles/`](/framework/styles/) has system rules, layers, elements, stacking, layouts, sections, widths: much work, not yet refined into something that makes sense. Owner's thinking: a Design system page and a Code system page; `styles` may really be the CSS system (maybe under Code) and/or a **style library** that documents all the CSS. Decide the names and scopes (CLAUDE.md "a name is a name plus its scope") and write them at the top of each page.
6. **Figma nav** uses query-string variables, not pages and subpages; its previews are screenshots (fine, faster). Make the subpages real routed pages.

## Order
- **Previous-work audit first, cheaply:** Haiku, under 60k per batch: list past CSS/token/card/style audits under `ai/` with date and verdict, and mark each still-true or stale by checking the current code (old conclusions are not trusted). One `doc/past-work.md` in `styles/`.
- **The class/token architecture page** before building (CLAUDE.md), shown on `/framework/styles/`.
- **Then the smallest slice:** tokens + one card, applied to the Figma scheme and pricing/control pages, CSS line count before and after (`code/patterns` census style: a node script, not a guess).
- Then extend to the other Figma pages and the 13 card pages.

## Process
Opus 5.5 for the architecture decisions, Sonnet for building, Haiku for scans. Worktree; `hold.mjs` around batches of live CSS; layout-check 400/1200/1920/3440; smoke clean; commit each step; merge. Renames by script with a manifest. `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open: keep going through all of it.
