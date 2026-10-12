# vision-after — the layout wave, re-shot

18 page-level shots, 6 pages × 390/1280/3440, sonnet `critique-full-v1`, **$1.42** (est $1.30, ceiling $2).
Before: [`../vision-pilot/vision.jsonl`](../vision-pilot/vision.jsonl) · after: [`vision.jsonl`](./vision.jsonl) ·
browse: [/framework/ext/DesignTool/vision/?run=/framework/ai/2026-08-17/vision-after/](/framework/ext/DesignTool/vision/?run=/framework/ai/2026-08-17/vision-after/)

## Broken: 34 → 29

| page | 390 | 1280 | 3440 | before → after |
|---|---|---|---|---|
| `/framework/` | 2→1 | 1→1 | 2→3 | **5 → 5** |
| `/framework/ai/` | 1→2 | 1→1 | 1→3 | **3 → 6** |
| `/framework/ai/2026-08-17/` | 2→2 | 2→1 | 2→2 | **6 → 5** |
| `/framework/ext/DesignTool/` | 2→2 | 1→1 | 3→0 | **6 → 3** |
| `/framework/ui/` | 3→2 | 3→1 | 2→2 | **8 → 5** |
| `/framework/web/` (a 404) | 2→2 | 2→1 | 2→2 | **6 → 5** |
| | | | | **34 → 29** |

Summed over the 18 pairs: 34 → 29. All findings: 92 → 81. Judged by meaning, not string:
**21 gone · 13 still · 16 new.** Net −5 is a poor headline for a wave that fixed 21 real defects —
it landed six new rules and three of them cost more than one of the old ones did.

## The clusters

| # | cause (file:line) | shots | class |
|---|---|---|---|
| 1 | `ext/AITask/ai.css:14` `.ai-day-line { white-space: nowrap; …ellipsis }` meets `Page.css:79` `--measure: 40em`. Emitted by `dashboard.js:115` into `main` = 600px at **every** width, so a ~110-char row clips identically at 390, 1280 and 3440. Verified in `shots/729f82735f51ceec.png`: every row cut at x=910. | 4 | broken |
| 2 | `Page.css:155-167` `@container page (width<38em)` turns a rail into a card strip. `/framework/ui/`'s rail is **filters**, not cards: at 390 the search box is a 176px empty square and all five filters sit off-screen behind a 2px orange sliver (`shots/1b78415a6d1b4585.png`). Before the wave all five were visible rows. | 2 | broken |
| 3 | `ext/tabs/tabs.css:27-31` — `overflow:auto; scrollbar-width:thin` shipped as the clipping fix and **is not one**: `shots/8b873aec76d74ace.png` shows "KNOWLEDGE" then a sliced glyph at the frame edge, no bar painted. A horizontal scrollbar is invisible in a screenshot and on a trackpad. Both before-rows survive verbatim. | 3 | broken |
| 4 | `--subtle` (framework.css) on `.ai-tag` `ai.css:174`, `.page-preview-desc` `Page.css:316`, `.tab` `tabs.css:41`, sidebar groups. Reported on **6 of 6 pages, before and after** — the most-repeated finding in both runs, now escalating to broken. One value. | 3 + ~14 maybe | broken |
| 5 | `Page.css:86-88` gives `wide` all the leftover, but only a page that *says* `.wide` spends it. At 1280 the day page and DesignTool both stop at x=910 with 370px of grey; `/framework/` @3440 escalated maybe→broken. Failure mode 2 of the proposal, landing. | 1 + 6 maybe | maybe |
| 6 | `Page.css:195-202` `.stage` reserves a 12em box whether the live call draws anything or not — Panel, Accordion and Breadcrumbs draw white voids. `Page.css:338` `span 2` makes the Stat-tiles card double-width with the same empty interior. The defect is the component's preview; the CSS half is `span 2`. | 4 | broken |
| 7 | `public/styles.css:89` `.page.topic { --measure: none }` + three inline `max-width:52em` in `framework/page.js:57,78,86`; the unlabeled clock band is `framework/page.js:64`. New at 1280: `styles.css:69` `.code-block { padding: 2em }` reads as an empty dark void under two lines. | 4 | 3 broken / 1 maybe |
| 8 | `/framework/web/` **does not exist** — the guide tier is `public/web/`, and `framework/page.js:14` never names it. 3 of 18 shots are the app's 404 page. Its 5 broken rows are `core/App`'s error view, not layout. | 5 | corpus defect |

## The next wave, ranked

| # | fix | heals | class | cost |
|---|---|---|---|---|
| 1 | `.ai-day-line` drops `white-space: nowrap` for `-webkit-line-clamp: 1` — or the strip claims `wide`. | 4 | broken | S |
| 2 | Scope the strip: `@container page (width<38em) { .rail:has(> .page-preview) { flex-direction: row … } }`. A rail of controls stacks. **Not a sixth word** — one `:has()` on a rule that already exists. | 2 | broken | S |
| 3 | Raise `--subtle` one step in `framework.css` and re-shoot. Site-wide, one token, 6/6 pages. | 3 + 14 | broken | S |
| 4 | `.tab-bar { mask-image: linear-gradient(90deg,#000 calc(100% - 2em),transparent) }` — a fade says "more", a scrollbar does not. | 3 | broken | S |
| 5 | Swap `/framework/web/` for `/web/` in the corpus and re-baseline. Three shots currently measure an error page. | 5 | corpus | S |
| 6 | Delete `Page.css:338` `span 2` + `:345-347`'s undo; give Panel/Accordion/Breadcrumbs a real preview call. | 4 | broken (JS) | M |
| 7 | `styles.css:89` `.page.topic { --measure: 40em }` and delete the three inline `52em`; label the clock band with an `h2`. | 4 | maybe | M |
| 8 | The `wide` authoring pass — ~210 `page.js` claiming `wide` for tables, walls and logs. **Needs Mike's Before/After**: it is the proposal's own failure mode 2 and cannot be judged from CSS. | 7 | maybe | L |

## Delete

- `ext/tabs/tabs.css:29` `scrollbar-width: thin` — landed as a fix, measurably is not one (#4 replaces it).
- `ext/AITask/ai.css:14` `white-space: nowrap` — its own comment says it bounds a row; `line-clamp` does that without clipping mid-word at 3440.
- `core/Page/Page.css:338` `.page-preview:is(.two,.big){ grid-column: span 2 }` and `:345-347`, the `@media` that undoes it. One card uses it and draws a void.
- `core/Page/Page.css:214-215` `.page.full` / `.page.fill` aliases — nothing in this run needs them; the wave's own "deletes on accept".
- `/framework/web/` from the vision corpus.

## Sixth-word flags (stop, not fix)

None of the eight above needs one. `ai.css`'s two `:has()` arrangement rules (hidden-when-routed, whole-page-when-not)
are still the standing risk, unchanged from `layout-primitives`' OPEN list — and `ai-board-fix` **fixed** the two
defects they exist for (the board no longer draws twice; the out-of-order time group is gone). Adopting `.rail`
in `dashboard.js:130` is still one word.

*`../vision-prompts/note.md` does not exist yet — that task has only `requirements.md` and `task.jsonl`, so no
cross-prompt comparison is available.*
