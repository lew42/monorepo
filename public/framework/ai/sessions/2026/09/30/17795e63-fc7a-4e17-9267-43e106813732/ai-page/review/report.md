verdict: fix
1. [fix] The CLAUDE.md tab (ask 15) does not show on the live page: the tab strip reads Overview · skills · objects · authoring only, four tabs, not five — shots/monorepo-localhost-framework-ai/1920.png and /3440.png, top band. The diff does add it (overview.js TABS, pages["claude-md"]), but task.jsonl shows the shot batch ran at 14:31, and the merge log at 14:24 lists tabs/concepts/skills/objects/authoring/Readmes but never mentions claude-md — the tab likely landed after the shot. Needs a fresh shot to prove it renders, and a check that "claude-md" isn't too wide to fit 1 row at 400 (the four tabs already use the row's full width there).
2. [fix] At 400, the Overview's opening paragraph sits 56px (3.5em) from the edge — over the 3em cap — because two nested elements both carry the `.page` padding class (layout.json left_stack.p: total 56, layers [{page,28},{page,28}]). The h1 above it only has one such layer (28px, 1.75em), so the paragraph's second layer looks like a leftover wrapper, not a deliberate one.
3. [note] Ask 14 ("mastermind-servex-9 reviews the whole page") has not happened yet — task.jsonl's last line is "waiting on mastermind-servex-9's review." Nothing in this diff reflects that pass, so it is still open.
4. [note] Only the Overview tab was screenshotted, at both shot rounds. Skills, objects, authoring and claude-md are judged from overview.js/page.js source only — page structure, wrapping and spacing on those four tabs have no photographic proof.

## Requirements
- 1 "Delete the current /framework/ai/ page content" — yes — overview.js replaces the old board's overview with CONCEPTS-driven tiles; routes under v/, the date folders and effort/log pages are untouched by the diff.
- 2 "Level 1 = the AI system, shown: a row of linked icon tiles, most important first" — yes — shots/monorepo-localhost-framework-ai/1920.png: "Who does the work" group renders as four gist cards (Assistants, Masterminds, Minions, Agents & roles) right under the title.
- 3 "Servex is linked, not repeated; its 'It's parts' header goes" — yes — shots/127-0-0-1-58135-framework-servex/1920.png shows no such header (pre-existing, not touched by this diff); the AI page's claude-md tab links Servex rather than restating it.
- 4 "Don't build diagrams; reuse servex-docs notes if they help" — yes — no diagram code in the diff; task.jsonl's merge log says the servex-docs flowchart stays on hold and only its word-flow note was folded into "How it works together."
- 5 "Reference paths as ordinary links for now" — yes — every link in the diff (overview.js, concepts.js) is a plain `href`, no `@Servex/Heartbeat`-style token.
- 6 "Same top-tabs UI as the module docs" — yes — shots/monorepo-localhost-framework-ai/1920.png: an underlined-tab strip identical in style to the Servex doc tabs (shots/127-0-0-1-58135-framework-servex/1920.png).
- 7 "Very visually structured Overview: title → heading → gist → lists/grids/previews" — yes — shots/monorepo-localhost-framework-ai/1920.png: H1 "AI" → bold gist line → H2 "Who does the work" + its own gist line → a card grid.
- 8 "System overview: every part, how they work together, click through" — partial — concepts.js lists 12 concepts across 4 groups (who/tracked/lands/know) covering skills, CLAUDE.md, memory, tasks/cards, asks, agents & roles, voice, review-merge, heartbeat, Servex (referenced); not screenshotted past the first group, so "how the parts work together" is unverified on screen.
- 9 "Document every Claude skill, one child page each, built from SKILL.md, not copied" — not shot — skills.mjs now also reads questions.md per skill for a "The check" section; the Skills tab itself (cards grouped by KINDS, empty groups skipped) has no screenshot.
- 10 "Content authoring system, used on these pages" — yes — cards()/card()/flow() moved from ai/overview.js into ux/Content/structure/Structure.js and are visibly in use on the Overview (shots/monorepo-localhost-framework-ai/1920.png) and demoed on structure/page.js (shots/monorepo-localhost-framework-ux-Content-structure/1920.png, "Cards" and "Flow" boxes added by the diff, not confirmed on screen past the visible fold).
- 11 "Object-oriented UI proposal, routed to the architect" — not shot — not present in this diff; no evidence it was sent.
- 12 "Merge past system-design asks" — yes — task.jsonl's merge log: "Past system-design asks folded in: servex-docs ask 1 ... is the Overview's 'How it works together' list."
- 13 "Readme system page: what it points to, the chain, how Servex loads it, build order" — yes — concepts.js adds a "readmes" concept (group "know"); page.js's concept_page() draws `readme_chain()` live for it, and concepts.js's readme-chain bullets add "Switching directory" and "Build order" text; not screenshotted (the tile isn't in the shot's visible group).
- 14 "mastermind-servex-9 reviews, then land" — no — task.jsonl: still waiting on that review; not landed.
- 15 "A CLAUDE.md tab, the file shown live plus discussion" — no — see finding 1: not visible in the shots, though the diff's code adds it (code.file() rendering CLAUDE.md, plus "what goes in it" / "what goes one click down" / two audits).
- 16 "Every system shown by its effect, simple to complex" — yes (by source) — overview.js's Authoring tab now runs "Simple: a card grid" then "Complex: a whole system, shown by its effect" (the live readme_chain); not screenshotted.

## Page structure
- 1 — yes — shots/monorepo-localhost-framework-ai/1920.png: the bold line under "Overview" says what the page is ("The AI system: who does the work, what it knows...") before any tile.
- 2 — yes — same shot: the first thing under the title is the "Who does the work" card row.
- 3 — not measured past the fold — the visible order (what it is → who does it) matches priority; later groups (know/tracked/lands) aren't in the shot.
- 4 — n/a — no "done" state on this page to order against "open."
- 5 — n/a — the AI page is a top-level, already-reachable page; its own children (concept pages) are leaf:true by design per task.jsonl, so they're intentionally not in `children:`.
- 6 — yes (by source) — page.js routes each tab and each concept slug with its own url; not independently reloaded in this pass.
- 7 — yes — the page uses the same tabs() panel type as the Servex doc page, not page-specific CSS.
- 8 — yes — shots/monorepo-localhost-framework-ai/1920.png: "Assistants", "Masterminds" read as self-evident without more text.
- 9 — yes — no repeated neighbour text in the visible band; no lone small control on an empty row.
- 10 — yes — the concepts show as a card grid, not a sentence list.
- 11 — yes — "Who does the work" is followed by its own gist line, so the section is clear before the cards.
- 12 — n/a — this is new content, not a restructure of a working version.

## Navigation
- 13 — tabs (Overview/skills/objects/authoring, missing claude-md per finding 1), a rail (the left framework sidebar).
- 14 — no — layout.json tab_rows is 1 at every width for the 4 tabs actually shown, but the 5th (claude-md) is unverified, and the visible 4 already span the full row width at 400 (shots/.../400.png) — a 5th tab could push it to 2 rows there.
- 15 — yes (by source) — page.js routes each TABS entry, so each has its own url; not independently reloaded.
- 16 — yes — 5 tabs (once claude-md renders) stay flat, not stacked; sub-detail (each skill, each concept) is one click down, not another tab row.
- 17 — yes — shots/monorepo-localhost-framework-ai/3440.png: the framework rail sits beside a centred main column, and shots/.../400.png shows the rail collapsed behind the hamburger icon.
- 18 — yes — the rail's own scroll position is unaffected by tab switches (Page-level routing, not a rail rebuild).
- 19 — n/a — no bottom rail or fixed overlay on this page.
- 20 — n/a — no sheet or modal on this page.
- 21 — n/a — no full-screen mode on this page.
- 22 — yes — a concept tile opens its own page (concept_page(), routed), not an in-place expansion.

## Layout
- 1 — yes — shots/monorepo-localhost-framework-ai/3440.png: rail + a centred content column that stretches to use the width, not one narrow column on an empty screen.
- 2 — yes — Standard page with tabs, an approved type; layout.json layout: "standard" at every width.
- 3 — yes — cards use `.wide` with `minmax(13rem,1fr)` auto-fit, so width tracks content at 400/1200/1920/3440.
- 4 — yes — cards carry `.card` (framed box), the section itself is unpadded text.
- 5 — yes — shots/monorepo-localhost-framework-ai/1920.png: card text keeps clear margin from the card edge.
- 6 — n/a — no multi-column reading content on this tab; the card grid already lives in `.wide`.
- 7 — yes — layout.json bands: every band's `big_empty` is false at every width for both shot pages.
- 8 — n/a — the visible row (4 cards) is even; no short column.
- 9 — yes — the wide card track, not the reading column, absorbs the extra width at 3440.
- 10 — yes — card icons and text stay a fixed comfortable size across 400–3440; nothing balloons.
- 11 — yes — shots/.../1920.png and /3440.png: the 4-card row ends full both times (no lone card).
- 12 — yes — the cards are separate rounded boxes with a visible gap (`.card flex v gap-35` in a `gap` grid), not flush-stacked.

## Sizing
- 13 — yes — cards are auto height (`flex v gap-35`), no fixed height set.
- 14 — n/a — no media previews on this tab.
- 15 — n/a — no bounded/scrolling box on this tab.
- 16 — yes — no stray scrollbar in any of the four shots; the page just scrolls normally (long page).
- 17 — yes — the page-title band is 40–59px (0.04–0.059 share) across widths, well under pushing the tab row down.
- 18 — yes — layout.json overflow_x is false at every width for both shot pages.
- 19 — not measured — card padding (`gap-35`) is a spacing-clamp rung, not `em`/`rem` control sizing; can't confirm from the shot alone.

## Wrapping
- 20 — yes — layout.json wraps at 1200/1920/3440 list only global chrome (mode-btn, drawer-menu), not this page's tab row or title; at 400 the tab row itself isn't in the wraps list either (tab_rows 1).
- 21 — n/a — no wrap appears at 1920 that wasn't already there at 1200 (the wraps lists are the same generic chrome at both).
- 22 — n/a — no control/chip row on this tab.
- 23 — yes — shots/monorepo-localhost-framework-ai/400.png: each card stacks full-width, one per row.
- 24 — n/a — no preview shown at two different widths on this page.

## Spacing and padding
- 1 — no — see finding 2: layout.json left_stack.p.total is 56px (3.5em) at 400, over the 3em cap.
- 2 — no — same measurement: two `.page` layers stack (28+28), which is exactly the nested-padded-box pattern the rule warns about, even though it's the title's own wrapper, not a second content box.
- 3 — yes — cards carry `.card`; the page body itself has no `.pad`.
- 4 — yes — shots/.../400.png: the "Overview" heading and paragraph keep clear margin from the viewport edge (the 56px in question 1 is too much, not zero).
- 5 — not measured — can't tell from a screenshot whether gaps are clamp tokens or constants; no inline px values are visible in the diff's card/grid CSS (`gap: "var(--gap, 1rem)"`, `gap-35`).
- 6 — yes — `gap-35` on cards is the framework's own em-based control spacing, not a raw value.
- 7 — yes — cards (`--surface`/card background) sit on the page's own wash; they read as boxes, not floating text.
- 8 — n/a — no bled container on this page.
- 9 — not measured — can't confirm layer names from a screenshot; the diff's new CSS is inline JS `.style()` calls (grid-template-columns, gap), not new stylesheet rules, so the layer question doesn't apply to it.
- 10 — yes — the diff reuses `.card`, `.wide`, `.flex`, `gap-35` throughout; no new CSS class is introduced.

## Colour and contrast
- 11 — yes, not measured — shots show dark ink on a light card/page ground at a glance; no contrast tool was run.
- 12 — n/a — no accent-coloured text visible in the shot.
- 13 — yes — card styling uses `var(--ink)` and the framework's card/background tokens, no literal colours in the diff.
- 14 — yes — shots/.../1920.png: cards read visibly whiter than the page's grey ground.
- 15 — not measured — dark mode wasn't shot; the diff adds no new literal colours, so it should inherit the page's existing light/dark tokens.
- 16 — yes — the tab strip and the card section read as one page, same ground throughout.
- 17 — n/a — no repeated anchor mark (eyebrow) used on this page.
- 18 — yes — gist text under each card name uses `small.c("muted", ...)`, the `.muted` class, per Structure.js.

## Flow
- 25 — yes — shots/monorepo-localhost-framework-ai/1920.png: title, then gist, then "who does the work" — priority order, most important first.
- 26 — yes — layout.json overflow_x is false at every width; nothing runs past the right edge.
- 27 — yes — the card grid uses one grid rhythm; the prose paragraph above it uses plain flow.
- 28 — yes — each card's gist sits directly under its own name, clearly inside that card, not ambiguous between neighbours.
- 29 — n/a — this isn't a live-updating page.
- 30 — yes — layout.json widest_text tops out at 733px at 3440 on a page that wide; well under overflow.
- 31 — n/a — no dev-shell/frame chrome change in this diff.

## Words
- 1 — yes — the AI system is shown as a card grid before any explaining sentence.
- 2 — yes — grouping (who/tracked/lands/know) and card layout carry the structure; no sentence restates "here are the groups."
- 3 — yes — the visible paragraphs (the gist line, each card's one-line gist) are all well under 60 words.
- 4 — yes — shots/monorepo-localhost-framework-ai/1920.png: title, one bold sentence, then cards — readable in well under ten seconds.
- 5 — yes — "Assistants", "Masterminds", "Minions", "Agents & roles" each name exactly their thing.
- 6 — n/a — no picture with a caption on the shot part of this page.
- 7 — yes — "Servex", "AI system", "mastermind" are used consistently across the visible text and concepts.js.
- 8 — yes — each card links to its own concept page; the claude-md tab's audit cards (per source) link Server, Servex, the ai/ log, asks, readmes, watch.md.
- 9 — yes (by source) — the claude-md tab pairs the live file (`code.file()`) beside the discussion text, per CLAUDE.md's "show it with the widget, then use words"; not screenshotted.
- 10 — yes — the card grid (what this is made of) leads; detail (each concept's full text) is one click down on its own page.
- 11 — yes — sentences like "A mastermind owns work end to end: it decides, splits the work, and judges what comes back" are full, plain sentences, no clipped fragments.
